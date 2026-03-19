CREATE TABLE IF NOT EXISTS processing_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  process_no VARCHAR(100) NOT NULL UNIQUE,
  recycled_batch_id BIGINT UNSIGNED NOT NULL,
  process_method VARCHAR(255) NULL,
  process_date DATE NULL,
  result_note TEXT NULL,
  status ENUM('draft', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_processing_records_recycled_batch
    FOREIGN KEY (recycled_batch_id) REFERENCES recycled_batches(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_processing_records_recycled_batch_id (recycled_batch_id),
  INDEX idx_processing_records_process_date (process_date),
  INDEX idx_processing_records_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

