INSERT INTO ckb_information (client_id,
                             presigned_url,
                             presigned_url_etag,
                             created_at,
                             updated_at)
VALUES (:client_id::uuid,
        :presigned_url,
        :presigned_url_etag,
        now(),
        now())
ON CONFLICT (client_id) DO UPDATE
    SET presigned_url      = EXCLUDED.presigned_url,
        presigned_url_etag = EXCLUDED.presigned_url_etag,
        updated_at         = now()
RETURNING client_id, presigned_url, presigned_url_etag, created_at, updated_at;
