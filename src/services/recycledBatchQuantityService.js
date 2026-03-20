const { getPool } = require('../config/db');

/**
 * 已用於處理紀錄的數量合計（不含已取消）
 */
async function getUsedQuantityForBatch(recycledBatchId, conn) {
  const q = conn || (await getPool());
  try {
    const [rows] = await q.query(
      `SELECT COALESCE(SUM(quantity_used), 0) AS s
       FROM processing_records
       WHERE recycled_batch_id = ? AND status != 'cancelled'`,
      [recycledBatchId]
    );
    return Number(rows[0].s);
  } catch (err) {
    // DB 尚未執行 migration 022 時沒有 quantity_used 欄位（雙重保險）
    const msg = err && err.sqlMessage ? String(err.sqlMessage) : '';
    if (
      err &&
      (err.code === 'ER_BAD_FIELD_ERROR' ||
        err.errno === 1054 ||
        /Unknown column/i.test(msg))
    ) {
      return 0;
    }
    throw err;
  }
}

/**
 * 回收批次剩餘可處理數量 = 進貨數量 - 已用合計
 */
async function getRemainingForBatch(recycledBatchId, batchQuantity, conn) {
  const qty = batchQuantity == null ? 0 : Number(batchQuantity);
  const used = await getUsedQuantityForBatch(recycledBatchId, conn);
  return Math.max(0, qty - used);
}

/**
 * 依「已用 / 總量」更新回收批次 processed_status
 */
function computeProcessedStatus(batchQuantity, usedSum) {
  const q = batchQuantity == null ? 0 : Number(batchQuantity);
  const u = Number(usedSum);
  if (u <= 0) return 'pending';
  if (q > 0 && u >= q) return 'processed';
  return 'partial';
}

async function syncRecycledBatchProcessedStatus(recycledBatchId, conn) {
  const q = conn || (await getPool());
  const [bRows] = await q.query('SELECT quantity FROM recycled_batches WHERE id = ? LIMIT 1', [
    recycledBatchId,
  ]);
  if (!bRows.length) return;
  const batchQty = bRows[0].quantity;
  const used = await getUsedQuantityForBatch(recycledBatchId, q);
  const status = computeProcessedStatus(batchQty, used);
  await q.query('UPDATE recycled_batches SET processed_status = ? WHERE id = ?', [
    status,
    recycledBatchId,
  ]);
}

module.exports = {
  getUsedQuantityForBatch,
  getRemainingForBatch,
  computeProcessedStatus,
  syncRecycledBatchProcessedStatus,
};
