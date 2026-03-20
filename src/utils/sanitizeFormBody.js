/**
 * 與後台表單送出一致：空字串→NULL、重複欄位→最後一個、datetime-local→MySQL DATETIME 字串
 */
function sanitizeFormBody(data) {
  const out = {};
  for (const [k, v] of Object.entries(data || {})) {
    let val = v;
    if (Array.isArray(val)) {
      val = val.length ? val[val.length - 1] : '';
    }
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) {
      const [datePart, timePart] = val.split('T');
      const tp = timePart.length === 5 ? `${timePart}:00` : timePart;
      val = `${datePart} ${tp}`.slice(0, 19);
    }
    if (val === '') {
      out[k] = null;
    } else {
      out[k] = val;
    }
  }
  return out;
}

module.exports = { sanitizeFormBody };
