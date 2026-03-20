/**
 * 編輯時：可選圖片/路徑欄位若為空，不要寫入 DB。
 * - 一般表單：PUT（含 ?_method=PUT）
 * - 含檔案上傳：POST /:id/update（不依賴 method-override，避免 multipart 與 _method 順序問題）
 *
 * multipart 只有在上傳新檔時，middleware 才會填入路徑；空字串經 sanitize 會變 NULL 並覆蓋原圖。
 *
 * @param {Record<string, unknown>} body
 * @param {import('express').Request} req
 * @param {string[]} keys
 */
function isCrudUpdateRequest(req) {
  const m = String(req.method || '').toUpperCase();
  if (m === 'PUT') return true;
  const pathOnly = String(req.originalUrl || req.url || '').split('?')[0];
  return m === 'POST' && /\/[^/]+\/update$/.test(pathOnly);
}

function omitEmptyImagePathsOnPut(body, req, keys = []) {
  if (!body || typeof body !== 'object') return body;
  if (!isCrudUpdateRequest(req)) return body;
  for (const k of keys) {
    if (!Object.prototype.hasOwnProperty.call(body, k)) continue;
    const v = body[k];
    if (v == null || (typeof v === 'string' && v.trim() === '')) {
      delete body[k];
    }
  }
  return body;
}

module.exports = { omitEmptyImagePathsOnPut };
