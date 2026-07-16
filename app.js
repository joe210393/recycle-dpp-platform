const path = require('path');
const express = require('express');
const methodOverride = require('method-override');

const { getUploadDir } = require('./src/config/uploadDir');
const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');
const { errorMiddleware } = require('./src/middlewares/errorMiddleware');
const { attachCurrentUser } = require('./src/middlewares/authMiddleware');

function createApp() {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'src', 'views'));
  app.disable('x-powered-by');

  // 沒設 NODE_ENV=production 時 Express 不會快取編譯後的模板，
  // 每個請求都重新讀檔＋編譯 EJS。在正式環境（Zeabur）強制開啟。
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.ZEABUR_SERVICE_ID || process.env.ZEABUR_PROJECT_ID);
  if (isProduction) {
    app.set('view cache', true);
  }

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // HTML forms use POST + hidden `_method` for PUT/DELETE. Passing the string
  // `'_method'` to method-override only checks the *query string*, not the body
  // (see method-override createQueryGetter). Use a body-aware getter instead.
  app.use(
    methodOverride((req) => {
      // 圖檔改由 POST /admin/api/media 上傳；一般表單為 urlencoded，hidden _method 或 query ?_method 皆可。
      const qm = req.query && req.query._method;
      const qmStr = Array.isArray(qm) ? qm[0] : qm;
      if (typeof qmStr === 'string' && qmStr) {
        return qmStr;
      }
      if (req.body && typeof req.body === 'object' && req.body._method) {
        const m = req.body._method;
        delete req.body._method;
        return m;
      }
      return undefined;
    })
  );

  // Browser default request.
  app.get('/favicon.ico', (req, res) => {
    res.type('image/svg+xml');
    return res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
  });

  // 靜態資源加上 Cache-Control：CSS/圖片重複瀏覽不必重抓（etag 仍會驗證更新）。
  app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));
  app.use('/uploads', express.static(getUploadDir(), { maxAge: '7d' }));
  app.use('/exports', express.static(path.join(__dirname, 'exports')));

  app.use(attachCurrentUser);
  app.use('/', publicRoutes);
  app.use('/admin', adminRoutes);

  // Simple 404.
  app.use((req, res) => {
    res.status(404).render('public/404', { path: req.path });
  });

  app.use(errorMiddleware);

  return app;
}

module.exports = createApp;
