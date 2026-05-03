/* eslint-disable no-console */
/**
 * 輸出 .env.zeabur 全文，方便複製到 Zeabur → 環境變數 →「Edit as Raw」。
 * 使用：npm run zeabur:print-env
 * macOS 一鍵進剪貼簿：npm run zeabur:print-env | pbcopy
 */
const fs = require('fs');
const path = require('path');

const p = path.join(process.cwd(), '.env.zeabur');
if (!fs.existsSync(p)) {
  console.error(
    '找不到 .env.zeabur。請複製 .env.zeabur.example 為 .env.zeabur 並填入 MYSQL_PASSWORD，或見根目錄「Zeabur設定步驟.txt」。'
  );
  process.exit(1);
}
process.stdout.write(fs.readFileSync(p, 'utf8'));
