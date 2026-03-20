const path = require('path');

/**
 * 上傳檔實體目錄。容器唯讀時可設環境變數 UPLOAD_DIR=/tmp/uploads。
 * 靜態路徑仍為 URL `/uploads/...`（見 app.js）。
 */
function getUploadDir() {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), 'uploads');
}

module.exports = { getUploadDir };
