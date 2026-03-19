// Placeholder authentication middleware.
// First iteration: admin pages are accessible without auth.
function requireAdmin(req, res, next) {
  next();
}

module.exports = { requireAdmin };

