const express = require('express');

const router = express.Router();
const { getPool } = require('../../config/db');

router.get('/', (req, res) => {
  // Keep it simple: do not block UI if DB is not configured yet.
  (async () => {
    try {
      const pool = await getPool();
      const tables = [
        ['recyclers', 'recyclers'],
        ['recycled_batches', 'recycledBatches'],
        ['material_batches', 'materialBatches'],
        ['products', 'products'],
        ['product_batches', 'productBatches'],
        ['product_passports', 'productPassports'],
      ];
      const counts = {};
      for (const [table, key] of tables) {
        // eslint-disable-next-line no-await-in-loop
        const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM ${table}`);
        counts[key] = rows[0].c;
      }

      return res.render('admin/layout', {
        view: 'dashboard',
        title: '後台首頁',
        resourceSlug: null,
        counts,
      });
    } catch (e) {
      return res.render('admin/layout', {
        view: 'dashboard',
        title: '後台首頁',
        resourceSlug: null,
        counts: {},
      });
    }
  })();
});

const routes = [
  ['recyclers', './recyclersRoutes'],
  ['recycled-items', './recycledItemsRoutes'],
  ['recycled-batches', './recycledBatchesRoutes'],
  ['processing-records', './processingRecordsRoutes'],
  ['materials', './materialsRoutes'],
  ['material-batches', './materialBatchesRoutes'],
  ['products', './productsRoutes'],
  ['product-versions', './productVersionsRoutes'],
  ['product-bom', './productBomRoutes'],
  ['product-batches', './productBatchesRoutes'],
  ['product-batch-material-batches', './productBatchMaterialBatchesRoutes'],
  ['documents', './documentsRoutes'],
  ['product-passports', './productPassportsRoutes'],
  ['passport-views', './passportViewsRoutes'],
  ['dpp-exports', './dppExportsRoutes'],
  ['home-hero', './homeHeroRoutes'],
  ['home-flow-steps', './homeFlowStepRoutes'],
  ['about-hero', './aboutHeroRoutes'],
  ['product-hero', './productHeroRoutes'],
  ['passport-hero', './passportHeroRoutes'],
];

for (const [basePath, file] of routes) {
  try {
    // eslint-disable-next-line global-require
    const routeModule = require(file);
    router.use(`/${basePath}`, routeModule);
  } catch (e) {
    // Skip missing modules during early scaffolding.
  }
}

module.exports = router;

