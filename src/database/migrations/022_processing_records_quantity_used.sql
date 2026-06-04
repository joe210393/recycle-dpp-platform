SET @processing_records_quantity_used_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'processing_records'
    AND COLUMN_NAME = 'quantity_used'
);

SET @processing_records_quantity_used_sql := IF(
  @processing_records_quantity_used_exists = 0,
  'ALTER TABLE processing_records ADD COLUMN quantity_used DECIMAL(12,3) NOT NULL DEFAULT 0 AFTER recycled_batch_id',
  'SELECT 1'
);

PREPARE processing_records_quantity_used_stmt FROM @processing_records_quantity_used_sql;
EXECUTE processing_records_quantity_used_stmt;
DEALLOCATE PREPARE processing_records_quantity_used_stmt;
