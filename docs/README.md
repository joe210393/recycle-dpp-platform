# SENWEI DPP 平台開發文件

本目錄整理 `recycle-dpp-platform` 目前版本的開發文件，供需求確認、開發交接、部署維運與後續擴充使用。

## 文件索引

- [01-product-spec.md](./01-product-spec.md)：產品定位、使用者角色、前後台功能規格、主要流程與驗收重點。
- [02-system-architecture.md](./02-system-architecture.md)：系統架構、目錄分層、請求流程、核心服務與部署架構。
- [03-data-model.md](./03-data-model.md)：資料表、關聯、狀態欄位、批次追溯鏈與資料建立順序。
- [04-development-runbook.md](./04-development-runbook.md)：本機開發、環境變數、資料庫 migration、部署與維運注意事項。

## 專案摘要

此專案是以 Node.js、Express、EJS 與 MySQL 實作的 SENWEI 品牌前台與 DPP 商品護照追溯平台。

主要能力包含：

- 前台品牌頁：首頁、關於我們、商品頁、商品護照查詢。
- 前台追溯頁：公開商品列表、商品詳情、批次查詢、商品護照詳情。
- 後台 CRUD：回收廠商、回收物、回收批次、處理紀錄、材料、商品、商品批次、商品護照、文件與 DPP 匯出紀錄。
- DPP 追溯鏈：回收批次 → 處理紀錄 → 材料批次 → 商品批次 → 商品護照。
- 前台內容管理：首頁 Hero、流程步驟、關於我們 Hero、商品頁 Hero、商品護照 Hero。
- 圖片上傳：後台圖片欄位透過 `/admin/api/media` 上傳到 `/uploads`。

## 目前狀態

- 已具備 MVP 所需的資料結構、後台資料維護、前台查詢與追溯顯示。
- 後台登入/權限仍是 placeholder，尚未真正保護 `/admin`。
- validator 檔案多為空陣列，目前主要依表單 required、資料庫約束與 service workflow 驗證。
- `scripts/seed.js` 目前未建立範例資料。

