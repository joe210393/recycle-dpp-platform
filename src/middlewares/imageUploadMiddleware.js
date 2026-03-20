const { upload } = require('./uploadMiddleware');

/**
 * 支援「圖片上傳」+「填網址/路徑」雙模式：
 * - file input: <key>_file
 * - url input: <key>
 * 若有上傳檔，會把 req.body[key] 覆蓋成 `/uploads/<filename>`
 */
function imageUpload(keys = []) {
  const uploadFields = keys.map((key) => ({
    name: `${key}_file`,
    maxCount: 1,
  }));

  const uploadMw = upload.fields(uploadFields);

  return [
    uploadMw,
    (req, res, next) => {
      for (const key of keys) {
        const uploadKey = `${key}_file`;
        const fileArr = req.files && req.files[uploadKey] ? req.files[uploadKey] : null;
        if (fileArr && fileArr[0] && fileArr[0].filename) {
          req.body[key] = `/uploads/${fileArr[0].filename}`;
        }
      }
      next();
    },
  ];
}

module.exports = { imageUpload };

