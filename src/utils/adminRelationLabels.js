const { getPool } = require('../config/db');

function withPrompt(options, prompt, emptyMessage) {
  if (options.length > 0) return [{ value: '', label: prompt }, ...options];
  return [{ value: '', label: emptyMessage }];
}

function compact(parts) {
  return parts.filter((p) => p !== null && p !== undefined && String(p).trim() !== '');
}

function labelWithId(label, id) {
  return `${label || '未命名'}（ID:${id}）`;
}

const referenceQueries = {
  recycler: `
    SELECT id, name, code, tax_id
    FROM recyclers
    ORDER BY id DESC
  `,
  recycledItem: `
    SELECT id, name, code, category
    FROM recycled_items
    ORDER BY id DESC
  `,
  recycledBatch: `
    SELECT
      rb.id,
      rb.batch_no,
      rb.quantity,
      rb.unit,
      ri.name AS recycled_item_name,
      r.name AS recycler_name
    FROM recycled_batches rb
    LEFT JOIN recycled_items ri ON ri.id = rb.recycled_item_id
    LEFT JOIN recyclers r ON r.id = rb.recycler_id
    ORDER BY rb.id DESC
  `,
  processingRecord: `
    SELECT
      pr.id,
      pr.process_no,
      pr.process_date,
      rb.batch_no AS recycled_batch_no
    FROM processing_records pr
    LEFT JOIN recycled_batches rb ON rb.id = pr.recycled_batch_id
    ORDER BY pr.id DESC
  `,
  material: `
    SELECT id, name, code, category
    FROM materials
    ORDER BY id DESC
  `,
  materialBatch: `
    SELECT
      mb.id,
      mb.batch_no,
      mb.material_id,
      mb.quantity_produced,
      m.name AS material_name,
      m.code AS material_code
    FROM material_batches mb
    LEFT JOIN materials m ON m.id = mb.material_id
    ORDER BY mb.id DESC
  `,
  product: `
    SELECT id, name, sku, status
    FROM products
    ORDER BY id DESC
  `,
  productVersion: `
    SELECT
      pv.id,
      pv.version_no,
      pv.version_name,
      pv.status,
      p.name AS product_name,
      p.sku AS product_sku
    FROM product_versions pv
    LEFT JOIN products p ON p.id = pv.product_id
    ORDER BY pv.id DESC
  `,
  productBatch: `
    SELECT
      pb.id,
      pb.batch_no,
      pb.status,
      p.name AS product_name,
      p.sku AS product_sku,
      pv.version_no,
      pv.version_name
    FROM product_batches pb
    LEFT JOIN products p ON p.id = pb.product_id
    LEFT JOIN product_versions pv ON pv.id = pb.product_version_id
    ORDER BY pb.id DESC
  `,
  productPassport: `
    SELECT
      pp.id,
      pp.passport_code,
      pp.status,
      p.name AS product_name,
      pb.batch_no
    FROM product_passports pp
    LEFT JOIN products p ON p.id = pp.product_id
    LEFT JOIN product_batches pb ON pb.id = pp.product_batch_id
    ORDER BY pp.id DESC
  `,
};

const labelers = {
  recycler: (r) =>
    labelWithId(compact([r.name, r.code ? `代碼 ${r.code}` : null]).join(' / '), r.id),
  recycledItem: (r) =>
    labelWithId(compact([r.name, r.code, r.category]).join(' / '), r.id),
  recycledBatch: (r) =>
    labelWithId(
      compact([r.batch_no, r.recycled_item_name, r.recycler_name]).join(' / '),
      r.id
    ),
  processingRecord: (r) =>
    labelWithId(compact([r.process_no, r.recycled_batch_no]).join(' / '), r.id),
  material: (r) =>
    labelWithId(compact([r.name, r.code, r.category]).join(' / '), r.id),
  materialBatch: (r) =>
    labelWithId(compact([r.batch_no, r.material_name, r.material_code]).join(' / '), r.id),
  product: (r) =>
    labelWithId(compact([r.name, r.sku]).join(' / '), r.id),
  productVersion: (r) =>
    labelWithId(
      compact([r.product_name, r.version_no, r.version_name]).join(' / '),
      r.id
    ),
  productBatch: (r) =>
    labelWithId(
      compact([r.product_name, r.batch_no, r.version_no, r.version_name]).join(' / '),
      r.id
    ),
  productPassport: (r) =>
    labelWithId(compact([r.passport_code, r.product_name, r.batch_no]).join(' / '), r.id),
};

