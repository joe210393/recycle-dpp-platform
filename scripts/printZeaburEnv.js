/* eslint-disable no-console */
/**
 * 輸出 .env.zeabur 內容，供複製到 Zeabur → 環境變數 →「Edit as Raw」。
 *
 * 會自動略過 PORT= 這一行：Zeabur 會注入正確的 PORT（多為 8080），若貼上
 * PORT=3000 會蓋掉平台變數，Node 監聽錯誤埠 → 全站 502 Bad Gateway。
 *
 * 使用：npm run zeabur:print-env
 * macOS：npm run zeabur:print-env | pbcopy
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

const raw = fs.readFileSync(p, 'utf8');
const lines = raw.split(/\r?\n/);
const out = [];
out.push('# Zeabur：勿設定 PORT，由平台自動注入（自行貼 PORT=3000 會導致 502）');
for (const line of lines) {
  if (/^\s*PORT\s*=/i.test(line)) continue;
  out.push(line);
}
process.stdout.write(out.join('\n'));
if (!raw.endsWith('\n')) process.stdout.write('\n');
