/* eslint-disable no-console */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const { getPool } = require('../src/config/db');
const env = require('../src/config/env');

function sortByPrefix(files) {
  return files.sort((a, b) => {
    const ma = a.match(/^(\d+)_/);
    const mb = b.match(/^(\d+)_/);
    const na = ma ? Number(ma[1]) : 0;
    const nb = mb ? Number(mb[1]) : 0;
    return na - nb;
  });
}

async function main() {
  // Ensure database exists before creating the main pool.
  // This avoids "Unknown database" on first run.
  const dbName = String(env.db.name || '').trim();
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error(`Unsafe DB_NAME: ${env.db.name}`);
  }

  const bootstrapConn = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
  });
  await bootstrapConn.query(
    `CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await bootstrapConn.end();

  const pool = await getPool();

  const migrationsDir = path.join(__dirname, '..', 'src', 'database', 'migrations');
  const files = sortByPrefix(
    fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'))
  );

  console.log(`[migrate] executing ${files.length} migration(s) from ${migrationsDir}`);

  for (const file of files) {
    const sqlPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    console.log(`[migrate] ${file} ...`);
    await pool.query(sql);
  }

  console.log('[migrate] done');
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[migrate] failed', err);
  process.exit(1);
});

