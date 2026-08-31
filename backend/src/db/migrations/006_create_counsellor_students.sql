CREATE TABLE counsellor_students (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    counsellor_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_counsellor_student UNIQUE (counsellor_user_id, student_user_id),
    CONSTRAINT chk_counsellor_student_different_users CHECK (counsellor_user_id <> student_user_id)
);

CREATE INDEX idx_counsellor_students_student ON counsellor_students(student_user_id);
CREATE INDEX idx_counsellor_students_school ON counsellor_students(school_id);
