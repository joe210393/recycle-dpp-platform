-- 處理日期改為 DATETIME，可記錄時間；語意為 Asia/Taipei (GMT+8) 牆上時間
ALTER TABLE processing_records
  MODIFY COLUMN process_date DATETIME NULL;
