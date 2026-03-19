CREATE TABLE IF NOT EXISTS product_batch_material_batches (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_batch_id BIGINT UNSIGNED NOT NULL,
  material_id BIGINT UNSIGNED NOT NULL,
  material_batch_id BIGINT UNSIGNED NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pbmb_product_batch
    FOREIGN KEY (product_batch_id) REFERENCES product_batches(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pbmb_material
    FOREIGN KEY (material_id) REFERENCES materials(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pbmb_material_batch
    FOREIGN KEY (material_batch_id) REFERENCES material_batches(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY uk_pbmb_unique_map (product_batch_id, material_id, material_batch_id),
  INDEX idx_pbmb_product_batch_id (product_batch_id),
  INDEX idx_pbmb_material_id (material_id),
  INDEX idx_pbmb_material_batch_id (material_batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

