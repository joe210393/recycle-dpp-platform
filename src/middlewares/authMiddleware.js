const roles = require('../constants/roles');
const { clearAuthCookie, readAuthPayload } = require('../utils/authSession');
const userService = require('../services/userService');

async function attachCurrentUser(req, res, next) {
  res.locals.currentUser = null;

  const payload = readAuthPayload(req);
  if (!payload || !payload.id) return next();

  try {
    const user = await userService.findActiveById(payload.id);
    if (!user || user.account !== payload.account || user.role !== payload.role) {
      clearAuthCookie(res);
      return next();
    }

    req.currentUser = user;
    res.locals.currentUser = user;
    return next();
  } catch (err) {
    if (err && err.code === 'ER_NO_SUCH_TABLE') return next();
    return next(err);
  }
}

function requireAuthenticated(req, res, next) {
  if (req.currentUser) return next();

  if (req.accepts('html')) {
    const nextUrl = encodeURIComponent(req.originalUrl || '/');
    return res.redirect(`/login?next=${nextUrl}`);
  }
  return res.status(401).json({ error: '請先登入' });
}

function requireRole(allowedRoles) {
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (!req.currentUser) return requireAuthenticated(req, res, next);
    if (allowed.includes(req.currentUser.role)) return next();

    const err = new Error('此帳號沒有使用此頁面的權限');
    err.status = 403;
    return next(err);
  };
}

module.exports = {
  attachCurrentUser,
  requireAdmin: requireRole(roles.admin),
  requireAuthenticated,
  requireRole,
};
