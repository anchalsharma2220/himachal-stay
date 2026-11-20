const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { ApiError } = require('../utils/helpers');

const dir = path.join(__dirname, '../../uploads');
fs.mkdirSync(dir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) =>
    /^image\/(jpeg|png|webp)$/.test(file.mimetype) ? cb(null, true) : cb(new ApiError(400, 'Only JPG, PNG or WEBP images are allowed')),
});

module.exports = upload;
module.exports.uploadDir = dir;
