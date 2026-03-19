CREATE TABLE IF NOT EXISTS material_batches (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  material_id BIGINT UNSIGNED NOT NULL,
  batch_no VARCHAR(100) NOT NULL UNIQUE,
  processing_record_id BIGINT UNSIGNED NOT NULL,
  source_recycled_batch_id BIGINT UNSIGNED NOT NULL,
  produced_date DATE NULL,
  expiry_date DATE NULL,
  test_report_summary TEXT NULL,
  attachment_file VARCHAR(255) NULL,
  status ENUM('active', 'inactive', 'used_up') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_material_batches_material
    FOREIGN KEY (material_id) REFERENCES materials(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_material_batches_processing_record
    FOREIGN KEY (processing_record_id) REFERENCES processing_records(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_material_batches_source_recycled_batch
    FOREIGN KEY (source_recycled_batch_id) REFERENCES recycled_batches(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_material_batches_material_id (material_id),
  INDEX idx_material_batches_processing_record_id (processing_record_id),
  INDEX idx_material_batches_source_recycled_batch_id (source_recycled_batch_id),
  INDEX idx_material_batches_produced_date (produced_date),
  INDEX idx_material_batches_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

