const { query } = require('../config/db');

/**
 * Inserts a new user record.
 */
async function createUser({
  role = 'STUDENT',
  display_name,
  email,
  phone = null,
  class_level = null,
  school_id = null,
  preferred_language = 'en',
  is_minor = false,
  password_hash,
}) {
  const sql = `
    INSERT INTO users (
      role, display_name, email, phone, class_level, 
      school_id, preferred_language, is_minor, password_hash, is_email_verified
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
    RETURNING id, role, display_name, email, phone, class_level, school_id, preferred_language, is_minor, is_email_verified, created_at;
  `;
  const values = [
    role,
    display_name,
    email.toLowerCase().trim(),
    phone,
    class_level,
    school_id,
    preferred_language,
    is_minor,
    password_hash,
  ];

  const result = await query(sql, values);
  return result.rows[0];
}


async function findUserByEmail(email) {
  const sql = `SELECT * FROM users WHERE LOWER(email) = LOWER($1);`;
  const result = await query(sql, [email.trim()]);
  return result.rows[0] || null;
}


async function findUserById(id) {
  const sql = `
    SELECT id, role, display_name, email, phone, class_level, 
           school_id, preferred_language, is_minor, is_email_verified, email_verified_at, created_at, updated_at, last_active_at
    FROM users 
    WHERE id = $1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

/**
 * Marks user email as verified.
 */
async function updateEmailVerified(userId) {
  const sql = `
    UPDATE users 
    SET is_email_verified = true, 
        email_verified_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, role, display_name, email, is_email_verified, email_verified_at;
  `;
  const result = await query(sql, [userId]);
  return result.rows[0] || null;
}

/**
 * Updates last active timestamp for a user.
 */
async function updateLastActive(userId) {
  const sql = `UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1;`;
  await query(sql, [userId]);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateEmailVerified,
  updateLastActive,
};
