require('dotenv').config();

function required(name, fallback) {
  const v = process.env[name];
  if (v !== undefined && v !== '') return v;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing env var: ${name}`);
}

function requiredAny(names, fallback) {
  for (const name of names) {
    const v = process.env[name];
    if (v !== undefined && v !== '') return v;
  }
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing env var: ${names.join(' / ')}`);
}

/** 依序找第一個「有設定且非空字串」的 env，否則用 fallback（可為 undefined） */
function firstEnv(names, fallback) {
  for (const name of names) {
    const v = process.env[name];
    if (v !== undefined && v !== '') return v;
  }
  return fallback;
}

/**
 * Zeabur 等平台可能只注入 MYSQL_URI / MYSQL_CONNECTION_STRING。
 * 僅接受 mysql:// 或 mysql2://，避免誤把 postgres DATABASE_URL 當成 MySQL。
 */
function parseMysqlConnectionUrl(raw) {
  const s = String(raw || '').trim();
  if (!s) return null;
  if (!/^mysql2?:\/\//i.test(s)) return null;
  try {
    const normalized = s.replace(/^mysql2:\/\//i, 'mysql://');
    const u = new URL(normalized);
    const db = u.pathname.replace(/^\//, '').split('?')[0];
    return {
      host: u.hostname,
      port: u.port ? Number(u.port) : 3306,
      user: decodeURIComponent(u.username || '') || 'root',
      password: u.password !== '' ? decodeURIComponent(u.password) : '',
      database: db || '',
    };
  } catch {
    return null;
  }
}

function buildDbConfig() {
  const uriRaw =
    process.env.MYSQL_URI ||
    process.env.MYSQL_CONNECTION_STRING ||
    process.env.DATABASE_URL;
  const parsed = parseMysqlConnectionUrl(uriRaw);

  if (parsed && parsed.host) {
    const defaultName = parsed.database || 'recycle_dpp_platform';
    return {
      host: firstEnv(['DB_HOST', 'MYSQL_HOST'], parsed.host),
      port: Number(firstEnv(['DB_PORT', 'MYSQL_PORT'], String(parsed.port))),
      user: firstEnv(['DB_USER', 'MYSQL_USERNAME', 'MYSQL_USER'], parsed.user),
      password: firstEnv(['DB_PASSWORD', 'MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD'], parsed.password),
      name: firstEnv(['DB_NAME', 'MYSQL_DATABASE'], defaultName),
    };
  }

  return {
    host: requiredAny(['DB_HOST', 'MYSQL_HOST'], 'localhost'),
    port: Number(requiredAny(['DB_PORT', 'MYSQL_PORT'], '3306')),
    user: requiredAny(['DB_USER', 'MYSQL_USERNAME', 'MYSQL_USER'], 'root'),
    password: requiredAny(['DB_PASSWORD', 'MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD'], ''),
    name: requiredAny(['DB_NAME', 'MYSQL_DATABASE'], 'recycle_dpp_platform'),
  };
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  db: buildDbConfig(),
};
