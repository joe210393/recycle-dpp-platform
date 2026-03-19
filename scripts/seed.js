/* eslint-disable no-console */
require('dotenv').config();

const { getPool } = require('../src/config/db');

async function main() {
  const pool = await getPool();
  // Placeholder for seeders. First iteration focuses on migrations + CRUD skeleton.
  console.log('[seed] no seeders configured yet', { db: process.env.DB_NAME });
  void pool;
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});

