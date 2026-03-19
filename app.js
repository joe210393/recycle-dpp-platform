const path = require('path');
const express = require('express');
const methodOverride = require('method-override');

const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');
const { errorMiddleware } = require('./src/middlewares/errorMiddleware');

function createApp() {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'src', 'views'));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Allows HTML forms to submit PUT/PATCH/DELETE via hidden `_method` field.
  app.use(methodOverride('_method'));

  // Browser default request.
  app.get('/favicon.ico', (req, res) => {
    res.type('image/svg+xml');
    return res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
  });

  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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

