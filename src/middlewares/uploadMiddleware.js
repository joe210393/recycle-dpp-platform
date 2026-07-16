const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { getUploadDir } = require('../config/uploadDir');

const uploadDir = getUploadDir();
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch {
  // 若無寫入權限，後續 multer 會丟錯，啟動時仍盡力建立目錄
}

const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function filename(req, file, cb) {
    const safeName = String(file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const MAX_FILE_BYTES = (() => {
  const n = Number(process.env.UPLOAD_MAX_MB || 20);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) * 1024 * 1024 : 20 * 1024 * 1024;
})();

/**
 * 限制：
 * - 大小上限：UPLOAD_MAX_MB（預設 20MB）。Zeabur / Cloudflare 上層 proxy 也有
 *   隱性限制，超過時 multer 不會收到完整 body，所以這裡先擋下來、給明確錯誤。
 * - MIME：僅接受 image/*。HEIC 等瀏覽器無法 preview 的格式仍會通過 image/*，
 *   但至少擋掉誤上傳 PDF/影片/壓縮檔的情境。
 */
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_BYTES,
  },
  fileFilter(req, file, cb) {
    const mt = String(file.mimetype || '').toLowerCase();
    if (!mt.startsWith('image/')) {
      const err = new Error(`不支援的檔案類型「${file.mimetype || '未知'}」，僅接受圖片`);
      err.code = 'UNSUPPORTED_FILE_TYPE';
      return cb(err);
    }
    return cb(null, true);
  },
});

/**
 * 文件附件上傳：接受 PDF 與圖片（檢測報告、證明文件常見格式）。
 */
const documentUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_BYTES,
  },
  fileFilter(req, file, cb) {
    const mt = String(file.mimetype || '').toLowerCase();
    if (!mt.startsWith('image/') && mt !== 'application/pdf') {
      const err = new Error(`不支援的檔案類型「${file.mimetype || '未知'}」，僅接受 PDF 或圖片`);
      err.code = 'UNSUPPORTED_FILE_TYPE';
      return cb(err);
    }
    return cb(null, true);
  },
});

module.exports = { upload, documentUpload, MAX_FILE_BYTES };
