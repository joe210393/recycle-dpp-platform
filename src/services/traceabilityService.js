const { getPool } = require('../config/db');
const { getDefaultConfig } = require('../config/passportViews');

function ensureObject(maybeJson) {
  if (!maybeJson) return null;
  if (typeof maybeJson === 'object') return maybeJson;
  if (typeof maybeJson === 'string') return JSON.parse(maybeJson);
  return null;
}

async function listPublicProducts({ limit = 50 } = {}) {
  const pool = await getPool();
  const sql =
    'SELECT id, name, category, short_description, main_image, slug FROM products WHERE is_public = 1 AND status = ? ORDER BY id DESC LIMIT ?';
  const [rows] = await pool.query(sql, ['active', limit]);
  return rows;
}

async function getProductDetailBySlug(slug) {
  const pool = await getPool();

  const [productRows] = await pool.query(
    'SELECT id, name, sku, category, short_description, usage_instruction, caution, specification, main_image, slug, passport_enabled, status FROM products WHERE slug = ? LIMIT 1',
    [slug]
  );
  const product = productRows[0];
  if (!product) return null;

  // Use latest active version if available; otherwise fallback to latest version.
  const [versionRows] = await pool.query(
    'SELECT * FROM product_versions WHERE product_id = ? AND status = ? ORDER BY effective_date DESC, id DESC LIMIT 1',
    [product.id, 'active']
  );
  let version = versionRows[0];
  if (!version) {
    const [fallbackRows] = await pool.query(
      'SELECT * FROM product_versions WHERE product_id = ? ORDER BY id DESC LIMIT 1',
      [product.id]
    );
    version = fallbackRows[0];
  }

  if (!version) {
    return { product, version: null, bomItems: [] };
  }

  const [bomRows] = await pool.query(
    `SELECT
      pbi.id,
      pbi.material_id,
      pbi.material_role,
      pbi.sort_order,
      pbi.public_visible,
      m.name AS material_name,
      m.code AS material_code,
      m.public_description AS material_public_description,
      m.category AS material_category
    FROM product_bom_items pbi
    JOIN materials m ON m.id = pbi.material_id
    WHERE pbi.product_version_id = ? AND pbi.public_visible = 1
    ORDER BY pbi.sort_order ASC, pbi.id ASC`,
    [version.id]
  );

  return {
    product,
    version,
    bomItems: bomRows,
  };
}

async function getPassportDetailByCode(passportCode, viewType = 'consumer') {
  const pool = await getPool();

  const [passportRows] = await pool.query(
    `SELECT
      pp.*,
      p.name AS product_name,
      p.category AS product_category,
      p.short_description AS product_short_description,
      p.usage_instruction,
      p.caution,
      p.specification,
      p.main_image AS product_main_image,
      p.slug AS product_slug,
      pv.version_no,
      pv.version_name,
      pb.batch_no,
      pb.manufacture_date,
      pb.expiry_date
    FROM product_passports pp
    JOIN products p ON p.id = pp.product_id
    JOIN product_versions pv ON pv.id = pp.product_version_id
    JOIN product_batches pb ON pb.id = pp.product_batch_id
    WHERE pp.passport_code = ?
    AND pp.status = 'published'
    LIMIT 1`,
    [passportCode]
  );

  const passport = passportRows[0];
  if (!passport) return null;

  // View config (consumer/b2b/audit) controls which sections to show.
  const [viewRows] = await pool.query(
    'SELECT view_type, config_json FROM passport_views WHERE product_passport_id = ? AND view_type = ? LIMIT 1',
    [passport.id, viewType]
  );
  const viewRow = viewRows[0];
  const config = viewRow ? ensureObject(viewRow.config_json) : getDefaultConfig(viewType);

  // Materials used by this product batch (link table = the most important bridge).
  const [materialRows] = await pool.query(
    `SELECT
      pbmb.id,
      pbmb.product_batch_id,
      pbmb.material_id,
      pbmb.material_batch_id,
      pbi.material_role,
      mb.batch_no AS material_batch_no,
      mb.produced_date,
      mb.expiry_date,
      mb.test_report_summary,
      mb.status AS material_batch_status,
      m.name AS material_name,
      m.code AS material_code,
      m.public_description AS material_public_description
    FROM product_batch_material_batches pbmb
    JOIN material_batches mb ON mb.id = pbmb.material_batch_id
    JOIN materials m ON m.id = pbmb.material_id
    LEFT JOIN product_bom_items pbi
      ON pbi.product_version_id = ?
      AND pbi.material_id = pbmb.material_id
    WHERE pbmb.product_batch_id = ?
    ORDER BY pbi.sort_order ASC, pbmb.id ASC`,
    [passport.product_version_id, passport.product_batch_id]
  );

  // Trace chain: for MVP we show unique recycler + recycled batch + processing records
  const [traceRows] = await pool.query(
    `SELECT
      r.id AS recycler_id,
      r.name AS recycler_name,
      r.certificate_no AS recycler_certificate_no,
      rb.id AS recycled_batch_id,
      rb.batch_no AS recycled_batch_no,
      rb.trace_code AS recycled_trace_code,
      rb.trace_url AS recycled_trace_url,
      rb.source_location,
      pr.id AS processing_record_id,
      pr.process_no,
      pr.process_method,
      pr.process_date
    FROM product_batch_material_batches pbmb
    JOIN material_batches mb ON mb.id = pbmb.material_batch_id
    JOIN processing_records pr ON pr.id = mb.processing_record_id
    JOIN recycled_batches rb ON rb.id = pr.recycled_batch_id
    JOIN recyclers r ON r.id = rb.recycler_id
    WHERE pbmb.product_batch_id = ?`,
    [passport.product_batch_id]
  );

  // Documents attached to this passport.
  const [docRows] = await pool.query(
    `SELECT id, document_type, title, file_path, summary, visibility_level, created_at
     FROM documents
     WHERE target_type = 'product_passport' AND target_id = ?
       AND visibility_level = ?
     ORDER BY created_at DESC`,
    [passport.id, viewType]
  );

  return {
    passport,
    viewType,
    config,
    materials: materialRows,
    trace: traceRows,
    documents: docRows,
  };
}

async function lookupByBatchNo({ batchNo }) {
  const pool = await getPool();

  const [rows] = await pool.query(
    `SELECT
      pb.batch_no,
      pb.manufacture_date,
      pb.expiry_date,
      p.id AS product_id,
      p.name AS product_name,
      p.slug AS product_slug,
      pv.id AS product_version_id,
      pv.version_no,
      pp.id AS product_passport_id,
      pp.passport_code
    FROM product_batches pb
    JOIN products p ON p.id = pb.product_id
    JOIN product_versions pv ON pv.id = pb.product_version_id
    JOIN product_passports pp ON pp.product_batch_id = pb.id
    WHERE pb.batch_no = ?
      AND pp.status = 'published'
    LIMIT 20`,
    [batchNo]
  );

  return rows;
}

module.exports = {
  listPublicProducts,
  getProductDetailBySlug,
  getPassportDetailByCode,
  lookupByBatchNo,
};

