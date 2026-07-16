const { getPool } = require('../config/db');
const { getDocumentTargetTypeLabel } = require('../utils/adminRelationLabels');

const visibilityLabels = {
  consumer: '消費者',
  b2b: '通路/夥伴',
  audit: '稽核',
  internal: '內部',
};

function normalizeIds(input) {
  const raw = input === undefined || input === null ? [] : Array.isArray(input) ? input : [input];
  return Array.from(
    new Set(
      raw
        .map((v) => Number(v))
        .filter((n) => Number.isInteger(n) && n > 0)
    )
  );
}

/**
 * 商品護照編輯頁的文件複選選項。
 * checked = 目前綁定在此護照；綁在其他對象上的文件會標示目前綁定位置。
 */
async function listDocumentOptionsForPassport(passportId) {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT id, title, document_type, visibility_level, target_type, target_id
     FROM documents
     ORDER BY id DESC`
  );

  return rows.map((d) => {
    const checked =
      d.target_type === 'product_passport' && String(d.target_id) === String(passportId);
    const visibility = visibilityLabels[d.visibility_level] || d.visibility_level;
    let bindingNote = '';
    if (!checked) {
      bindingNote = d.target_type
        ? `｜目前綁定：${getDocumentTargetTypeLabel(d.target_type)} ID:${d.target_id}`
        : '｜未綁定';
    }
    return {
      value: String(d.id),
      label: `#${d.id} ${d.title}（${d.document_type}｜可見層級：${visibility}${bindingNote}）`,
      checked,
    };
  });
}

/**
 * 依表單勾選結果同步文件綁定：
 * - 勾選的文件改綁到此護照（原本綁在其他對象上的會被移過來）。
 * - 原本綁在此護照、但取消勾選的文件解除綁定（target 設為 NULL）。
 */
async function syncPassportDocuments(passportId, documentIds) {
  const pid = Number(passportId);
  if (!Number.isInteger(pid) || pid <= 0) return;

  const ids = normalizeIds(documentIds);
  const pool = await getPool();

  if (ids.length > 0) {
    await pool.query(
      `UPDATE documents SET target_type = NULL, target_id = NULL
       WHERE target_type = 'product_passport' AND target_id = ? AND id NOT IN (?)`,
      [pid, ids]
    );
    await pool.query(
      `UPDATE documents SET target_type = 'product_passport', target_id = ?
       WHERE id IN (?)`,
      [pid, ids]
    );
  } else {
    await pool.query(
      `UPDATE documents SET target_type = NULL, target_id = NULL
       WHERE target_type = 'product_passport' AND target_id = ?`,
      [pid]
    );
  }
}

module.exports = { listDocumentOptionsForPassport, syncPassportDocuments };
