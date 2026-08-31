CREATE TABLE assessments (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    questionnaire_id INTEGER NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    assigned_archetype_id INTEGER REFERENCES archetypes(id) ON DELETE SET NULL,
    feature_vector JSONB,
    confidence DECIMAL(4,3) CONSTRAINT chk_assessments_confidence CHECK (confidence IS NULL OR (confidence >= 0.000 AND confidence <= 1.000)),
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_assessments_completed_at CHECK (completed_at IS NULL OR completed_at >= created_at)
);

CREATE INDEX idx_assessments_user_created ON assessments(user_id, created_at);
CREATE INDEX idx_assessments_archetype ON assessments(assigned_archetype_id);
CREATE INDEX idx_assessments_questionnaire ON assessments(questionnaire_id);
