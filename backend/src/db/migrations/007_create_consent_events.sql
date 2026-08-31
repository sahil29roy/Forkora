CREATE TABLE consent_events (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    guardian_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    consent_type VARCHAR(255) NOT NULL CONSTRAINT chk_consent_events_type_not_empty CHECK (length(trim(consent_type)) > 0),
    action VARCHAR(100),
    method VARCHAR(100),
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_consent_events_different_users CHECK (guardian_user_id IS NULL OR guardian_user_id <> student_user_id)
);

CREATE INDEX idx_consent_events_student ON consent_events(student_user_id, occurred_at);
CREATE INDEX idx_consent_events_guardian ON consent_events(guardian_user_id, occurred_at);
