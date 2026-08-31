CREATE TABLE plan_comments (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shared_plan_id INTEGER NOT NULL REFERENCES shared_plans(id) ON DELETE CASCADE,
    author_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL CONSTRAINT chk_plan_comments_body_not_empty CHECK (length(trim(body)) > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plan_comments_shared_created ON plan_comments(shared_plan_id, created_at);
CREATE INDEX idx_plan_comments_author ON plan_comments(author_user_id);
