ALTER TABLE processing_records
  ADD COLUMN quantity_used DECIMAL(12,3) NOT NULL DEFAULT 0
  AFTER recycled_batch_id;
