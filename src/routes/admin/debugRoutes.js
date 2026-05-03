const express = require('express');
const fs = require('fs');
const { getUploadDir } = require('../../config/uploadDir');
const router = express.Router();

router.get('/uploads', (req, res) => {
  const dir = getUploadDir();
  let exists = false;
  let files = [];
  let stat = null;
  try {
    exists = fs.existsSync(dir);
    if (exists) {
      stat = fs.statSync(dir);
      files = fs.readdirSync(dir);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message, dir });
  }
  return res.json({
    dir,
    exists,
    isDirectory: stat ? stat.isDirectory() : false,
    uid: stat ? stat.uid : null,
    gid: stat ? stat.gid : null,
    mode: stat ? stat.mode.toString(8) : null,
    filesCount: files.length,
    files: files.slice(0, 100), // Show up to 100 files
    env_UPLOAD_DIR: process.env.UPLOAD_DIR,
    cwd: process.cwd(),
    __dirname: __dirname,
  });
});

module.exports = router;
