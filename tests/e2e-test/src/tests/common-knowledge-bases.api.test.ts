import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'crypto';
import { getPgClient } from '../setup/pgPool';
import { ENDPOINTS, GLOBAL_CONSTANTS, HTTP_METHODS } from '../setup/config';

const BASE_ENDPOINT = `${GLOBAL_CONSTANTS.BASE_URL}${GLOBAL_CONSTANTS.API_PREFIX}${ENDPOINTS.COMMON_KNOWLEDGE_BASES}`;

const ckbClientId = randomUUID();
const otherClientId = randomUUID();
const clientName = `ckb-test-client-${Date.now()}`;

const ckbCredentials = { key: `ckb-key-${Date.now()}`, secret: 'ckb-secret' };
const gcCredentials = { key: `gc-key-${Date.now()}`, secret: 'gc-secret' };
const disabledCredentials = { key: `disabled-key-${Date.now()}`, secret: 'disabled-secret' };

const basicAuth = ({ key, secret }: { key: string; secret: string }) =>
    Buffer.from(`${key}:${secret}`).toString('base64');

const request = async (path: string, method: string, authorization?: string, body?: any) =>
    fetch(`${BASE_ENDPOINT}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(authorization ? { authorization } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    });

let pgClient;

const insertApiClient = async (
    credentials: { key: string; secret: string },
    clientId: string | null,
    roles: string[] | null,
    isEnabled = true
) => {
    await pgClient.query(
        `INSERT INTO api_clients (api_key, api_secret, is_enabled, client_id, api_roles)
         VALUES (encode(convert_to($1, 'UTF8'), 'base64'),
                 encode(convert_to($2, 'UTF8'), 'base64'),
                 $3, $4, $5::api_role[])`,
        [credentials.key, credentials.secret, isEnabled, clientId, roles]
    );
};

beforeAll(async () => {
    pgClient = await getPgClient();

    await pgClient.query(
        `INSERT INTO clients (client_id, name, part_of_network) VALUES ($1, $2, true)`,
        [ckbClientId, clientName]
    );
    await insertApiClient(ckbCredentials, ckbClientId, ['COMMON_KNOWLEDGE_BASE']);
    await insertApiClient(gcCredentials, null, ['GLOBAL_CLASSIFIER']);
    await insertApiClient(disabledCredentials, ckbClientId, ['COMMON_KNOWLEDGE_BASE'], false);
});

afterAll(async () => {
    await pgClient.query(`DELETE FROM ckb_information WHERE client_id IN ($1, $2)`, [ckbClientId, otherClientId]);
    await pgClient.query(`DELETE FROM api_clients WHERE api_key IN ($1, $2, $3)`, [
        Buffer.from(ckbCredentials.key).toString('base64'),
        Buffer.from(gcCredentials.key).toString('base64'),
        Buffer.from(disabledCredentials.key).toString('base64')
    ]);
    await pgClient.query(`DELETE FROM clients WHERE client_id = $1`, [ckbClientId]);
});

describe('Common Knowledge Base information E2E', () => {
    const firstPayload = { presigned_url: 'https://s3.example.com/ckb/v1', presigned_url_etag: 'etag-v1' };
    const secondPayload = { presigned_url: 'https://s3.example.com/ckb/v2', presigned_url_etag: 'etag-v2' };
    let firstCreatedAt: string;

    describe('PUT /centops/integration/common-knowledge-bases/{client_id}', () => {
        it('should return 401 without authorization header', async () => {
            const response = await request(`/${ckbClientId}`, HTTP_METHODS.PUT, undefined, firstPayload);
            expect(response.status).toBe(401);
        });

        it('should return 401 with invalid credentials', async () => {
            const response = await request(
                `/${ckbClientId}`,
                HTTP_METHODS.PUT,
                basicAuth({ key: 'unknown', secret: 'unknown' }),
                firstPayload
            );
            expect(response.status).toBe(401);
        });

        it('should return 401 for a disabled api client', async () => {
            const response = await request(`/${ckbClientId}`, HTTP_METHODS.PUT, basicAuth(disabledCredentials), firstPayload);
            expect(response.status).toBe(401);
        });

        it('should return 400 when payload is missing fields', async () => {
            const response = await request(`/${ckbClientId}`, HTTP_METHODS.PUT, basicAuth(ckbCredentials), {
                presigned_url: firstPayload.presigned_url
            });
            expect(response.status).toBe(400);
        });

        it('should return 403 for GLOBAL_CLASSIFIER role', async () => {
            const response = await request(`/${ckbClientId}`, HTTP_METHODS.PUT, basicAuth(gcCredentials), firstPayload);
            expect(response.status).toBe(403);
        });

        it('should return 403 when updating another client', async () => {
            const response = await request(`/${otherClientId}`, HTTP_METHODS.PUT, basicAuth(ckbCredentials), firstPayload);
            expect(response.status).toBe(403);
        });

        it('should insert the first state for own client', async () => {
            const response = await request(`/${ckbClientId}`, HTTP_METHODS.PUT, basicAuth(ckbCredentials), firstPayload);
            expect(response.status).toBe(200);

            const { response: data } = await response.json();
            expect(data).toMatchObject({
                clientId: ckbClientId,
                presignedUrl: firstPayload.presigned_url,
                presignedUrlEtag: firstPayload.presigned_url_etag
            });
            expect(data.createdAt).toBeDefined();
            expect(data.updatedAt).toBeDefined();
            firstCreatedAt = data.createdAt;
        });

        it('should append a new row on update and keep created_at', async () => {
            await new Promise((resolve) => setTimeout(resolve, 50));
            const response = await request(`/${ckbClientId}`, HTTP_METHODS.PUT, basicAuth(ckbCredentials), secondPayload);
            expect(response.status).toBe(200);

            const { response: data } = await response.json();
            expect(data.presignedUrl).toBe(secondPayload.presigned_url);
            expect(data.createdAt).toBe(firstCreatedAt);
            expect(data.updatedAt).not.toBe(firstCreatedAt);

            const result = await pgClient.query(
                `SELECT presigned_url FROM ckb_information WHERE client_id = $1 ORDER BY id`,
                [ckbClientId]
            );
            expect(result.rows.map((row) => row.presigned_url)).toEqual([
                firstPayload.presigned_url,
                secondPayload.presigned_url
            ]);
        });
    });

    describe('GET /centops/integration/common-knowledge-bases/{client_id}', () => {
        it('should return the current state for own client', async () => {
            const response = await request(`/${ckbClientId}`, HTTP_METHODS.GET, basicAuth(ckbCredentials));
            expect(response.status).toBe(200);

            const { response: data } = await response.json();
            expect(data).toMatchObject({
                clientId: ckbClientId,
                presignedUrl: secondPayload.presigned_url,
                presignedUrlEtag: secondPayload.presigned_url_etag,
                createdAt: firstCreatedAt
            });
        });

        it('should return 403 for another client', async () => {
            const response = await request(`/${otherClientId}`, HTTP_METHODS.GET, basicAuth(ckbCredentials));
            expect(response.status).toBe(403);
        });

        it('should return 403 for GLOBAL_CLASSIFIER role', async () => {
            const response = await request(`/${ckbClientId}`, HTTP_METHODS.GET, basicAuth(gcCredentials));
            expect(response.status).toBe(403);
        });

        it('should return 401 without authorization header', async () => {
            const response = await request(`/${ckbClientId}`, HTTP_METHODS.GET);
            expect(response.status).toBe(401);
        });
    });

    describe('GET /centops/integration/common-knowledge-bases', () => {
        it('should return 403 for COMMON_KNOWLEDGE_BASE role', async () => {
            const response = await request('', HTTP_METHODS.GET, basicAuth(ckbCredentials));
            expect(response.status).toBe(403);
        });

        it('should return 401 without authorization header', async () => {
            const response = await request('', HTTP_METHODS.GET);
            expect(response.status).toBe(401);
        });

        it('should list the current state per client with client name and network flag', async () => {
            const response = await request('', HTTP_METHODS.GET, basicAuth(gcCredentials));
            expect(response.status).toBe(200);

            const { response: data } = await response.json();
            const entries = data.filter((entry) => entry.clientId === ckbClientId);
            expect(entries).toHaveLength(1);
            expect(entries[0]).toMatchObject({
                clientId: ckbClientId,
                clientName,
                partOfNetwork: true,
                presignedUrl: secondPayload.presigned_url,
                presignedUrlEtag: secondPayload.presigned_url_etag,
                createdAt: firstCreatedAt
            });
        });
    });
});