const targetTypeToReference = {
  recycler: 'recycler',
  recycled_batch: 'recycledBatch',
  processing_record: 'processingRecord',
  material: 'material',
  material_batch: 'materialBatch',
  product: 'product',
  product_batch: 'productBatch',
  product_passport: 'productPassport',
};

const documentTargetTypes = [
  { value: 'recycler', label: '回收廠商' },
  { value: 'recycled_batch', label: '回收批次' },
  { value: 'processing_record', label: '處理紀錄' },
  { value: 'material', label: '材料' },
  { value: 'material_batch', label: '材料批次' },
  { value: 'product', label: '商品' },
  { value: 'product_batch', label: '商品批次' },
  { value: 'product_passport', label: '商品護照' },
];

async function fetchReferenceRows(type) {
  const sql = referenceQueries[type];
  if (!sql) throw new Error(`Unknown admin reference type: ${type}`);
  const pool = await getPool();
  const [rows] = await pool.query(sql);
  return rows;
}

async function getReferenceOptions(type, prompt, emptyMessage) {
  const rows = await fetchReferenceRows(type);
  const labeler = labelers[type];
  const options = rows.map((row) => ({
    value: String(row.id),
    label: labeler(row),
  }));
  return withPrompt(options, prompt, emptyMessage);
}

async function getReferenceMap(type) {
  const rows = await fetchReferenceRows(type);
  const labeler = labelers[type];
  return new Map(rows.map((row) => [String(row.id), labeler(row)]));
}

async function decorateRowsWithReferences(rows, specs) {
  if (!rows || rows.length === 0) return rows;
  const types = Array.from(new Set(specs.map((s) => s.type)));
  const maps = {};
  await Promise.all(
    types.map(async (type) => {
      maps[type] = await getReferenceMap(type);
    })
  );
  return rows.map((row) => {
    const out = { ...row };
    for (const spec of specs) {
      const raw = row[spec.sourceKey];
      const key = spec.targetKey || spec.sourceKey;
      out[key] =
        raw === null || raw === undefined || raw === ''
          ? ''
          : maps[spec.type].get(String(raw)) || `ID:${raw}`;
    }
    return out;
  });
}

async function getDocumentTargetSelectFields(record) {
  const fields = [];
  for (const item of documentTargetTypes) {
    const refType = targetTypeToReference[item.value];
    fields.push({
      key: `target_id_${item.value}`,
      label: `${item.label}對象`,
      type: 'select',
      options: await getReferenceOptions(refType, `請選擇${item.label}`, `請先建立${item.label}`),
      required: true,
      showWhenKey: 'target_type',
      showWhenValue: item.value,
    });
  }

  if (record && record.target_type && record.target_id) {
    const selectedKey = `target_id_${record.target_type}`;
    return fields.map((field) =>
      field.key === selectedKey ? { ...field, defaultValue: record.target_id } : field
    );
  }
  return fields;
}

async function decorateDocumentTargetRows(rows) {
  if (!rows || rows.length === 0) return rows;
  const refTypes = Array.from(
    new Set(
      rows
        .map((row) => targetTypeToReference[row.target_type])
        .filter(Boolean)
    )
  );
  const maps = {};
  await Promise.all(
    refTypes.map(async (type) => {
      maps[type] = await getReferenceMap(type);
    })
  );
  return rows.map((row) => {
    const refType = targetTypeToReference[row.target_type];
    const targetLabel =
      refType && row.target_id
        ? maps[refType].get(String(row.target_id)) || `ID:${row.target_id}`
        : '';
    return {
      ...row,
      target_type_label: getDocumentTargetTypeLabel(row.target_type),
      target_label: targetLabel,
    };
  });
}

function getDocumentTargetTypeLabel(type) {
  const found = documentTargetTypes.find((item) => item.value === type);
  return found ? found.label : type;
}

module.exports = {
  decorateRowsWithReferences,
  decorateDocumentTargetRows,
  documentTargetTypes,
  getDocumentTargetSelectFields,
  getDocumentTargetTypeLabel,
  getReferenceOptions,
  targetTypeToReference,
  withPrompt,
};
