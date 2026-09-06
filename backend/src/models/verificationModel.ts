import { query } from '../config/db';
import { EmailVerificationCode } from '../types';

/**
 * Creates and stores a new verification OTP code for a user.
 * Invalidates old codes for the same user.
 */
export async function createVerificationCode(
  userId: string,
  code: string,
  expiresMinutes: number = 15
): Promise<EmailVerificationCode> {
  // First delete any previous unused codes for this user
  await deleteUserVerificationCodes(userId);

  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
  const sql = `
    INSERT INTO email_verifications (user_id, code, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, code, expires_at, created_at;
  `;
  const result = await query<EmailVerificationCode>(sql, [userId, code, expiresAt]);
  return result.rows[0];
}

/**
 * Retrieves the latest verification code record for a user.
 */
export async function getLatestVerificationCode(userId: string): Promise<EmailVerificationCode | null> {
  const sql = `
    SELECT id, user_id, code, expires_at, created_at
    FROM email_verifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const result = await query<EmailVerificationCode>(sql, [userId]);
  return result.rows[0] || null;
}

/**
 * Deletes all verification codes for a user after successful verification.
 */
export async function deleteUserVerificationCodes(userId: string): Promise<void> {
  const sql = `DELETE FROM email_verifications WHERE user_id = $1;`;
  await query(sql, [userId]);
}
