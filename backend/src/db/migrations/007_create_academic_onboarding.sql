-- Migration 007: Create Academic Onboarding Tables
-- student_profiles, family_profiles, academic_records, academic_subjects

CREATE TABLE IF NOT EXISTS student_profiles (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL CONSTRAINT chk_student_profiles_name CHECK (length(trim(student_name)) > 0),
    current_class SMALLINT NOT NULL CONSTRAINT chk_student_profiles_class CHECK (current_class >= 1 AND current_class <= 12),
    phone_number VARCHAR(50) CONSTRAINT chk_student_profiles_phone CHECK (phone_number IS NULL OR length(trim(phone_number)) >= 5),
    contact_email VARCHAR(255) CONSTRAINT chk_student_profiles_email CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
    father_name VARCHAR(255) NOT NULL CONSTRAINT chk_student_profiles_father CHECK (length(trim(father_name)) > 0),
    father_occupation VARCHAR(255),
    mother_name VARCHAR(255) NOT NULL CONSTRAINT chk_student_profiles_mother CHECK (length(trim(mother_name)) > 0),
    mother_occupation VARCHAR(255),
    is_completed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_class ON student_profiles(current_class);

CREATE TRIGGER trg_student_profiles_updated_at
BEFORE UPDATE ON student_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE IF NOT EXISTS family_profiles (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL CONSTRAINT chk_family_profiles_rel CHECK (length(trim(relationship)) > 0),
    name VARCHAR(255) NOT NULL CONSTRAINT chk_family_profiles_name CHECK (length(trim(name)) > 0),
    occupation VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_family_profiles_student_id ON family_profiles(student_profile_id);

CREATE TRIGGER trg_family_profiles_updated_at
BEFORE UPDATE ON family_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE IF NOT EXISTS academic_records (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    education_board VARCHAR(50) NOT NULL CONSTRAINT chk_academic_records_board CHECK (length(trim(education_board)) > 0),
    stream VARCHAR(50),
    class_level SMALLINT NOT NULL CONSTRAINT chk_academic_records_class CHECK (class_level >= 1 AND class_level <= 12),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academic_records_student_id ON academic_records(student_profile_id);

CREATE TRIGGER trg_academic_records_updated_at
BEFORE UPDATE ON academic_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE IF NOT EXISTS academic_subjects (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    academic_record_id INTEGER NOT NULL REFERENCES academic_records(id) ON DELETE CASCADE,
    subject_name VARCHAR(150) NOT NULL CONSTRAINT chk_academic_subjects_name CHECK (length(trim(subject_name)) > 0),
    subject_category VARCHAR(50) NOT NULL DEFAULT 'CORE' CONSTRAINT chk_academic_subjects_cat CHECK (subject_category IN ('CORE', 'ELECTIVE', 'ADDITIONAL', 'OTHER')),
    marks_obtained NUMERIC(5, 2) NOT NULL CONSTRAINT chk_academic_subjects_marks CHECK (marks_obtained >= 0),
    maximum_marks NUMERIC(5, 2) NOT NULL CONSTRAINT chk_academic_subjects_max CHECK (maximum_marks > 0 AND marks_obtained <= maximum_marks),
    grade VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academic_subjects_record_id ON academic_subjects(academic_record_id);
