const path = require('path');
const { upload, MAX_FILE_BYTES } = require('./uploadMiddleware');

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

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: () => `上傳檔案過大（單檔上限 ${Math.round(MAX_FILE_BYTES / (1024 * 1024))}MB）`,
  LIMIT_FILE_COUNT: () => '上傳檔案數量超過限制',
  LIMIT_UNEXPECTED_FILE: () => '上傳欄位名稱不符（請重新整理編輯頁再試）',
  LIMIT_FIELD_COUNT: () => '表單欄位過多',
  LIMIT_FIELD_KEY: () => '欄位名稱過長',
  LIMIT_FIELD_VALUE: () => '欄位內容過長',
  LIMIT_PART_COUNT: () => '表單分段過多',
};

/**
 * 把 multer / fileFilter 拋出的錯誤轉成「表單錯誤」：
 * - 寫到 req.uploadError，後續 controller 會在進 service 前丟出來，
 *   讓表單頁帶錯誤訊息重新渲染（不會走到全域 500 頁）。
 * - 維持 req.body / req.files 至少為物件，避免下游空指針。
 */
function toFriendlyUploadError(err) {
  if (!err) return null;
  if (err.name === 'MulterError') {
    const fn = MULTER_MESSAGES[err.code];
    return fn ? fn() : `上傳失敗：${err.message || err.code}`;
  }
  if (err.code === 'UNSUPPORTED_FILE_TYPE') {
    return err.message;
  }
  return err.message || '上傳失敗';
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
          const friendly = toFriendlyUploadError(err);
          debugUpload(req, {
            stage: 'multer-error',
            errorName: err.name,
            errorCode: err.code,
            errorMessage: err.message,
            friendly,
          });
          // 不要直接 next(err)（會走到 500 頁），改成把錯誤掛到 req
          // 讓 controller 帶著表單資料重新渲染、顯示明確訊息。
          req.uploadError = friendly;
          if (!req.body || typeof req.body !== 'object') req.body = {};
          if (!req.files || typeof req.files !== 'object') req.files = {};
          return next();
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
