import { query } from '../config/db';
import { Session } from '../types';

export async function createSession(
  userId: string,
  deviceType: string = 'web',
  appVersion: string = '1.0.0'
): Promise<Session> {
  const sql = `
    INSERT INTO sessions (user_id, device_type, app_version, started_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING id, user_id, device_type, app_version, started_at;
  `;
  const result = await query<Session>(sql, [userId, deviceType, appVersion]);
  return result.rows[0];
}

/**
 * Ends a session upon logout.
 */
export async function endSession(sessionId: string): Promise<Session | null> {
  const sql = `
    UPDATE sessions 
    SET ended_at = CURRENT_TIMESTAMP 
    WHERE id = $1
    RETURNING id, ended_at;
  `;
  const result = await query<Session>(sql, [sessionId]);
  return result.rows[0] || null;
}
