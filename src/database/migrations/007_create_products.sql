CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100) NULL,
  short_description TEXT NULL,
  usage_instruction TEXT NULL,
  caution TEXT NULL,
  specification VARCHAR(255) NULL,
  main_image VARCHAR(255) NULL,
  is_public TINYINT(1) NOT NULL DEFAULT 1,
  passport_enabled TINYINT(1) NOT NULL DEFAULT 1,
  slug VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('draft', 'active', 'inactive') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_category (category),
  INDEX idx_products_status (status),
  INDEX idx_products_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

