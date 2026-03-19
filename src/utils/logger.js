function info(...args) {
  // eslint-disable-next-line no-console
  console.log('[INFO]', ...args);
}

function warn(...args) {
  // eslint-disable-next-line no-console
  console.warn('[WARN]', ...args);
}

function error(...args) {
  // eslint-disable-next-line no-console
  console.error('[ERROR]', ...args);
}

module.exports = { info, warn, error };

