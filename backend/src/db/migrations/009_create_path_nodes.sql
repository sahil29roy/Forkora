CREATE TABLE path_nodes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kind node_kind NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE CONSTRAINT chk_path_nodes_code_not_empty CHECK (length(trim(code)) > 0),
    title VARCHAR(255) NOT NULL CONSTRAINT chk_path_nodes_title_not_empty CHECK (length(trim(title)) > 0),
    description TEXT NOT NULL CONSTRAINT chk_path_nodes_desc_not_empty CHECK (length(trim(description)) > 0),
    typical_duration_months SMALLINT CONSTRAINT chk_path_nodes_duration CHECK (typical_duration_months IS NULL OR typical_duration_months > 0),
    class_level SMALLINT CONSTRAINT chk_path_nodes_class_level CHECK (class_level IS NULL OR (class_level >= 1 AND class_level <= 12)),
    content_version_id INTEGER REFERENCES content_versions(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_path_nodes_kind_published ON path_nodes(kind, is_published);
CREATE INDEX idx_path_nodes_version ON path_nodes(content_version_id);
CREATE INDEX idx_path_nodes_class_level ON path_nodes(class_level);

CREATE TRIGGER trg_path_nodes_updated_at
BEFORE UPDATE ON path_nodes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
