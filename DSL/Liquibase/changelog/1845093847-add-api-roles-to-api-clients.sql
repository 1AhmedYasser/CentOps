-- liquibase formatted sql
-- changeset ahmedyasser:1845093847

CREATE TYPE api_role AS ENUM ('COMMON_KNOWLEDGE_BASE', 'GLOBAL_CLASSIFIER');

ALTER TABLE api_clients
    ADD COLUMN client_id UUID,
    ADD COLUMN api_roles api_role[];

CREATE INDEX idx_api_clients_client_id ON api_clients (client_id);
