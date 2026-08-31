CREATE TABLE questionnaires (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    version VARCHAR(50) NOT NULL UNIQUE CONSTRAINT chk_questionnaires_version_not_empty CHECK (length(trim(version)) > 0),
    title VARCHAR(255) NOT NULL CONSTRAINT chk_questionnaires_title_not_empty CHECK (length(trim(title)) > 0),
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questionnaires_active ON questionnaires(is_active);
