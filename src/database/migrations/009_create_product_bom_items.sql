CREATE TABLE IF NOT EXISTS product_bom_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_version_id BIGINT UNSIGNED NOT NULL,
  material_id BIGINT UNSIGNED NOT NULL,
  material_role VARCHAR(100) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  public_visible TINYINT(1) NOT NULL DEFAULT 1,
  note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_bom_items_product_version
    FOREIGN KEY (product_version_id) REFERENCES product_versions(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_product_bom_items_material
    FOREIGN KEY (material_id) REFERENCES materials(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY uk_product_bom_version_material (product_version_id, material_id),
  INDEX idx_product_bom_items_product_version_id (product_version_id),
  INDEX idx_product_bom_items_material_id (material_id),
  INDEX idx_product_bom_items_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

