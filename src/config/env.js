require('dotenv').config();

function required(name, fallback) {
  const v = process.env[name];
  if (v !== undefined && v !== '') return v;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing env var: ${name}`);
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  db: {
    host: required('DB_HOST', 'localhost'),
    port: Number(required('DB_PORT', '3306')),
    user: required('DB_USER', 'root'),
    password: required('DB_PASSWORD', ''),
    name: required('DB_NAME', 'recycle_dpp_platform'),
  },
};

