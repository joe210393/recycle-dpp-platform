-- 讓文件可以處於「未綁定」狀態（商品護照編輯頁解除文件綁定時使用）
ALTER TABLE documents
  MODIFY target_type ENUM(
    'recycler',
    'recycled_batch',
    'processing_record',
    'material',
    'material_batch',
    'product',
    'product_batch',
    'product_passport'
  ) NULL,
  MODIFY target_id BIGINT UNSIGNED NULL;
