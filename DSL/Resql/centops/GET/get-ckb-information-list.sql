SELECT ckb.client_id,
       c.name AS client_name,
       COALESCE(c.part_of_network, FALSE) AS part_of_network,
       ckb.presigned_url,
       ckb.presigned_url_etag,
       ckb.created_at,
       ckb.updated_at
FROM ckb_information ckb
         LEFT JOIN clients c
                   ON c.client_id = ckb.client_id
                       AND c.id = (SELECT max(id) FROM clients WHERE client_id = ckb.client_id)
WHERE ckb.id = (SELECT max(id) FROM ckb_information WHERE client_id = ckb.client_id)
  AND c.deleted IS DISTINCT FROM TRUE
ORDER BY ckb.updated_at DESC;
