const path = require('path');
const express = require('express');
const methodOverride = require('method-override');

const { getUploadDir } = require('./src/config/uploadDir');
const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');
const { errorMiddleware } = require('./src/middlewares/errorMiddleware');

function createApp() {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'src', 'views'));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // HTML forms use POST + hidden `_method` for PUT/DELETE. Passing the string
  // `'_method'` to method-override only checks the *query string*, not the body
  // (see method-override createQueryGetter). Use a body-aware getter instead.
  app.use(
    methodOverride((req) => {
      // multipart/form-data 在 multer 跑之前不會進 req.body，hidden _method 讀不到。
      // 含圖片上傳的編輯表單改在 action 加 ?_method=PUT（與刪除表單 ?_method=DELETE 一致）。
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

  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/uploads', express.static(getUploadDir()));
  app.use('/exports', express.static(path.join(__dirname, 'exports')));

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

