/* eslint-disable no-console */
require('../src/config/loadEnv');

const { getPool } = require('../src/config/db');
const userService = require('../src/services/userService');

async function main() {
  const pool = await getPool();
  await userService.ensureDefaultAdmin();
  console.log('[seed] default admin ensured', {
    account: userService.DEFAULT_ADMIN_ACCOUNT,
    role: 'admin',
  });
  void pool;
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
