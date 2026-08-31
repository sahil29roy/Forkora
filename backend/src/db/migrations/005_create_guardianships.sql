CREATE TABLE guardianships (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    guardian_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship guardian_relation NOT NULL,
    consent consent_status NOT NULL,
    consent_granted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_guardianship UNIQUE (guardian_user_id, student_user_id),
    CONSTRAINT chk_guardianship_different_users CHECK (guardian_user_id <> student_user_id)
);

CREATE INDEX idx_guardianships_student ON guardianships(student_user_id);
CREATE INDEX idx_guardianships_guardian ON guardianships(guardian_user_id);
