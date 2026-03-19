/* eslint-disable no-unused-vars */
function errorMiddleware(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('[errorMiddleware]', err);

  const message = err && err.message ? err.message : 'Internal Server Error';
  res.status(500);

  // Admin pages use HTML rendering; for API we'd use JSON.
  if (req.accepts('html')) {
    return res.render('public/error', { message, path: req.path });
  }

  return res.json({ error: message });
}

module.exports = { errorMiddleware };

