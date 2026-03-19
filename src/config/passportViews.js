const consumerConfig = {
  version: 1,
  show: {
    product: {
      name: true,
      mainImage: true,
      category: true,
      shortDescription: true,
      usageInstruction: true,
      caution: true,
      specification: true,
      productVersion: true,
      productBatchNo: true,
    },
    materials: {
      materialList: true,
      materialPublicDescription: true,
      materialBatchNo: true,
      materialRole: true,
    },
    recyclersAndTrace: {
      recyclerName: true,
      recyclerCertificateNo: true,
      recycledBatchTraceCode: true,
      traceUrl: true,
      sourceLocation: true,
      processingProcessNo: true,
    },
    testingAndReports: {
      testReportSummary: true,
    },
    documents: {
      showDocumentsList: true,
      allowDownloads: true,
    },
    sustainability: {
      showStoryBlocks: true,
    },
    internal: {
      cost: false,
      recipeRatio: false,
      supplierInternalContacts: false,
      internalNotes: false,
    },
    qrCode: true,
  },
};

const b2bConfig = {
  version: 1,
  show: {
    product: {
      name: true,
      mainImage: true,
      category: true,
      shortDescription: true,
      usageInstruction: true,
      caution: true,
      specification: true,
      productVersion: true,
      productBatchNo: true,
    },
    materials: {
      materialList: true,
      materialPublicDescription: true,
      materialBatchNo: true,
      materialRole: true,
    },
    recyclersAndTrace: {
      recyclerName: true,
      recyclerCertificateNo: true,
      recycledBatchTraceCode: true,
      traceUrl: true,
      sourceLocation: true,
      processingProcessNo: true,
    },
    testingAndReports: {
      testReportSummary: true,
    },
    documents: {
      showDocumentsList: true,
      allowDownloads: true,
    },
    sustainability: {
      showStoryBlocks: true,
    },
    internal: {
      cost: false,
      recipeRatio: false,
      supplierInternalContacts: false,
      internalNotes: false,
    },
    qrCode: true,
  },
};

const auditConfig = {
  version: 1,
  show: {
    product: {
      name: true,
      mainImage: true,
      category: true,
      shortDescription: true,
      usageInstruction: true,
      caution: true,
      specification: true,
      productVersion: true,
      productBatchNo: true,
    },
    materials: {
      materialList: true,
      materialPublicDescription: true,
      materialBatchNo: true,
      materialRole: true,
    },
    recyclersAndTrace: {
      recyclerName: true,
      recyclerCertificateNo: true,
      recycledBatchTraceCode: true,
      traceUrl: true,
      sourceLocation: true,
      processingProcessNo: true,
    },
    testingAndReports: {
      testReportSummary: true,
    },
    documents: {
      showDocumentsList: true,
      allowDownloads: true,
    },
    sustainability: {
      showStoryBlocks: true,
    },
    internal: {
      cost: false,
      recipeRatio: false,
      supplierInternalContacts: false,
      internalNotes: false,
    },
    qrCode: true,
  },
};

function getDefaultConfig(viewType) {
  if (viewType === 'consumer') return consumerConfig;
  if (viewType === 'b2b') return b2bConfig;
  if (viewType === 'audit') return auditConfig;
  return consumerConfig;
}

module.exports = {
  consumerConfig,
  b2bConfig,
  auditConfig,
  getDefaultConfig,
};

