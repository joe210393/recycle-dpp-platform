const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { getUploadDir } = require('../config/uploadDir');

const uploadDir = getUploadDir();
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch {
  // 若無寫入權限，後續 multer 會丟錯，啟動時仍盡力建立目錄
}

const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function filename(req, file, cb) {
    const safeName = String(file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

module.exports = { upload };

