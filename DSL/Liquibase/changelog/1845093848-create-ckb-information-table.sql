-- liquibase formatted sql
-- changeset ahmedyasser:1845093848

CREATE TABLE ckb_information
(
    id                 BIGSERIAL PRIMARY KEY,
    client_id          UUID      NOT NULL,
    presigned_url      TEXT      NOT NULL,
    presigned_url_etag TEXT      NOT NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_ckb_information_client_id_id ON ckb_information (client_id, id DESC);
