const { getPool } = require('../config/db');

function buildCrudModel({ table, primaryKey = 'id', columns = [] }) {
  const valueColumns = columns;
  const selectColumns = [primaryKey, ...valueColumns];

  async function list({ limit = 50, offset = 0 } = {}) {
    const pool = await getPool();
    const sql = `SELECT ${selectColumns.join(', ')} FROM ${table} ORDER BY ${primaryKey} DESC LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(sql, [limit, offset]);
    return rows;
  }

  async function listAll() {
    const pool = await getPool();
    const sql = `SELECT ${selectColumns.join(', ')} FROM ${table} ORDER BY ${primaryKey} DESC`;
    const [rows] = await pool.query(sql);
    return rows;
  }

  async function getById(id) {
    const pool = await getPool();
    const sql = `SELECT ${selectColumns.join(', ')} FROM ${table} WHERE ${primaryKey} = ? LIMIT 1`;
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  }

  function pickColumns(data) {
    const out = {};
    for (const c of valueColumns) {
      if (Object.prototype.hasOwnProperty.call(data, c)) out[c] = data[c];
    }
    return out;
  }

  async function create(data) {
    const pool = await getPool();
    const picked = pickColumns(data);
    // Let DB defaults / triggers own timestamps; never INSERT literal timestamps from forms.
    delete picked.created_at;
    delete picked.updated_at;
    const cols = Object.keys(picked);
    if (cols.length === 0) throw new Error(`No columns provided for insert into ${table}`);

    const placeholders = cols.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`;
    const values = cols.map((c) => picked[c]);
    const [result] = await pool.query(sql, values);
    return { id: result.insertId, affectedRows: result.affectedRows };
  }

  async function update(id, data) {
    const pool = await getPool();
    const picked = pickColumns(data);
    delete picked.created_at;
    delete picked.updated_at;
    const cols = Object.keys(picked);
    if (cols.length === 0) throw new Error(`No columns provided for update into ${table}`);

    const assignments = cols.map((c) => `${c} = ?`).join(', ');
    const sql = `UPDATE ${table} SET ${assignments} WHERE ${primaryKey} = ?`;
    const values = cols.map((c) => picked[c]);
    values.push(id);
    const [result] = await pool.query(sql, values);
    return { affectedRows: result.affectedRows };
  }

  async function remove(id) {
    const pool = await getPool();
    const sql = `DELETE FROM ${table} WHERE ${primaryKey} = ?`;
    const [result] = await pool.query(sql, [id]);
    return { affectedRows: result.affectedRows };
  }

  return {
    list,
    listAll,
    getById,
    create,
    update,
    remove,
  };
}

module.exports = { buildCrudModel };

