import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'crypto';
import { getPgClient } from '../setup/pgPool';
import { ENDPOINTS, GLOBAL_CONSTANTS, HTTP_METHODS } from '../setup/config';

const BASE_URL = `${GLOBAL_CONSTANTS.BASE_URL}${GLOBAL_CONSTANTS.API_PREFIX}${ENDPOINTS.COMMON_KNOWLEDGE_BASES}`;
const clientId = randomUUID();
const otherClientId = randomUUID();
const clientName = `ckb-client-${Date.now()}`;

const CKB = { key: `ckb-${Date.now()}`, secret: 'ckb-secret' };
const GC = { key: `gc-${Date.now()}`, secret: 'gc-secret' };
const auth = ({ key, secret }: typeof CKB) => Buffer.from(`${key}:${secret}`).toString('base64');

const request = (path: string, method: string, creds?: typeof CKB, body?: object) =>
    fetch(`${BASE_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(creds && { authorization: auth(creds) }) },
        body: body && JSON.stringify(body)
    });

const v1 = { presigned_url: 'https://s3.example.com/ckb/v1', presigned_url_etag: 'etag-v1' };
const v2 = { presigned_url: 'https://s3.example.com/ckb/v2', presigned_url_etag: 'etag-v2' };

let pgClient;
let createdAt: string;

beforeAll(async () => {
    pgClient = await getPgClient();
    await pgClient.query(`INSERT INTO clients (client_id, name, part_of_network) VALUES ($1, $2, true)`, [clientId, clientName]);
    const insertApiClient = `INSERT INTO api_clients (api_key, api_secret, client_id, api_roles)
        VALUES (encode(convert_to($1, 'UTF8'), 'base64'), encode(convert_to($2, 'UTF8'), 'base64'), $3, $4::api_role[])`;
    await pgClient.query(insertApiClient, [CKB.key, CKB.secret, clientId, ['COMMON_KNOWLEDGE_BASE']]);
    await pgClient.query(insertApiClient, [GC.key, GC.secret, null, ['GLOBAL_CLASSIFIER']]);
});

afterAll(async () => {
    await pgClient.query(`DELETE FROM ckb_information WHERE client_id = $1`, [clientId]);
    await pgClient.query(`DELETE FROM api_clients WHERE api_key = ANY($1)`, [[CKB.key, GC.key].map((k) => Buffer.from(k).toString('base64'))]);
    await pgClient.query(`DELETE FROM clients WHERE client_id = $1`, [clientId]);
});

describe('Common Knowledge Bases E2E', () => {
    it.each([
        ['PUT without auth', HTTP_METHODS.PUT, `?client_id=${clientId}`, undefined, v1, 401],
        ['PUT with missing etag', HTTP_METHODS.PUT, `?client_id=${clientId}`, CKB, { presigned_url: v1.presigned_url }, 400],
        ['PUT with GLOBAL_CLASSIFIER role', HTTP_METHODS.PUT, `?client_id=${clientId}`, GC, v1, 403],
        ['PUT for another client', HTTP_METHODS.PUT, `?client_id=${otherClientId}`, CKB, v1, 403],
        ['GET single for another client', HTTP_METHODS.GET, `?client_id=${otherClientId}`, CKB, undefined, 403],
        ['GET list with COMMON_KNOWLEDGE_BASE role', HTTP_METHODS.GET, '', CKB, undefined, 403]
    ])('should reject %s', async (_, method, path, creds, body, status) => {
        const response = await request(path, method, creds, body);
        expect(response.status).toBe(status);
    });

    it('should insert CKB information for own client', async () => {
        const response = await request(`?client_id=${clientId}`, HTTP_METHODS.PUT, CKB, v1);
        expect(response.status).toBe(200);

        const { response: data } = await response.json();
        expect(data).toMatchObject({ clientId, presignedUrl: v1.presigned_url, presignedUrlEtag: v1.presigned_url_etag });
        createdAt = data.createdAt;
    });

    it('should append a new version on update and keep createdAt', async () => {
        const response = await request(`?client_id=${clientId}`, HTTP_METHODS.PUT, CKB, v2);
        expect(response.status).toBe(200);
        expect((await response.json()).response).toMatchObject({ presignedUrl: v2.presigned_url, createdAt });

        const { rows } = await pgClient.query(`SELECT count(*)::int AS count FROM ckb_information WHERE client_id = $1`, [clientId]);
        expect(rows[0].count).toBe(2);
    });

    it('should return latest CKB information for own client', async () => {
        const response = await request(`?client_id=${clientId}`, HTTP_METHODS.GET, CKB);
        expect(response.status).toBe(200);
        expect((await response.json()).response).toMatchObject({ clientId, presignedUrl: v2.presigned_url, createdAt });
    });

    it('should list latest CKB information per client for GLOBAL_CLASSIFIER', async () => {
        const response = await request('', HTTP_METHODS.GET, GC);
        expect(response.status).toBe(200);

        const { response: data } = await response.json();
        const entries = data.filter((entry) => entry.clientId === clientId);
        expect(entries).toEqual([
            expect.objectContaining({ clientName, partOfNetwork: true, presignedUrl: v2.presigned_url, createdAt })
        ]);
    });
});
