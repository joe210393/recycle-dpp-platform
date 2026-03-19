require('dotenv').config();

const createApp = require('./app');
const { getPool } = require('./src/config/db');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;

const app = createApp();

async function runMigrations() {
  // Use spawn so we can stream logs to Zeabur logs.
  await new Promise((resolve, reject) => {
    const child = spawn('node', ['scripts/migrate.js'], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) return resolve();
      return reject(new Error(`Migration exited with code ${code}`));
    });
  });
}

async function ensureSchema() {
  // If the DB is empty (fresh Zeabur), tables don't exist and the app would 500.
  // We detect that and run migrations automatically.
  const pool = await getPool();
  try {
    await pool.query('SELECT 1 FROM recyclers LIMIT 1');
  } catch (err) {
    const code = err && err.code;
    if (code === 'ER_NO_SUCH_TABLE' || code === 'ER_BAD_DB_ERROR') {
      // eslint-disable-next-line no-console
      console.log('[bootstrap] Missing DB tables detected; running migrations...');
      await runMigrations();
      return;
    }
    throw err;
  }
}

ensureSchema()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[bootstrap] ensureSchema failed:', err);
  })
  .finally(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`[recycle-dpp-platform] listening on http://localhost:${PORT}`);
    });
  });

