CREATE TABLE rules (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE CONSTRAINT chk_rules_code_not_empty CHECK (length(trim(code)) > 0),
    name VARCHAR(255) NOT NULL CONSTRAINT chk_rules_name_not_empty CHECK (length(trim(name)) > 0),
    type rule_type NOT NULL,
    definition JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    content_version_id INTEGER REFERENCES content_versions(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rules_type_active ON rules(type, is_active);
CREATE INDEX idx_rules_version ON rules(content_version_id);
