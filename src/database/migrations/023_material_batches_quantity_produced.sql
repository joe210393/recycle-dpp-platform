SET @material_batches_quantity_produced_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'material_batches'
    AND COLUMN_NAME = 'quantity_produced'
);

SET @material_batches_quantity_produced_sql := IF(
  @material_batches_quantity_produced_exists = 0,
  'ALTER TABLE material_batches ADD COLUMN quantity_produced DECIMAL(12,3) NULL AFTER source_recycled_batch_id',
  'SELECT 1'
);

PREPARE material_batches_quantity_produced_stmt FROM @material_batches_quantity_produced_sql;
EXECUTE material_batches_quantity_produced_stmt;
DEALLOCATE PREPARE material_batches_quantity_produced_stmt;
