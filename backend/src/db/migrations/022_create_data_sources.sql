CREATE TABLE data_sources (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE CONSTRAINT chk_data_sources_name_not_empty CHECK (length(trim(name)) > 0),
    source_type VARCHAR(100) NOT NULL CONSTRAINT chk_data_sources_type_not_empty CHECK (length(trim(source_type)) > 0),
    url VARCHAR(500) CONSTRAINT chk_data_sources_url_valid CHECK (url IS NULL OR url ~* '^https?://[A-Za-z0-9.-]+\.[A-Za-z]{2,}.*$'),
    description TEXT,
    last_refreshed_on DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_data_sources_type ON data_sources(source_type);
