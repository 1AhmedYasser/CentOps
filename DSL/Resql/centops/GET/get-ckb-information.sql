SELECT client_id,
       presigned_url,
       presigned_url_etag,
       created_at,
       updated_at
FROM ckb_information
WHERE client_id = :client_id::uuid;
