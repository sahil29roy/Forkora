CREATE TABLE archetype_seed_nodes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    archetype_id INTEGER NOT NULL REFERENCES archetypes(id) ON DELETE CASCADE,
    node_id INTEGER NOT NULL REFERENCES path_nodes(id) ON DELETE CASCADE,
    seed_rank SMALLINT NOT NULL CONSTRAINT chk_archetype_seeds_rank CHECK (seed_rank >= 0),
    CONSTRAINT unique_archetype_seed UNIQUE (archetype_id, node_id)
);

CREATE INDEX idx_archetype_seeds_node ON archetype_seed_nodes(node_id);
CREATE INDEX idx_archetype_seeds_rank ON archetype_seed_nodes(archetype_id, seed_rank);
