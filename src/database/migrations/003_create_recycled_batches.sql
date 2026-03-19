CREATE TABLE IF NOT EXISTS recycled_batches (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recycled_item_id BIGINT UNSIGNED NOT NULL,
  recycler_id BIGINT UNSIGNED NOT NULL,
  batch_no VARCHAR(100) NOT NULL UNIQUE,
  received_date DATE NULL,
  quantity DECIMAL(12,3) NULL,
  unit VARCHAR(50) NULL,
  source_location VARCHAR(255) NULL,
  trace_code VARCHAR(100) NULL,
  trace_url VARCHAR(255) NULL,
  certificate_no VARCHAR(100) NULL,
  test_report_summary TEXT NULL,
  attachment_file VARCHAR(255) NULL,
  processed_status ENUM('pending', 'partial', 'processed') NOT NULL DEFAULT 'pending',
  public_visible TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_recycled_batches_item
    FOREIGN KEY (recycled_item_id) REFERENCES recycled_items(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_recycled_batches_recycler
    FOREIGN KEY (recycler_id) REFERENCES recyclers(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_recycled_batches_item_id (recycled_item_id),
  INDEX idx_recycled_batches_recycler_id (recycler_id),
  INDEX idx_recycled_batches_received_date (received_date),
  INDEX idx_recycled_batches_processed_status (processed_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

