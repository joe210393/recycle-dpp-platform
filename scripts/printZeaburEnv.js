/* eslint-disable no-console */
/**
 * 從專案根目錄 `.env` 輸出給 Zeabur → 環境變數 →「Edit as Raw」。
 * 會略過 PORT= 與以 # 開頭的整行（Zeabur 勿覆蓋平台 PORT）。
 *
 * 使用：npm run zeabur:print-env
 * macOS：npm run zeabur:print-env | pbcopy
 */
const fs = require('fs');
const path = require('path');

const p = path.join(process.cwd(), '.env');
if (!fs.existsSync(p)) {
  console.error(
    '找不到 .env。請複製 .env.example 為 .env 並填入 MYSQL_PASSWORD 等，或見根目錄「Zeabur設定步驟.txt」。'
  );
  process.exit(1);
}

const raw = fs.readFileSync(p, 'utf8');
const lines = raw.split(/\r?\n/);
const out = [];
out.push('# Zeabur：勿設定 PORT，由平台自動注入（自行貼 PORT=3000 會導致 502）');
for (const line of lines) {
  const t = line.trim();
  if (t === '' || t.startsWith('#')) continue;
  if (/^\s*PORT\s*=/i.test(line)) continue;
  out.push(line);
}
process.stdout.write(out.join('\n'));
process.stdout.write('\n');
