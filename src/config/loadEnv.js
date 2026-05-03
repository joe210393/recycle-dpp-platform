const dotenv = require('dotenv');

/**
 * 專案根目錄 `.env`（已列入 .gitignore）。
 *
 * Zeabur 線上請在面板「環境變數」貼上與 .env 相同鍵值（可用 `npm run zeabur:print-env` 複製，會略過 PORT）。
 */
function loadEnv() {
  dotenv.config();
}

loadEnv();

module.exports = { loadEnv };
