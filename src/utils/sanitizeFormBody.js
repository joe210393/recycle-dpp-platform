/**
 * 與後台表單送出一致：空字串→NULL、重複欄位→最後一個、datetime-local→MySQL DATETIME 字串
 */
function sanitizeFormBody(data) {
  const normalizeDateTimeLocal = (s) => {
    if (typeof s !== 'string') return s;
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)) return s;
    const [datePart, timePart] = s.split('T');
    const tp = timePart.length === 5 ? `${timePart}:00` : timePart;
    return `${datePart} ${tp}`.slice(0, 19);
  };

  const sanitizeValue = (val) => {
    // arrays:
    // - checkbox / select repeated values => ['0','1'] => keep last
    // - material_lines might be nested objects => keep structure
    if (Array.isArray(val)) {
      if (val.length === 0) return '';
      const allPrimitive = val.every(
        (x) => x == null || typeof x !== 'object' || x instanceof Date
      );
      if (allPrimitive) {
        return sanitizeValue(val[val.length - 1]);
      }
      return val.map((x) => sanitizeValue(x));
    }

    if (val && typeof val === 'object' && !(val instanceof Date)) {
      const out = {};
      for (const [k, v] of Object.entries(val)) out[k] = sanitizeValue(v);
      return out;
    }

    if (typeof val === 'string') {
      const s = normalizeDateTimeLocal(val);
      return s === '' ? null : s;
    }

    return val;
  };

  const out = {};
  for (const [k, v] of Object.entries(data || {})) {
    out[k] = sanitizeValue(v);
  }
  return out;
}

module.exports = { sanitizeFormBody };
