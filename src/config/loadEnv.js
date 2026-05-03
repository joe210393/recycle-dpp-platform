const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * 載入順序：
 * 1) 專案根目錄 `.env`（本機常規）
 * 2) 專案根目錄 `.env.zeabur`（若存在則覆蓋同名鍵）— SENWEI Zeabur 連線與 UPLOAD_DIR
 *
 * `.env.zeabur` 已列入 .gitignore，不會被推上 Git；Zeabur 線上請用面板「Edit as Raw」
 * 貼上同一套內容，或執行 `npm run zeabur:print-env` 複製貼上。
 */
function loadEnv() {
  dotenv.config();
  const zeaburPath = path.join(process.cwd(), '.env.zeabur');
  if (fs.existsSync(zeaburPath)) {
    dotenv.config({ path: zeaburPath, override: true });
  }
}

loadEnv();

module.exports = { loadEnv };
