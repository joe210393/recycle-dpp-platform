function toDateString(value) {
  if (!value) return null;
  const s = String(value);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : s;
}

/**
 * 將護照詳情資料（traceabilityService.getPassportDetailByCode 的回傳）
 * 組成 DPP JSON 字串。
 */
function exportJson(data) {
  const p = data.passport;

  const dpp = {
    schema: 'senwei-dpp',
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    viewType: data.viewType,
    passport: {
      code: p.passport_code,
      status: p.status,
      publicUrl: p.public_url || null,
    },
    product: {
      name: p.product_name,
      category: p.product_category || null,
      shortDescription: p.product_short_description || null,
      usageInstruction: p.usage_instruction || null,
      caution: p.caution || null,
      specification: p.specification || null,
    },
    productVersion: {
      versionNo: p.version_no,
      versionName: p.version_name || null,
    },
    productBatch: {
      batchNo: p.batch_no,
      manufactureDate: toDateString(p.manufacture_date),
      expiryDate: toDateString(p.expiry_date),
    },
    materials: (data.materials || []).map((m) => ({
      name: m.material_name,
      code: m.material_code,
      role: m.material_role || null,
      publicDescription: m.material_public_description || null,
      batchNo: m.material_batch_no,
      producedDate: toDateString(m.produced_date),
      expiryDate: toDateString(m.expiry_date),
      testReportSummary: m.test_report_summary || null,
    })),
    traceability: (data.trace || []).map((t) => ({
      recyclerName: t.recycler_name,
      recyclerCertificateNo: t.recycler_certificate_no || null,
      recycledBatchNo: t.recycled_batch_no,
      traceCode: t.recycled_trace_code || null,
      traceUrl: t.recycled_trace_url || null,
      sourceLocation: t.source_location || null,
      processNo: t.process_no || null,
      processMethod: t.process_method || null,
      processDate: toDateString(t.process_date),
    })),
    documents: (data.documents || []).map((d) => ({
      title: d.title,
      documentType: d.document_type,
      filePath: d.file_path || null,
      summary: d.summary || null,
    })),
  };

  return JSON.stringify(dpp, null, 2);
}

module.exports = { exportJson };
