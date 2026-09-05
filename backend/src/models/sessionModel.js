const { query } = require('../config/db');


async function createSession(userId, deviceType = 'web', appVersion = '1.0.0') {
  const sql = `
    INSERT INTO sessions (user_id, device_type, app_version, started_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING id, user_id, device_type, app_version, started_at;
  `;
  const result = await query(sql, [userId, deviceType, appVersion]);
  return result.rows[0];
}

/**
 * Ends a session upon logout.
 */
async function endSession(sessionId) {
  const sql = `
    UPDATE sessions 
    SET ended_at = CURRENT_TIMESTAMP 
    WHERE id = $1
    RETURNING id, ended_at;
  `;
  const result = await query(sql, [sessionId]);
  return result.rows[0] || null;
}

module.exports = {
  createSession,
  endSession,
};
