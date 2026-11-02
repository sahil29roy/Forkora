import { query } from '../config/db';

export interface PasswordResetRecord {
  id: number;
  user_id: number;
  code: string;
  expires_at: string;
  created_at: string;
}

let tableEnsured = false;
async function ensureTable() {
  if (tableEnsured) return;
  const sql = `
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
    CREATE INDEX IF NOT EXISTS idx_password_resets_code ON password_resets(code);
  `;
  try {
    await query(sql);
    tableEnsured = true;
  } catch (err) {
    console.error('Failed to ensure password_resets table:', err);
  }
}

/**
 * Creates a new password reset code for a user.
 * Deletes any existing unused codes for the same user.
 */
export async function createPasswordResetCode(
  userId: string | number,
  code: string,
  expiresMinutes: number = 15
): Promise<PasswordResetRecord> {
  await ensureTable();
  await deleteUserPasswordResetCodes(userId);

  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
  const sql = `
    INSERT INTO password_resets (user_id, code, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, code, expires_at, created_at;
  `;
  const result = await query<PasswordResetRecord>(sql, [userId, code, expiresAt]);
  return result.rows[0];
}

/**
 * Retrieves the latest password reset code for a user.
 */
export async function getLatestPasswordResetCode(
  userId: string | number
): Promise<PasswordResetRecord | null> {
  await ensureTable();
  const sql = `
    SELECT id, user_id, code, expires_at, created_at
    FROM password_resets
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const result = await query<PasswordResetRecord>(sql, [userId]);
  return result.rows[0] || null;
}

/**
 * Deletes all password reset codes for a user.
 */
export async function deleteUserPasswordResetCodes(userId: string | number): Promise<void> {
  await ensureTable();
  const sql = `DELETE FROM password_resets WHERE user_id = $1;`;
  await query(sql, [userId]);
}
