const path = require('path');
const { upload } = require('./uploadMiddleware');
const { toFriendlyUploadError } = require('./imageUploadMiddleware');

/**
 * POST /admin/api/media：單檔 multipart，欄位名 `file`。
 * 成功時設 req.mediaUploadUrl = '/uploads/...'
 */
function singleImageUploadApi(fieldName = 'file') {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        const msg = toFriendlyUploadError(err);
        return res.status(400).json({ error: msg });
      }
      const f = req.file;
      if (!f) {
        return res.status(400).json({ error: '請選擇圖片檔案' });
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

module.exports = { singleImageUploadApi };
