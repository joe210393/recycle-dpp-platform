const { getPool } = require('../config/db');

/**
 * 以「實際連線」探測欄位是否存在（避免 information_schema 與預設 DB 名稱不一致）。
 */
/** @returns {Promise<boolean|null>} true=有欄位, false=缺欄位, null=資料表不存在 */
async function canSelectColumn(pool, table, column) {
  try {
    await pool.query(`SELECT \`${column}\` FROM \`${table}\` LIMIT 0`);
    return true;
  } catch (e) {
    if (e && (e.code === 'ER_BAD_FIELD_ERROR' || e.errno === 1054)) return false;
    if (e && (e.code === 'ER_NO_SUCH_TABLE' || e.errno === 1146)) return null;
    throw e;
  }
}

function isDuplicateColumnError(e) {
  return e && (e.code === 'ER_DUP_FIELDNAME' || e.errno === 1060);
}

/**
 * 既有資料庫可能已建立表，但未跑較新的 migration。
 * 啟動時補上關鍵欄位，避免 /admin/recycled-batches 等頁面 500。
 */
async function ensureIncrementalSchema() {
  const pool = await getPool();

  // --- 022: processing_records.quantity_used ---
  if (!(await canSelectColumn(pool, 'processing_records', 'quantity_used'))) {
    // eslint-disable-next-line no-console
    console.log('[schema] Adding processing_records.quantity_used ...');
    try {
      await pool.query(
        `ALTER TABLE processing_records
         ADD COLUMN quantity_used DECIMAL(12,3) NOT NULL DEFAULT 0
         AFTER recycled_batch_id`
      );
    } catch (e) {
      if (isDuplicateColumnError(e)) {
        /* 併發或已存在 */
      } else {
        // eslint-disable-next-line no-console
        console.warn('[schema] quantity_used AFTER failed, retry without position:', e.message);
        try {
          await pool.query(
            `ALTER TABLE processing_records
             ADD COLUMN quantity_used DECIMAL(12,3) NOT NULL DEFAULT 0`
          );
        } catch (e2) {
          if (!isDuplicateColumnError(e2)) throw e2;
        }
      }
    }
  }
  if (!(await canSelectColumn(pool, 'processing_records', 'quantity_used'))) {
    throw new Error(
      '[schema] processing_records.quantity_used is still missing after ALTER; check DB user ALTER permission.'
    );
  }

  // --- 023: material_batches.quantity_produced ---
  const mbCol = await canSelectColumn(pool, 'material_batches', 'quantity_produced');
  if (mbCol === null) {
    // eslint-disable-next-line no-console
    console.warn('[schema] material_batches table missing; skip quantity_produced');
  } else if (!mbCol) {
    // eslint-disable-next-line no-console
    console.log('[schema] Adding material_batches.quantity_produced ...');
    try {
      await pool.query(
        `ALTER TABLE material_batches
         ADD COLUMN quantity_produced DECIMAL(12,3) NULL
         AFTER source_recycled_batch_id`
      );
    } catch (e) {
      if (isDuplicateColumnError(e)) {
        /* ok */
      } else {
        // eslint-disable-next-line no-console
        console.warn('[schema] quantity_produced AFTER failed, retry without position:', e.message);
        try {
          await pool.query(
            `ALTER TABLE material_batches
             ADD COLUMN quantity_produced DECIMAL(12,3) NULL`
          );
        } catch (e2) {
          if (!isDuplicateColumnError(e2)) throw e2;
        }
      }
    }
  }
  if (mbCol !== null && !(await canSelectColumn(pool, 'material_batches', 'quantity_produced'))) {
    throw new Error(
      '[schema] material_batches.quantity_produced is still missing after ALTER; check DB user ALTER permission.'
    );
  }

  // eslint-disable-next-line no-console
  console.log('[schema] incremental schema OK (quantity_used, quantity_produced)');
}

module.exports = { ensureIncrementalSchema };
