const crypto = require('crypto');

const HASH_ALGORITHM = 'sha256';
const ITERATIONS = 310000;
const KEY_LENGTH = 32;

function toBase64Url(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, 'base64');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(String(password), salt, ITERATIONS, KEY_LENGTH, HASH_ALGORITHM);
  return `pbkdf2$${HASH_ALGORITHM}$${ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

function verifyPassword(password, storedHash) {
  const parts = String(storedHash || '').split('$');
  if (parts.length !== 5 || parts[0] !== 'pbkdf2') return false;

  const [, algorithm, iterationsRaw, saltRaw, hashRaw] = parts;
  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations <= 0) return false;

  const salt = fromBase64Url(saltRaw);
  const expected = fromBase64Url(hashRaw);
  const actual = crypto.pbkdf2Sync(String(password), salt, iterations, expected.length, algorithm);

  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

module.exports = { hashPassword, verifyPassword };
