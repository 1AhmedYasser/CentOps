-- liquibase formatted sql
-- changeset ahmedyasser:1687150696

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "hstore";

CREATE TABLE manifests_history (
  id BIGSERIAL PRIMARY KEY,
  parent_manifest_id uuid NOT NULL,
  buerokratt_version TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  components JSONB NOT NULL DEFAULT '{}',
  extra_configs JSONB NOT NULL DEFAULT '{}',
  security_configs JSONB NOT NULL DEFAULT '{}',
  type manifest_history_type NOT NULL,
  status manifest_status NOT NULL
);
