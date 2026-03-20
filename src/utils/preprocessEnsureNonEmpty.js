/**
 * 後台表單：空字串在 sanitizeFormBody 會變成 NULL。
 * 對 NOT NULL 欄位在寫入前檢查，避免 MySQL「cannot be null」不易理解。
 *
 * @param {Record<string, unknown>} body
 * @param {Array<{ key: string, label: string }>} requiredFields
 */
function preprocessEnsureNonEmpty(body, requiredFields) {
  const b = { ...(body || {}) };
  for (const { key, label } of requiredFields) {
    const raw = b[key];
    const s = raw == null ? '' : String(raw).trim();
    if (!s) {
      throw new Error(`請填寫${label}`);
    }
    b[key] = s;
  }
  return b;
}

module.exports = { preprocessEnsureNonEmpty };
