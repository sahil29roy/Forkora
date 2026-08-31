CREATE TABLE content_versions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    version_label VARCHAR(100) NOT NULL UNIQUE CONSTRAINT chk_content_versions_label_not_empty CHECK (length(trim(version_label)) > 0),
    status content_status NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    CONSTRAINT chk_content_versions_published_at CHECK (published_at IS NULL OR published_at >= created_at)
);

CREATE INDEX idx_content_versions_status ON content_versions(status);
CREATE INDEX idx_content_versions_created_by ON content_versions(created_by);
