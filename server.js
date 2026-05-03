require('./src/config/loadEnv');

const createApp = require('./app');
const { getPool } = require('./src/config/db');
const { ensureIncrementalSchema } = require('./src/utils/ensureIncrementalSchema');
const { spawn } = require('child_process');

/**
 * - 本機：預設 3000。
 * - Zeabur：平台應注入 PORT；若未注入，Git Node 服務的 reverse proxy 多半對準 8080，
 *   若仍用 3000 會 502（你曾出現 listening on :3000 但閘道連不到）。
 */
function resolveListenPort() {
  const raw = process.env.PORT;
  if (raw !== undefined && String(raw).trim() !== '') {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 3000;
  }
  if (process.env.ZEABUR_SERVICE_ID || process.env.ZEABUR_PROJECT_ID) {
    return 8080;
  }
  return 3000;
}

const PORT = resolveListenPort();

if (process.env.ZEABUR_SERVICE_ID || process.env.ZEABUR_PROJECT_ID) {
  // eslint-disable-next-line no-console
  console.log(
    `[bootstrap] Zeabur runtime: PORT env=${process.env.PORT == null || String(process.env.PORT).trim() === '' ? '(unset → using ' + PORT + ')' : process.env.PORT}`
  );
}

const fs = require('fs');
const { getUploadDir } = require('./src/config/uploadDir');
const uploadDirResolved = getUploadDir();
try {
  fs.mkdirSync(uploadDirResolved, { recursive: true });
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('[bootstrap] UPLOAD_DIR mkdir failed', uploadDirResolved, e && e.message);
}
// eslint-disable-next-line no-console
console.log(`[bootstrap] UPLOAD_DIR=${uploadDirResolved} (static URL remains /uploads/...)`);

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
  const env = require('./src/config/env');
  // eslint-disable-next-line no-console
  console.log(
    `[bootstrap] DB target host=${env.db.host} port=${env.db.port} database=${env.db.name}`
  );

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
      await ensureIncrementalSchema();
      return;
    }
    throw err;
  }
  // 表已存在但 schema 可能落後（例如未跑 022/023）
  await ensureIncrementalSchema();
}

// 先補齊 schema 再 listen，避免舊 DB 未跑 migration 時 API 先 500
ensureSchema()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      // eslint-disable-next-line no-console
      console.log(`[recycle-dpp-platform] listening on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[bootstrap] ensureSchema failed:', err);
    process.exit(1);
  });

