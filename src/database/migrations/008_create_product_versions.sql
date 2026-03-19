CREATE TABLE IF NOT EXISTS product_versions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  version_no VARCHAR(50) NOT NULL,
  version_name VARCHAR(255) NULL,
  effective_date DATE NULL,
  note TEXT NULL,
  status ENUM('draft', 'active', 'inactive') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_versions_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uk_product_versions_product_version (product_id, version_no),
  INDEX idx_product_versions_product_id (product_id),
  INDEX idx_product_versions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

