const { query } = require('../config/db');

/**
 * Creates and stores a new verification OTP code for a user.
 * Invalidates old codes for the same user.
 */
async function createVerificationCode(userId, code, expiresMinutes = 15) {
  // First delete any previous unused codes for this user
  await deleteUserVerificationCodes(userId);

  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
  const sql = `
    INSERT INTO email_verifications (user_id, code, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, code, expires_at, created_at;
  `;
  const result = await query(sql, [userId, code, expiresAt]);
  return result.rows[0];
}

/**
 * Retrieves the latest verification code record for a user.
 */
async function getLatestVerificationCode(userId) {
  const sql = `
    SELECT id, user_id, code, expires_at, created_at
    FROM email_verifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const result = await query(sql, [userId]);
  return result.rows[0] || null;
}

/**
 * Deletes all verification codes for a user after successful verification.
 */
async function deleteUserVerificationCodes(userId) {
  const sql = `DELETE FROM email_verifications WHERE user_id = $1;`;
  await query(sql, [userId]);
}

module.exports = {
  createVerificationCode,
  getLatestVerificationCode,
  deleteUserVerificationCodes,
};
