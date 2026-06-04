const roles = require('../constants/roles');
const userService = require('../services/userService');
const { clearAuthCookie, setAuthCookie } = require('../utils/authSession');

const roleLabels = {
  [roles.admin]: 'admin',
  [roles.shop]: 'shop',
  [roles.sale]: 'sale',
  [roles.user]: 'user',
};

function safeNextUrl(value) {
  const s = String(value || '').trim();
  if (!s || !s.startsWith('/') || s.startsWith('//')) return '';
  return s;
}

function defaultRedirectFor(user) {
  return user && user.role === roles.admin ? '/admin' : '/account';
}

function normalizeRegistrationBody(body) {
  return {
    account: String(body.account || '').trim(),
    password: String(body.password || ''),
    passwordConfirm: String(body.password_confirm || ''),
    displayName: String(body.display_name || '').trim(),
    email: String(body.email || '').trim(),
    phone: String(body.phone || '').trim(),
  };
}

function validateRegistrationPayload(payload) {
  if (!payload.account) return '請輸入帳號';
  if (payload.account.length > 80) return '帳號長度不可超過 80 個字';
  if (!payload.password || payload.password.length < 6) return '密碼至少需要 6 個字';
  if (payload.password !== payload.passwordConfirm) return '兩次輸入的密碼不一致';
  return '';
}

function isDuplicateAccountError(err) {
  return err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062);
}

function renderLogin(req, res, overrides = {}) {
  return res.render('public/login', {
    title: '登入',
    error: '',
    account: '',
    next: safeNextUrl(req.query.next),
    ...overrides,
  });
}

function getLogin(req, res) {
  if (req.currentUser) return res.redirect(defaultRedirectFor(req.currentUser));
  return renderLogin(req, res);
}

async function postLogin(req, res, next) {
  const account = String(req.body.account || '').trim();
  const password = String(req.body.password || '');
  const nextUrl = safeNextUrl(req.body.next);

  try {
    const user = await userService.authenticate({ account, password });
    if (!user) {
      return renderLogin(req, res.status(401), {
        error: '帳號或密碼錯誤，或此帳號已停用',
        account,
        next: nextUrl,
      });
    }

    setAuthCookie(res, user);
    if (nextUrl && (!nextUrl.startsWith('/admin') || user.role === roles.admin)) {
      return res.redirect(nextUrl);
    }
    return res.redirect(defaultRedirectFor(user));
  } catch (err) {
    return next(err);
  }
}

function renderStaffRegister(req, res, overrides = {}) {
  return res.render('public/register-staff', {
    title: 'shop / sale 註冊',
    error: '',
    values: {
      account: '',
      display_name: '',
      email: '',
      phone: '',
      role: roles.shop,
    },
    roleLabels,
    staffRoles: userService.STAFF_REGISTRATION_ROLES,
    ...overrides,
  });
}

function getStaffRegister(req, res) {
  return renderStaffRegister(req, res);
}

async function postStaffRegister(req, res, next) {
  const payload = normalizeRegistrationBody(req.body);
  const role = userService.STAFF_REGISTRATION_ROLES.includes(req.body.role)
    ? req.body.role
    : roles.shop;
  const error = validateRegistrationPayload(payload);
  const values = { ...payload, role, password: undefined, passwordConfirm: undefined };

  if (error) {
    return renderStaffRegister(req, res.status(400), { error, values });
  }

  try {
    const user = await userService.createUser({
      ...payload,
      role,
    });
    setAuthCookie(res, user);
    return res.redirect('/account');
  } catch (err) {
    if (isDuplicateAccountError(err)) {
      return renderStaffRegister(req, res.status(409), {
        error: '此帳號已被註冊',
        values,
      });
    }
    return next(err);
  }
}

function renderUserRegister(req, res, overrides = {}) {
  return res.render('public/register-user', {
    title: 'user 註冊',
    error: '',
    values: {
      account: '',
      display_name: '',
      email: '',
      phone: '',
    },
    ...overrides,
  });
}

function getUserRegister(req, res) {
  return renderUserRegister(req, res);
}

async function postUserRegister(req, res, next) {
  const payload = normalizeRegistrationBody(req.body);
  const error = validateRegistrationPayload(payload);
  const values = { ...payload, password: undefined, passwordConfirm: undefined };

  if (error) {
    return renderUserRegister(req, res.status(400), { error, values });
  }

  try {
    const user = await userService.createUser({
      ...payload,
      role: roles.user,
    });
    setAuthCookie(res, user);
    return res.redirect('/account');
  } catch (err) {
    if (isDuplicateAccountError(err)) {
      return renderUserRegister(req, res.status(409), {
        error: '此帳號已被註冊',
        values,
      });
    }
    return next(err);
  }
}

function getAccount(req, res) {
  return res.render('public/account', {
    title: '帳號',
    roleLabels,
    user: req.currentUser,
  });
}

function postLogout(req, res) {
  clearAuthCookie(res);
  return res.redirect('/login');
}

module.exports = {
  getAccount,
  getLogin,
  getStaffRegister,
  getUserRegister,
  postLogin,
  postLogout,
  postStaffRegister,
  postUserRegister,
};
