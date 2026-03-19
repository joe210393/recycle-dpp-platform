CREATE TABLE IF NOT EXISTS passport_views (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_passport_id BIGINT UNSIGNED NOT NULL,
  view_type ENUM('consumer', 'b2b', 'audit') NOT NULL,
  config_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_passport_views_product_passport
    FOREIGN KEY (product_passport_id) REFERENCES product_passports(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uk_passport_views_passport_view (product_passport_id, view_type),
  INDEX idx_passport_views_view_type (view_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

