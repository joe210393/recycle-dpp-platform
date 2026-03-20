ALTER TABLE material_batches
  ADD COLUMN quantity_produced DECIMAL(12,3) NULL
  AFTER source_recycled_batch_id;
