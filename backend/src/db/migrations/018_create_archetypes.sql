CREATE TABLE archetypes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE CONSTRAINT chk_archetypes_code_not_empty CHECK (length(trim(code)) > 0),
    name VARCHAR(255) NOT NULL CONSTRAINT chk_archetypes_name_not_empty CHECK (length(trim(name)) > 0),
    description TEXT,
    cluster_label INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_archetypes_cluster ON archetypes(cluster_label);
