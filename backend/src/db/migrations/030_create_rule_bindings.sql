CREATE TABLE rule_bindings (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rule_id INTEGER NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
    edge_id INTEGER REFERENCES path_edges(id) ON DELETE CASCADE,
    node_id INTEGER REFERENCES path_nodes(id) ON DELETE CASCADE,
    note VARCHAR(255) CONSTRAINT chk_rule_bindings_note_not_empty CHECK (note IS NULL OR length(trim(note)) > 0),
    CONSTRAINT chk_rule_target CHECK (edge_id IS NOT NULL OR node_id IS NOT NULL)
);

CREATE INDEX idx_rule_bindings_rule ON rule_bindings(rule_id);
CREATE INDEX idx_rule_bindings_edge ON rule_bindings(edge_id);
CREATE INDEX idx_rule_bindings_node ON rule_bindings(node_id);
