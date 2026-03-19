CREATE TABLE IF NOT EXISTS product_passports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  product_version_id BIGINT UNSIGNED NOT NULL,
  product_batch_id BIGINT UNSIGNED NOT NULL,
  passport_code VARCHAR(100) NOT NULL UNIQUE,
  public_url VARCHAR(255) NULL,
  qr_code_path VARCHAR(255) NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_passports_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_product_passports_product_version
    FOREIGN KEY (product_version_id) REFERENCES product_versions(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_product_passports_product_batch
    FOREIGN KEY (product_batch_id) REFERENCES product_batches(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY uk_product_passports_batch (product_batch_id),
  INDEX idx_product_passports_product_id (product_id),
  INDEX idx_product_passports_product_version_id (product_version_id),
  INDEX idx_product_passports_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

