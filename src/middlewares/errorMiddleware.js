/* eslint-disable no-unused-vars */
function errorMiddleware(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('[errorMiddleware]', err);

  let message = err && err.message ? err.message : 'Internal Server Error';
  let status = err && err.status ? Number(err.status) : 500;

  // Multer（檔案上傳）
  if (err && err.name === 'MulterError') {
    status = 400;
    const map = {
      LIMIT_FILE_SIZE: '上傳檔案過大',
      LIMIT_FILE_COUNT: '上傳檔案數量超過限制',
      LIMIT_UNEXPECTED_FILE: '上傳欄位名稱不符（請重新整理編輯頁再試）',
      LIMIT_FIELD_COUNT: '表單欄位過多',
      LIMIT_FIELD_KEY: '欄位名稱過長',
      LIMIT_FIELD_VALUE: '欄位內容過長',
      LIMIT_PART_COUNT: '表單分段過多',
    };
    message = map[err.code] || `上傳失敗：${err.message || err.code || '未知錯誤'}`;
  }

  if (status >= 400 && status < 500) {
    res.status(status);
  } else {
    res.status(500);
  }

  // Admin pages use HTML rendering; for API we'd use JSON.
  if (req.accepts('html')) {
    return res.render('public/error', { message, path: req.path });
  }

  return res.json({ error: message });
}

module.exports = { errorMiddleware };

