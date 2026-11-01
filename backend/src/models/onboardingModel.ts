import { pool, query } from '../config/db';
import { ValidatedOnboardingInput, ValidatedStage1Input } from '../validators/onboardingValidator';
import { StudentProfile, FamilyProfile, AcademicRecord, AcademicSubject } from '../types';

export interface FullOnboardingResult {
  studentProfile: StudentProfile;
  familyProfiles: FamilyProfile[];
  academicRecord: AcademicRecord & { subjects: AcademicSubject[] };
}

/**
 * Transactionally saves or updates the complete onboarding profile for a user.
 */
export async function saveOnboardingProfile(
  userId: string | number,
  data: ValidatedOnboardingInput
): Promise<FullOnboardingResult> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert or update student_profiles
    const studentProfileSql = `
      INSERT INTO student_profiles (
        user_id, student_name, current_class, phone_number, contact_email,
        father_name, father_occupation, mother_name, mother_occupation, is_completed
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      ON CONFLICT (user_id) DO UPDATE SET
        student_name = EXCLUDED.student_name,
        current_class = EXCLUDED.current_class,
        phone_number = EXCLUDED.phone_number,
        contact_email = EXCLUDED.contact_email,
        father_name = EXCLUDED.father_name,
        father_occupation = EXCLUDED.father_occupation,
        mother_name = EXCLUDED.mother_name,
        mother_occupation = EXCLUDED.mother_occupation,
        is_completed = true,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const studentRes = await client.query(studentProfileSql, [
      userId,
      data.student_name,
      data.current_class,
      data.phone_number || null,
      data.contact_email || null,
      data.father_name,
      data.father_occupation || null,
      data.mother_name,
      data.mother_occupation || null,
    ]);
    const studentProfile: StudentProfile = studentRes.rows[0];

    // 2. Sync family_profiles (normalized Father and Mother rows)
    await client.query(
      `DELETE FROM family_profiles WHERE student_profile_id = $1;`,
      [studentProfile.id]
    );

    const familyInsertSql = `
      INSERT INTO family_profiles (student_profile_id, relationship, name, occupation)
      VALUES 
        ($1, 'FATHER', $2, $3),
        ($1, 'MOTHER', $4, $5)
      RETURNING *;
    `;
    const familyRes = await client.query(familyInsertSql, [
      studentProfile.id,
      data.father_name,
      data.father_occupation || null,
      data.mother_name,
      data.mother_occupation || null,
    ]);
    const familyProfiles: FamilyProfile[] = familyRes.rows;

    // 3. Insert academic_records
    await client.query(
      `DELETE FROM academic_records WHERE student_profile_id = $1;`,
      [studentProfile.id]
    );

    const streamValue = data.current_class >= 11 ? data.stream : null;
    const academicRecordSql = `
      INSERT INTO academic_records (student_profile_id, education_board, stream, class_level)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const academicRes = await client.query(academicRecordSql, [
      studentProfile.id,
      data.education_board,
      streamValue,
      data.current_class,
    ]);
    const academicRecord: AcademicRecord = academicRes.rows[0];

    // 4. Insert academic_subjects
    const subjects: AcademicSubject[] = [];
    for (const sub of data.subjects) {
      const subjectSql = `
        INSERT INTO academic_subjects (
          academic_record_id, subject_name, subject_category, marks_obtained, maximum_marks, grade
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const subRes = await client.query(subjectSql, [
        academicRecord.id,
        sub.subject_name,
        sub.subject_category || 'CORE',
        sub.marks_obtained,
        sub.maximum_marks,
        sub.grade || null,
      ]);
      subjects.push(subRes.rows[0]);
    }

    // 5. Keep users table in sync with student display_name and class_level
    const updateUserSql = `
      UPDATE users
      SET display_name = $1,
          class_level = $2,
          phone = COALESCE($3, phone),
          last_active_at = CURRENT_TIMESTAMP
      WHERE id = $4;
    `;
    await client.query(updateUserSql, [
      data.student_name,
      data.current_class,
      data.phone_number || null,
      userId,
    ]);

    await client.query('COMMIT');

    return {
      studentProfile,
      familyProfiles,
      academicRecord: {
        ...academicRecord,
        subjects,
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Retrieves the complete onboarding profile and academic background for a user.
 */
export async function getOnboardingProfileByUserId(
  userId: string | number
): Promise<FullOnboardingResult | null> {
  // 1. Fetch student_profiles
  const studentRes = await query<StudentProfile>(
    `SELECT * FROM student_profiles WHERE user_id = $1 LIMIT 1;`,
    [userId]
  );
  if (studentRes.rows.length === 0) {
    return null;
  }
  const studentProfile = studentRes.rows[0];

  // 2. Fetch family_profiles
  const familyRes = await query<FamilyProfile>(
    `SELECT * FROM family_profiles WHERE student_profile_id = $1 ORDER BY id ASC;`,
    [studentProfile.id]
  );

  // 3. Fetch latest academic_records
  const academicRes = await query<AcademicRecord>(
    `SELECT * FROM academic_records WHERE student_profile_id = $1 ORDER BY id DESC LIMIT 1;`,
    [studentProfile.id]
  );

  let academicRecordWithSubjects: AcademicRecord & { subjects: AcademicSubject[] } = {
    id: 0,
    student_profile_id: studentProfile.id,
    education_board: '',
    stream: null,
    class_level: studentProfile.current_class,
    subjects: [],
  };

  if (academicRes.rows.length > 0) {
    const record = academicRes.rows[0];
    const subjectsRes = await query<AcademicSubject>(
      `SELECT * FROM academic_subjects WHERE academic_record_id = $1 ORDER BY id ASC;`,
      [record.id]
    );
    academicRecordWithSubjects = {
      ...record,
      subjects: subjectsRes.rows,
    };
  }

  return {
    studentProfile,
    familyProfiles: familyRes.rows,
    academicRecord: academicRecordWithSubjects,
  };
}

/**
 * Updates parent/family information for a student profile.
 */
export async function updateParentDetails(
  userId: string | number,
  data: {
    father_name: string;
    father_occupation?: string | null;
    mother_name: string;
    mother_occupation?: string | null;
  }
): Promise<{ studentProfile: StudentProfile; familyProfiles: FamilyProfile[] }> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updateStudentSql = `
      UPDATE student_profiles
      SET father_name = $1,
          father_occupation = $2,
          mother_name = $3,
          mother_occupation = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $5
      RETURNING *;
    `;
    const studentRes = await client.query(updateStudentSql, [
      data.father_name,
      data.father_occupation || null,
      data.mother_name,
      data.mother_occupation || null,
      userId,
    ]);

    if (studentRes.rows.length === 0) {
      throw new Error('Student profile not found for user.');
    }
    const studentProfile: StudentProfile = studentRes.rows[0];

    // Resync family_profiles
    await client.query(
      `DELETE FROM family_profiles WHERE student_profile_id = $1;`,
      [studentProfile.id]
    );

    const familyInsertSql = `
      INSERT INTO family_profiles (student_profile_id, relationship, name, occupation)
      VALUES 
        ($1, 'FATHER', $2, $3),
        ($1, 'MOTHER', $4, $5)
      RETURNING *;
    `;
    const familyRes = await client.query(familyInsertSql, [
      studentProfile.id,
      data.father_name,
      data.father_occupation || null,
      data.mother_name,
      data.mother_occupation || null,
    ]);

    await client.query('COMMIT');

    return {
      studentProfile,
      familyProfiles: familyRes.rows,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Saves Stage 1 personal & family details (Student Details and Parent/Guardian Details).
 */
export async function savePersonalDetails(
  userId: string | number,
  data: ValidatedStage1Input
): Promise<{ studentProfile: StudentProfile; familyProfiles: FamilyProfile[] }> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const studentProfileSql = `
      INSERT INTO student_profiles (
        user_id, student_name, current_class, phone_number, contact_email,
        father_name, father_occupation, mother_name, mother_occupation, is_completed
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
      ON CONFLICT (user_id) DO UPDATE SET
        student_name = EXCLUDED.student_name,
        current_class = EXCLUDED.current_class,
        phone_number = EXCLUDED.phone_number,
        contact_email = EXCLUDED.contact_email,
        father_name = EXCLUDED.father_name,
        father_occupation = EXCLUDED.father_occupation,
        mother_name = EXCLUDED.mother_name,
        mother_occupation = EXCLUDED.mother_occupation,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const studentRes = await client.query(studentProfileSql, [
      userId,
      data.student_name,
      data.current_class,
      data.phone_number || null,
      data.contact_email || null,
      data.parent_1_name,
      data.parent_1_occupation || null,
      data.parent_2_name,
      data.parent_2_occupation || null,
    ]);
    const studentProfile: StudentProfile = studentRes.rows[0];

    // Resync family_profiles
    await client.query(
      `DELETE FROM family_profiles WHERE student_profile_id = $1;`,
      [studentProfile.id]
    );

    const familyInsertSql = `
      INSERT INTO family_profiles (student_profile_id, relationship, name, occupation)
      VALUES 
        ($1, 'PARENT_1', $2, $3),
        ($1, 'PARENT_2', $4, $5)
      RETURNING *;
    `;
    const familyRes = await client.query(familyInsertSql, [
      studentProfile.id,
      data.parent_1_name,
      data.parent_1_occupation || null,
      data.parent_2_name,
      data.parent_2_occupation || null,
    ]);

    await client.query('COMMIT');

    return {
      studentProfile,
      familyProfiles: familyRes.rows,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
