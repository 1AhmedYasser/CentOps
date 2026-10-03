-- liquibase formatted sql
-- changeset ahmedyasser:1845093848

CREATE TABLE ckb_information
(
    client_id          UUID PRIMARY KEY,
    presigned_url      TEXT      NOT NULL,
    presigned_url_etag TEXT      NOT NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP NOT NULL DEFAULT now()
);
