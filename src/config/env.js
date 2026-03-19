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

module.exports = {
  port: Number(process.env.PORT || 3000),
  db: {
    // Zeabur MySQL commonly exposes MYSQL_* vars.
    // Keep DB_* as the local/developer defaults, and fall back to MYSQL_* when present.
    host: requiredAny(['DB_HOST', 'MYSQL_HOST'], 'localhost'),
    port: Number(requiredAny(['DB_PORT', 'MYSQL_PORT'], '3306')),
    user: requiredAny(['DB_USER', 'MYSQL_USERNAME', 'MYSQL_USER'], 'root'),
    password: requiredAny(['DB_PASSWORD', 'MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD'], ''),
    name: requiredAny(['DB_NAME', 'MYSQL_DATABASE'], 'recycle_dpp_platform'),
  },
};

