# 開發與維運手冊

## 1. 本機需求

- Node.js 20+，目前 README 註明以 Node 22 測試。
- MySQL 8+。
- npm。

## 2. 安裝與啟動

```bash
npm install
cp .env.example .env
npm run migrate
npm start
```

開發模式：

```bash
npm run dev
```

常用網址：

- 前台首頁：`http://localhost:3000/`
- 商品護照查詢：`http://localhost:3000/passport`
- 後台首頁：`http://localhost:3000/admin`

## 3. 環境變數

資料庫可用 MySQL URL 或拆分變數設定。

| 變數 | 說明 |
| --- | --- |
| `PORT` | HTTP listen port，本機預設 `3000` |
| `MYSQL_URI`, `MYSQL_CONNECTION_STRING`, `DATABASE_URL` | MySQL connection URL，僅接受 `mysql://` 或 `mysql2://` |
| `DB_HOST`, `MYSQL_HOST` | DB host |
| `DB_PORT`, `MYSQL_PORT` | DB port，預設 `3306` |
| `DB_USER`, `MYSQL_USERNAME`, `MYSQL_USER` | DB user |
| `DB_PASSWORD`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` | DB password |
| `DB_NAME`, `MYSQL_DATABASE` | DB name，預設 `recycle_dpp_platform` |
| `UPLOAD_DIR` | 上傳檔案實體目錄，未設定時為專案內 `uploads` |

部署到 Zeabur 或容器平台時，建議設定持久化 `UPLOAD_DIR`，例如 `/data/uploads`。

## 4. 資料庫 Migration

執行：

```bash
npm run migrate
```

`scripts/migrate.js` 會：

1. 先確認 `DB_NAME` 僅含英數與底線。
2. 建立資料庫。
3. 依 migration 檔名前綴排序執行 `src/database/migrations/*.sql`。

`server.js` 啟動時也會檢查資料表是否存在；若偵測到缺表，會自動執行 migration。

### 增量 schema 補強

`src/utils/ensureIncrementalSchema.js` 會在啟動時確認：

- `processing_records.quantity_used`
- `material_batches.quantity_produced`

若缺欄位，會嘗試 `ALTER TABLE` 補上。這是為了處理既有資料庫未跑最新 migration 的情境。

## 5. Seed

目前 `scripts/seed.js` 尚未建立範例資料，只會輸出：

```text
[seed] no seeders configured yet
```

建議後續補一組最小可查詢資料：

1. 回收廠商、回收物、回收批次。
2. 處理紀錄與材料批次。
3. 商品、版本、BOM、商品批次。
4. 商品用料鏈結、published 商品護照。
5. consumer/b2b/audit 護照顯示設定與範例文件。

## 6. 新增後台 CRUD Resource 流程

若要新增一個資料表的後台 CRUD，建議流程：

1. 新增 migration SQL。
2. 新增 `src/models/<resource>Model.js`，使用 `buildCrudModel`。
3. 新增 `src/services/<resource>Service.js`，簡單 CRUD 可使用 `buildCrudService`。
4. 新增 `src/controllers/admin/<resource>AdminController.js`，定義 `listFields` 與 `formFields`。
5. 新增 `src/routes/admin/<resource>Routes.js`。
6. 在 `src/routes/admin/index.js` 的 `routes` 陣列掛載。
7. 在 `src/views/admin/layout.ejs` 補後台選單連結。
8. 如需驗證，新增或補齊 `src/validators/<resource>Validator.js`。

## 7. 新增前台頁面流程

1. 在 `src/routes/public/index.js` 新增 route。
2. 如需資料查詢，優先在 service 層新增方法。
3. 新增 `src/views/public/<page>.ejs`。
4. 使用既有 `public/css/styles.css` 與 header/footer 風格。
5. 如需後台可編輯內容，新增對應資料表、service、admin CRUD 與 fallback default。

## 8. 圖片與檔案

### 圖片上傳

- API：`POST /admin/api/media`
- 欄位名：`file`
- 成功回傳：`{ "url": "/uploads/<filename>" }`
- 上傳實體目錄：`UPLOAD_DIR`
- 對外靜態路徑：`/uploads`

後台圖片欄位目前支援：

- 選檔自動上傳。
- 手動貼上 `/uploads/...`、`/assets/...` 或 http(s) 圖片網址。
- 上傳檔案單檔上限為 20MB，僅接受圖片 MIME type。

### 匯出檔案

`/exports` 會對外提供專案根目錄 `exports` 下的檔案。

DPP 檔案下載：`GET /passports/:passportCode/export?format=json|csv&view=consumer|b2b|audit` 會依 `src/utils/exportJson.js` / `exportCsv.js` 即時產生檔案並觸發下載，同時自動寫入一筆 `dpp_exports` 紀錄（`exported_at` 由資料庫預設帶入，`exported_by` 為登入帳號或 `public`）。護照詳情頁提供 JSON / CSV 下載按鈕。`exportExcel.js`、`exportPdf.js` 尚未實作。

## 9. 測試建議

目前 `package.json` 尚未定義 test script。建議優先補以下測試：

- `recycledBatchQuantityService.computeProcessedStatus()` 狀態規則。
- `processingRecordWorkflowService.parseMaterialLines()` 表單解析。
- 建立處理紀錄時不可超用回收批次數量。
- 更新處理紀錄時，舊來源與新來源回收批次狀態同步。
- `traceabilityService.lookupByBatchNo()` 只返回 published 護照。
- `traceabilityService.getPassportDetailByCode()` 正確組合材料、追溯與文件。

## 10. 部署注意事項

### Zeabur

專案內有 `Zeabur設定步驟.txt` 與 `.env.zeabur.example` 可參考。

重點：

- 確認平台有設定 Node 啟動指令 `npm start`。
- 確認 `PORT` 是否由平台注入；若未注入且偵測到 Zeabur 環境，程式會使用 `8080`。
- MySQL 連線可用平台提供的 `MYSQL_URI`。
- `UPLOAD_DIR` 若未設持久化目錄，重部署後 `/uploads` 內檔案可能消失。

### MySQL 權限

啟動時可能需要：

- `CREATE DATABASE`
- `CREATE TABLE`
- `ALTER TABLE`
- `SELECT`, `INSERT`, `UPDATE`, `DELETE`

若正式環境不希望 app user 擁有 `CREATE/ALTER`，可改成部署流程先跑 migration，再關閉啟動時自動 migration/增量 schema 補強。

## 11. 已知限制

- 後台未實作登入與授權，不適合直接暴露於公開網路。
- validator 尚未補齊，部分錯誤會以 JSON 或 error page 呈現，使用者體驗不完整。
- 商品版本、商品批次、商品護照等表單仍有多處需手填 ID。
- 前台商品頁 `/product` 是品牌主打靜態內容，不等同 `/products` 的資料庫商品列表。
- `passport_views` 的 consumer/b2b/audit 預設內容目前幾乎相同，未真正區分揭露層級。
- `documents.target_type` 是 polymorphic 設計，資料庫不會自動保證 `target_id` 一定存在於對應資料表。

