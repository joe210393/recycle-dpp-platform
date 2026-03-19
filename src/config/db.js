const mysql = require('mysql2/promise');
const env = require('./env');

let pool;

async function getPool() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Needed because migration .sql files can include multiple statements.
    multipleStatements: true,
  });

  return pool;
}

module.exports = { getPool };

