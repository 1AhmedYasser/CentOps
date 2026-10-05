export const GLOBAL_CONSTANTS = {
    BASE_URL: 'http://localhost:9050',
    API_PREFIX: '/centops',
    PAGE: 1,
    PAGE_SIZE: 1,
    UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
};

export const CLIENT_TEST_DATA = {
    CERTIFICATE: "-----BEGIN CERTIFICATE-----\nMOCK\n-----END CERTIFICATE-----",
    CLUSTER_ID: "75c24660-3df8-4ca5-a9a8-2145cf19ba1d",
    CLUSTER_NAMESPACE: "default",
    ARGO_DEPLOYMENT_NAME: "testDeployment",
    PART_OF_NETWORK: true
};

export const USER_TEST_DATA = {
    DEFAULT_FIRST_NAME: "John",
    DEFAULT_LAST_NAME: "Doe",
    DEFAULT_ID_CODE: "1234567890",
    UPDATED_FIRST_NAME: "Johnnnnnnnnn",
    UPDATED_LAST_NAME: "SmithhhhhhhhhhhhhHHHHHHHHHHHH",
    UPDATED_ID_CODE: "123123123"
};

export const CLUSTER_TEST_DATA = {
    IP_ADDRESS: "192.168.1.100",
    UPDATED_IP_ADDRESS: "192.168.1.200"
};

export const DOCUMENTATION_TEST_DATA = {
    INITIAL_CONTENT: "aaaa123123",
    UPDATED_CONTENT: "updated-documentation-content"
};

export const ENDPOINTS = {
    AUTH: '/auth/login',
    CLIENTS: {
        BASE: '/admin/clients',
        BY_ID: '/admin/client-by-id',
        MINIMAL: '/integration/clients'
    },
    COMMON_KNOWLEDGE_BASES: '/integration/common-knowledge-bases',
    USERS: {
        BASE: '/admin/users',
        BY_ID: '/admin/user-by-id'
    },
    CLUSTERS: {
        BASE: '/admin/clusters',
        BY_ID: '/admin/cluster-by-id'
    },
    DOCUMENTATION: {
        BASE: '/admin/documentations'
    },
    CERTIFICATES: {
        BASE: '/admin/clients/certificates',
        DOWNLOAD: '/admin/clients/certificates/download',
        GENERATE: '/admin/clients/certificates/generate'
    },
    LOGS: {
        USER: '/admin/logs/user',
        SECRETS: '/admin/logs/secrets'
    },
    MANIFESTS: {
        CREATE: '/admin/clients/manifests/create',
        UPDATE: '/admin/clients/manifests/update',
        DUPLICATE: '/admin/clients/manifests/duplicate',
        GET_BY_ID: '/admin/clients/manifests/get',
        GET_ALL_BY_CLIENT_ID: '/admin/clients/manifests/all',
        DELETE: '/admin/clients/manifests/delete',
    },
};