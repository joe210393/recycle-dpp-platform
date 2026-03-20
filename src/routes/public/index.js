const express = require('express');

const router = express.Router();

const traceabilityService = require('../../services/traceabilityService');
const { homeHeroService } = require('../../services/homeHeroService');
const { homeFlowStepService } = require('../../services/homeFlowStepService');
const { aboutHeroService } = require('../../services/aboutHeroService');
const { productHeroService } = require('../../services/productHeroService');
const { passportHeroService } = require('../../services/passportHeroService');

const defaultHero = {
  eyebrow: '銀髮友善 × 環境友善',
  title: '給歲月溫柔一點，<br>也給地球更輕一點。',
  description:
    'SENWEI 專為熟齡與銀髮肌膚打造溫和護膚體驗，從觸感、使用方式到成分故事，都以舒適、安心與可追溯為核心，讓每日保養回到簡單、自在與被照顧的感受。',
  primary_button_text: '查看商品系列',
  primary_button_url: '/product',
  secondary_button_text: '查詢商品護照',
  secondary_button_url: '/passport',
  hero_image_path: '/assets/hero-illustration.svg',
  info1_title: '低刺激設計',
  info1_body: '細緻膚感與易開易握包裝，適合熟齡日常護理。',
  info2_title: '透明可追溯',
  info2_body: '提供商品護照查詢，公開來源與檢測摘要。',
  info3_title: '永續思維',
  info3_body: '以環境友善的原料觀念，傳遞循環保養的價值。',
};

const defaultFlowSteps = [
  { title: '接近偵測', description: '偵測裝置接近並啟動流程。', icon_path: '', sort_order: 1 },
  { title: '同步傳輸', description: '將資料同步傳送到系統。', icon_path: '', sort_order: 2 },
  { title: '儲能導入', description: '寫入並整合至追溯資料。', icon_path: '', sort_order: 3 },
  { title: '觸發更新', description: '觸發狀態與內容更新。', icon_path: '', sort_order: 4 },
  { title: '畫面完成', description: '完成前台可視化呈現。', icon_path: '', sort_order: 5 },
];

const defaultAboutHero = {
  eyebrow: 'About SENWEI',
  title: '讓保養回到<br>被理解與被照顧。',
  description:
    'SENWEI 將熟齡肌膚照護、使用便利與環境友善視為同等重要。我們希望每一位使用者在打開產品時，不只是開始保養，也感受到品牌對年齡、生活與土地的尊重。',
  hero_image_path: '/assets/about-illustration.svg',
};

const defaultProductHero = {
  eyebrow: 'The Signature Series',
  title: '一支產品，<br>一整套熟齡肌膚照護思維。',
  description:
    '目前 SENWEI 專注於單一產品系列，以更完整的質感、故事與照護方式，讓熟齡保養在簡單之中保有深度。',
  hero_image_path: '',
};

const defaultPassportHero = {
  eyebrow: 'Product Passport',
  title: '查詢商品護照，<br>讓產品資訊更透明。',
  description:
    '輸入商品批次號，即可查看對應的商品護照資訊。這個頁面可延伸串接 DPP 架構、批次追溯、檢測摘要與永續資訊展示。',
  hero_image_path: '/assets/passport-illustration.svg',
};

router.get('/', async (req, res, next) => {
  try {
    // Important: on a fresh Zeabur DB, migrations might not have run yet.
    // If tables don't exist, fall back to defaults to avoid 500.
    let heroes = [];
    let flowSteps = [];
    let productHeroes = [];
    try {
      heroes = await homeHeroService.listAll();
    } catch (err) {
      if (err && err.code !== 'ER_NO_SUCH_TABLE') throw err;
    }
    try {
      flowSteps = await homeFlowStepService.listAll();
    } catch (err) {
      if (err && err.code !== 'ER_NO_SUCH_TABLE') throw err;
    }

    try {
      productHeroes = await productHeroService.listAll();
    } catch (err) {
      if (err && err.code !== 'ER_NO_SUCH_TABLE') throw err;
    }

    const hero = heroes && heroes[0] ? heroes[0] : defaultHero;
    const productHero = productHeroes && productHeroes[0] ? productHeroes[0] : defaultProductHero;
    const flow = (flowSteps && flowSteps.length > 0
      ? [...flowSteps].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      : defaultFlowSteps);

    res.render('public/home', { hero, flow, productHero });
  } catch (err) {
    return next(err);
  }
});

router.get('/about', async (req, res, next) => {
  try {
    let heroes = [];
    try {
      heroes = await aboutHeroService.listAll();
    } catch (err) {
      if (err && err.code !== 'ER_NO_SUCH_TABLE') throw err;
    }
    const hero = heroes && heroes[0] ? heroes[0] : defaultAboutHero;
    return res.render('public/about', { hero });
  } catch (err) {
    return next(err);
  }
});

router.get('/product', async (req, res, next) => {
  try {
    let heroes = [];
    try {
      heroes = await productHeroService.listAll();
    } catch (err) {
      if (err && err.code !== 'ER_NO_SUCH_TABLE') throw err;
    }
    const hero = heroes && heroes[0] ? heroes[0] : defaultProductHero;
    return res.render('public/product', { hero });
  } catch (err) {
    return next(err);
  }
});

router.get('/passport', async (req, res, next) => {
  try {
    let heroes = [];
    try {
      heroes = await passportHeroService.listAll();
    } catch (err) {
      if (err && err.code !== 'ER_NO_SUCH_TABLE') throw err;
    }
    const hero = heroes && heroes[0] ? heroes[0] : defaultPassportHero;

    const batchNo = req.query.batchNo || '';
    const results = batchNo ? await traceabilityService.lookupByBatchNo({ batchNo }) : [];

    return res.render('public/passport', { hero, batchNo, results });
  } catch (err) {
    return next(err);
  }
});

router.get('/products', async (req, res, next) => {
  try {
    const products = await traceabilityService.listPublicProducts({ limit: 100 });
    return res.render('public/products', { products });
  } catch (err) {
    return next(err);
  }
});

router.get('/products/:slug', async (req, res, next) => {
  try {
    const detail = await traceabilityService.getProductDetailBySlug(req.params.slug);
    if (!detail) return res.status(404).render('public/404', { path: req.path });
    return res.render('public/product-detail', { detail });
  } catch (err) {
    return next(err);
  }
});

router.get('/passports/:passportCode', async (req, res, next) => {
  try {
    const viewType = req.query.view || 'consumer';
    const data = await traceabilityService.getPassportDetailByCode(req.params.passportCode, viewType);
    if (!data) return res.status(404).render('public/404', { path: req.path });
    return res.render('public/passport-detail', { data });
  } catch (err) {
    return next(err);
  }
});

router.get('/lookup/batch', async (req, res, next) => {
  try {
    const batchNo = req.query.batch_no;
    const viewType = req.query.view || 'consumer';
    const results = batchNo ? await traceabilityService.lookupByBatchNo({ batchNo }) : [];
    return res.render('public/batch-lookup', { batchNo: batchNo || '', results, viewType });
  } catch (err) {
    return next(err);
  }
});

router.post('/lookup/batch', async (req, res, next) => {
  try {
    const batchNo = req.body.batch_no || '';
    const view = req.body.view || 'consumer';
    // Redirect keeps the UI simple (GET renders results)
    return res.redirect(`/lookup/batch?batch_no=${encodeURIComponent(batchNo)}&view=${encodeURIComponent(view)}`);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

