const path = require('path');
const { upload } = require('./uploadMiddleware');

function isUploadDebugEnabled() {
  const v = String(process.env.DEBUG_UPLOAD_LOG || '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function debugUpload(req, payload) {
  if (!isUploadDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.log('[upload-debug]', {
    method: req.method,
    url: req.originalUrl || req.url,
    ...payload,
  });
}

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
        if (err) {
          debugUpload(req, {
            stage: 'multer-error',
            errorName: err.name,
            errorCode: err.code,
            errorMessage: err.message,
          });
          return next(err);
        }
        debugUpload(req, {
          stage: 'multer-ok',
          bodyHeroImagePath: req.body && req.body.hero_image_path,
          fileFields: Object.keys(req.files || {}),
        });
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
      debugUpload(req, {
        stage: 'post-map',
        bodyHeroImagePath: req.body && req.body.hero_image_path,
        fileFields: Object.keys(req.files || {}),
      });
      next();
    },
  ];
}

module.exports = { imageUpload };

