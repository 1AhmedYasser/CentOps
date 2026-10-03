SELECT client_id,
       COALESCE(api_roles::TEXT[], '{}') AS api_roles
FROM api_clients
WHERE api_key = :api_key
  AND api_secret = :api_secret
  AND is_enabled = true
LIMIT 1;
