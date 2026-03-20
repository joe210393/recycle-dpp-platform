const path = require('path');
const { upload } = require('./uploadMiddleware');

/**
 * 支援「圖片上傳」+「填網址/路徑」雙模式：
 * - file input: <key>_file
 * - url input: <key>
 * 若有上傳檔，會把 req.body[key] 覆蓋成 `/uploads/<filename>`（URL 固定，實體檔在 UPLOAD_DIR）
 */
function imageUpload(keys = []) {
  const uploadFields = keys.map((key) => ({
    name: `${key}_file`,
    maxCount: 1,
  }));

  const uploadMw = upload.fields(uploadFields);

  return [
    (req, res, next) => {
      uploadMw(req, res, (err) => {
        if (err) return next(err);
        return next();
      });
    },
    (req, res, next) => {
      for (const key of keys) {
        const uploadKey = `${key}_file`;
        const fileArr = req.files && req.files[uploadKey] ? req.files[uploadKey] : null;
        const f = fileArr && fileArr[0] ? fileArr[0] : null;
        if (!f) continue;
        const name = f.filename || (f.path ? path.basename(f.path) : '');
        if (name) {
          req.body[key] = `/uploads/${name}`;
        }
      }
      next();
    },
  ];
}

module.exports = { imageUpload };

