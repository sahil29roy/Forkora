const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'forkora',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

/**
 * Tests database connectivity.
 */
async function testConnection() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW() AS now, current_database() AS db_name');
    console.log(`[PostgreSQL] Connected successfully to database: "${res.rows[0].db_name}" at ${res.rows[0].now}`);
    return res.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Helper to execute a query with standard parameters.
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Query] executed in ${duration}ms | rows: ${res.rowCount}`);
  }
  return res;
}

module.exports = {
  pool,
  query,
  testConnection,
};
