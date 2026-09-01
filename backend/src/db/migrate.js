const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbName = process.env.DB_NAME || 'forkora';

async function ensureDatabaseExists() {
  const rootClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres',
  });

  try {
    await rootClient.connect();
    const res = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    if (res.rowCount === 0) {
      console.log(`[Migration] Database "${dbName}" does not exist. Creating...`);
      // Escape database name in identifier
      await rootClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`[Migration] Database "${dbName}" created successfully.`);
    } else {
      console.log(`[Migration] Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error(`[Migration Error] Failed checking/creating database:`, err.message);
    throw err;
  } finally {
    await rootClient.end();
  }
}

async function runMigrations() {
  await ensureDatabaseExists();

  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  });

  try {
    await client.connect();
    console.log(`[Migration] Connected to database "${dbName}".`);

    // Create tracking table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Read executed migrations
    const executedRes = await client.query(`SELECT filename FROM schema_migrations`);
    const executedFiles = new Set(executedRes.rows.map((row) => row.filename));

    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.error(`[Migration Error] Directory not found: ${migrationsDir}`);
      process.exit(1);
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    console.log(`[Migration] Found ${files.length} migration file(s) in total.`);

    let appliedCount = 0;

    for (const file of files) {
      if (executedFiles.has(file)) {
        console.log(`  - [SKIP] ${file} (already executed)`);
        continue;
      }

      console.log(`  -> [EXECUTING] ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          `INSERT INTO schema_migrations (filename) VALUES ($1)`,
          [file]
        );
        await client.query('COMMIT');
        console.log(`  ✓ [SUCCESS] ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ✗ [FAILED] ${file}:`, err.message);
        throw err;
      }
    }

    console.log(`\n[Migration Complete] Successfully applied ${appliedCount} new migration(s).`);
  } catch (err) {
    console.error('[Migration Execution Failed]', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
