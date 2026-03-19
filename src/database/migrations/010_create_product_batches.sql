CREATE TABLE IF NOT EXISTS product_batches (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  product_version_id BIGINT UNSIGNED NOT NULL,
  batch_no VARCHAR(100) NOT NULL UNIQUE,
  manufacture_date DATE NULL,
  expiry_date DATE NULL,
  note TEXT NULL,
  status ENUM('draft', 'active', 'inactive') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_batches_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_product_batches_product_version
    FOREIGN KEY (product_version_id) REFERENCES product_versions(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_product_batches_product_id (product_id),
  INDEX idx_product_batches_product_version_id (product_version_id),
  INDEX idx_product_batches_manufacture_date (manufacture_date),
  INDEX idx_product_batches_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

