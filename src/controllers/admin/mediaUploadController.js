function create(req, res) {
  const url = req.mediaUploadUrl;
  if (!url) {
    return res.status(500).json({ error: '上傳處理異常' });
  }
  return res.status(201).json({ url });
}

module.exports = { create };
