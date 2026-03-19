function apiResponse(success, message, data) {
  return { success, message: message || null, data: data ?? null };
}

module.exports = { apiResponse };

