function toDateString(value) {
  if (!value) return '';
  const s = String(value);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : s;
}

function csvCell(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function csvRow(cells) {
  return cells.map(csvCell).join(',');
}

/**
 * 將護照詳情資料組成分區塊的 CSV 字串（含 UTF-8 BOM，Excel 開啟中文不亂碼）。
 */
function exportCsv(data) {
  const p = data.passport;
  const lines = [];

  lines.push(csvRow(['區塊', '欄位', '值']));
  lines.push(csvRow(['護照', '護照代碼', p.passport_code]));
  lines.push(csvRow(['護照', '檢視類型', data.viewType]));
  lines.push(csvRow(['商品', '商品名稱', p.product_name]));
  lines.push(csvRow(['商品', '分類', p.product_category || '']));
  lines.push(csvRow(['商品', '商品版本', p.version_no + (p.version_name ? `（${p.version_name}）` : '')]));
  lines.push(csvRow(['商品', '商品批次', p.batch_no]));
  lines.push(csvRow(['商品', '製造日期', toDateString(p.manufacture_date)]));
  lines.push(csvRow(['商品', '有效日期', toDateString(p.expiry_date)]));
  lines.push('');

  lines.push(csvRow(['材料', '材料名稱', '材料代碼', '角色', '材料批次', '製成日期', '有效日期', '檢測報告摘要']));
  for (const m of data.materials || []) {
    lines.push(
      csvRow([
        '材料',
        m.material_name,
        m.material_code,
        m.material_role || '',
        m.material_batch_no,
        toDateString(m.produced_date),
        toDateString(m.expiry_date),
        m.test_report_summary || '',
      ])
    );
  }
  lines.push('');

  lines.push(csvRow(['追溯', '回收廠商', '回收證號', '回收批次', '追溯編號', '追溯網址', '來源地', '處理單號', '處理方式', '處理日期']));
  for (const t of data.trace || []) {
    lines.push(
      csvRow([
        '追溯',
        t.recycler_name,
        t.recycler_certificate_no || '',
        t.recycled_batch_no,
        t.recycled_trace_code || '',
        t.recycled_trace_url || '',
        t.source_location || '',
        t.process_no || '',
        t.process_method || '',
        toDateString(t.process_date),
      ])
    );
  }

  if (data.documents && data.documents.length > 0) {
    lines.push('');
    lines.push(csvRow(['文件', '標題', '文件類型', '檔案路徑', '摘要']));
    for (const d of data.documents) {
      lines.push(csvRow(['文件', d.title, d.document_type, d.file_path || '', d.summary || '']));
    }
  }

  return '\uFEFF' + lines.join('\r\n');
}

module.exports = { exportCsv };
