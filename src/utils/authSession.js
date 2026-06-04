const crypto = require('crypto');

const COOKIE_NAME = 'senwei_auth';
const configuredMaxAge = Number(process.env.AUTH_COOKIE_MAX_AGE_SECONDS);
const MAX_AGE_SECONDS = Number.isFinite(configuredMaxAge) && configuredMaxAge > 0
  ? configuredMaxAge
  : 60 * 60 * 8;

function getSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.COOKIE_SECRET ||
    'senwei-local-auth-secret-change-me'
  );
}

function toBase64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, 'base64').toString('utf8');
}

function sign(payload) {
  return toBase64Url(crypto.createHmac('sha256', getSecret()).update(payload).digest());
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge != null) parts.push(`Max-Age=${Number(options.maxAge)}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  parts.push(`Path=${options.path || '/'}`);
  return parts.join('; ');
}

function parseCookies(cookieHeader) {
  const cookies = {};
  String(cookieHeader || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const eq = part.indexOf('=');
      if (eq === -1) return;
      const key = part.slice(0, eq).trim();
      const value = part.slice(eq + 1);
      cookies[key] = decodeURIComponent(value);
    });
  return cookies;
}

function createAuthToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(
    JSON.stringify({
      id: user.id,
      account: user.account,
      role: user.role,
      iat: now,
      exp: now + MAX_AGE_SECONDS,
    })
  );
  return `${payload}.${sign(payload)}`;
}

function verifyAuthToken(token) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return null;

  try {
    const data = JSON.parse(fromBase64Url(payload));
    const now = Math.floor(Date.now() / 1000);
    if (!data.exp || Number(data.exp) < now) return null;
    return data;
  } catch {
    return null;
  }
}

function readAuthPayload(req) {
  const cookies = parseCookies(req.headers.cookie);
  return verifyAuthToken(cookies[COOKIE_NAME]);
}

function setAuthCookie(res, user) {
  const token = createAuthToken(user);
  res.setHeader(
    'Set-Cookie',
    serializeCookie(COOKIE_NAME, token, {
      maxAge: MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    })
  );
}

function clearAuthCookie(res) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(COOKIE_NAME, '', {
      maxAge: 0,
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    })
  );
}

module.exports = {
  clearAuthCookie,
  readAuthPayload,
  setAuthCookie,
};
