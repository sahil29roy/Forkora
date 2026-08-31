CREATE TABLE shared_plans (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    saved_path_id INTEGER NOT NULL REFERENCES saved_paths(id) ON DELETE CASCADE,
    shared_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_with_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission share_permission NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_shared_plan UNIQUE (saved_path_id, shared_with_user_id),
    CONSTRAINT chk_shared_plans_different_users CHECK (shared_by_user_id <> shared_with_user_id)
);

CREATE INDEX idx_shared_plans_recipient ON shared_plans(shared_with_user_id);
CREATE INDEX idx_shared_plans_sharer ON shared_plans(shared_by_user_id);
