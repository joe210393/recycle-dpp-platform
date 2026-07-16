const path = require('path');
const { upload, documentUpload } = require('./uploadMiddleware');
const { toFriendlyUploadError } = require('./imageUploadMiddleware');

function buildSingleUploadApi(uploader, fieldName, emptyMessage) {
  return (req, res, next) => {
    uploader.single(fieldName)(req, res, (err) => {
      if (err) {
        const msg = toFriendlyUploadError(err);
        return res.status(400).json({ error: msg });
      }
      const f = req.file;
      if (!f) {
        return res.status(400).json({ error: emptyMessage });
      }
      const name = f.filename || (f.path ? path.basename(f.path) : '');
      if (!name) {
        return res.status(500).json({ error: '上傳處理異常' });
      }
      req.mediaUploadUrl = `/uploads/${name}`;
      return next();
    });
  };
}

/**
 * POST /admin/api/media：單檔 multipart，欄位名 `file`。
 * 成功時設 req.mediaUploadUrl = '/uploads/...'
 */
function singleImageUploadApi(fieldName = 'file') {
  return buildSingleUploadApi(upload, fieldName, '請選擇圖片檔案');
}

/**
 * POST /admin/api/media/document：文件檔（PDF / 圖片）。
 */
function singleDocumentUploadApi(fieldName = 'file') {
  return buildSingleUploadApi(documentUpload, fieldName, '請選擇檔案');
}

module.exports = { singleImageUploadApi, singleDocumentUploadApi };
