CREATE TABLE IF NOT EXISTS dpp_exports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_passport_id BIGINT UNSIGNED NOT NULL,
  export_type ENUM('consumer', 'b2b', 'audit') NOT NULL,
  format ENUM('json', 'csv', 'excel', 'pdf') NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  exported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  exported_by VARCHAR(100) NULL,
  CONSTRAINT fk_dpp_exports_product_passport
    FOREIGN KEY (product_passport_id) REFERENCES product_passports(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_dpp_exports_product_passport_id (product_passport_id),
  INDEX idx_dpp_exports_export_type (export_type),
  INDEX idx_dpp_exports_format (format)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

