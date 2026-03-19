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
    // DATE/DATETIME as strings (YYYY-MM-DD / YYYY-MM-DD HH:mm:ss) — avoids JS Date
    // breaking <input type="date"> and timezone off-by-one on edit.
    dateStrings: true,
    // App 以台灣時間 (GMT+8) 語意與 MySQL 互轉 JavaScript Date（若仍使用）
    timezone: '+08:00',
    // Needed because migration .sql files can include multiple statements.
    multipleStatements: true,
  });

  return pool;
}

module.exports = { getPool };

