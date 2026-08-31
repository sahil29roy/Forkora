CREATE TABLE path_edges (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    from_node_id INTEGER NOT NULL REFERENCES path_nodes(id) ON DELETE CASCADE,
    to_node_id INTEGER NOT NULL REFERENCES path_nodes(id) ON DELETE CASCADE,
    transition_type transition_type NOT NULL,
    reversibility reversibility NOT NULL,
    reversibility_score DECIMAL(5,2),
    switch_cost switch_cost,
    requires_exam BOOLEAN NOT NULL DEFAULT false,
    rationale TEXT,
    content_version_id INTEGER REFERENCES content_versions(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reversibility_score CHECK (reversibility_score IS NULL OR (reversibility_score >= 0.00 AND reversibility_score <= 100.00)),
    CONSTRAINT chk_path_edges_no_self_loops CHECK (from_node_id <> to_node_id)
);

CREATE INDEX idx_path_edges_from ON path_edges(from_node_id);
CREATE INDEX idx_path_edges_to ON path_edges(to_node_id);
CREATE INDEX idx_path_edges_from_to ON path_edges(from_node_id, to_node_id);
CREATE INDEX idx_path_edges_reversibility ON path_edges(reversibility);
CREATE INDEX idx_path_edges_version ON path_edges(content_version_id);

CREATE TRIGGER trg_path_edges_updated_at
BEFORE UPDATE ON path_edges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
