CREATE TABLE IF NOT EXISTS documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  target_type ENUM(
    'recycler',
    'recycled_batch',
    'processing_record',
    'material',
    'material_batch',
    'product',
    'product_batch',
    'product_passport'
  ) NOT NULL,
  target_id BIGINT UNSIGNED NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  summary TEXT NULL,
  visibility_level ENUM('consumer', 'b2b', 'audit', 'internal') NOT NULL DEFAULT 'internal',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_documents_target (target_type, target_id),
  INDEX idx_documents_type (document_type),
  INDEX idx_documents_visibility (visibility_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

