const { getPool } = require('../config/db');
const roles = require('../constants/roles');
const { hashPassword, verifyPassword } = require('../utils/passwordHash');

const ROLE_VALUES = Object.values(roles);
const STAFF_REGISTRATION_ROLES = [roles.shop, roles.sale];
const DEFAULT_ADMIN_ACCOUNT = '0987339100';
const DEFAULT_ADMIN_PASSWORD = '123456789';

function normalizeAccount(account) {
  return String(account || '').trim();
}

function normalizeOptional(value) {
  const s = String(value || '').trim();
  return s || null;
}

function normalizeRole(role) {
  const value = String(role || '').trim();
  return ROLE_VALUES.includes(value) ? value : roles.user;
}

function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    account: row.account,
    role: row.role,
    display_name: row.display_name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function ensureUsersTable() {
  const pool = await getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      account VARCHAR(80) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'shop', 'sale', 'user') NOT NULL DEFAULT 'user',
      display_name VARCHAR(100) NULL,
      email VARCHAR(255) NULL,
      phone VARCHAR(50) NULL,
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_users_role (role),
      INDEX idx_users_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function ensureDefaultAdmin() {
  await ensureUsersTable();
  const pool = await getPool();
  const account = DEFAULT_ADMIN_ACCOUNT;
  const [rows] = await pool.query('SELECT * FROM users WHERE account = ? LIMIT 1', [account]);
  if (rows[0]) {
    if (rows[0].role !== roles.admin || rows[0].status !== 'active') {
      await pool.query('UPDATE users SET role = ?, status = ? WHERE id = ?', [
        roles.admin,
        'active',
        rows[0].id,
      ]);
    }
    return toPublicUser({ ...rows[0], role: roles.admin, status: 'active' });
  }

  const passwordHash = hashPassword(DEFAULT_ADMIN_PASSWORD);
  const [result] = await pool.query(
    `INSERT INTO users (account, password_hash, role, display_name, status)
     VALUES (?, ?, ?, ?, 'active')`,
    [account, passwordHash, roles.admin, 'Admin']
  );
  return {
    id: result.insertId,
    account,
    role: roles.admin,
    display_name: 'Admin',
    email: null,
    phone: null,
    status: 'active',
  };
}

async function findByAccount(account) {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM users WHERE account = ? LIMIT 1', [
    normalizeAccount(account),
  ]);
  return rows[0] || null;
}

async function findById(id) {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return toPublicUser(rows[0]);
}

async function findActiveById(id) {
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE id = ? AND status = 'active' LIMIT 1",
    [id]
  );
  return toPublicUser(rows[0]);
}

async function authenticate({ account, password }) {
  const row = await findByAccount(account);
  if (!row || row.status !== 'active') return null;
  if (!verifyPassword(password, row.password_hash)) return null;
  return toPublicUser(row);
}

async function createUser({
  account,
  password,
  role = roles.user,
  displayName,
  email,
  phone,
  status = 'active',
}) {
  const normalizedAccount = normalizeAccount(account);
  const normalizedRole = normalizeRole(role);
  const pool = await getPool();
  const [result] = await pool.query(
    `INSERT INTO users
      (account, password_hash, role, display_name, email, phone, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      normalizedAccount,
      hashPassword(password),
      normalizedRole,
      normalizeOptional(displayName),
      normalizeOptional(email),
      normalizeOptional(phone),
      status === 'inactive' ? 'inactive' : 'active',
    ]
  );
  return findById(result.insertId);
}

async function listUsers() {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT id, account, role, display_name, email, phone, status, created_at, updated_at
     FROM users
     ORDER BY FIELD(role, 'admin', 'shop', 'sale', 'user'), id DESC`
  );
  return rows.map(toPublicUser);
}

async function updateUser(id, { account, password, role, displayName, email, phone, status }) {
  const fields = [
    'account = ?',
    'role = ?',
    'display_name = ?',
    'email = ?',
    'phone = ?',
    'status = ?',
  ];
  const values = [
    normalizeAccount(account),
    normalizeRole(role),
    normalizeOptional(displayName),
    normalizeOptional(email),
    normalizeOptional(phone),
    status === 'inactive' ? 'inactive' : 'active',
  ];

  if (String(password || '').trim()) {
    fields.push('password_hash = ?');
    values.push(hashPassword(password));
  }
  values.push(id);

  const pool = await getPool();
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function deleteUser(id) {
  const pool = await getPool();
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

module.exports = {
  DEFAULT_ADMIN_ACCOUNT,
  DEFAULT_ADMIN_PASSWORD,
  ROLE_VALUES,
  STAFF_REGISTRATION_ROLES,
  authenticate,
  createUser,
  deleteUser,
  ensureDefaultAdmin,
  ensureUsersTable,
  findActiveById,
  findById,
  listUsers,
  normalizeRole,
  updateUser,
};
