INSERT INTO ckb_information (client_id,
                             presigned_url,
                             presigned_url_etag,
                             created_at,
                             updated_at)
VALUES (:client_id::uuid,
        :presigned_url,
        :presigned_url_etag,
        COALESCE((SELECT min(created_at) FROM ckb_information WHERE client_id = :client_id::uuid), now()),
        now())
RETURNING client_id, presigned_url, presigned_url_etag, created_at, updated_at;
