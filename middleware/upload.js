const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

function makeStorage(dest) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', dest)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, uuidv4() + ext);
    },
  });
}

function fileFilter(req, file, cb) {
  if (config.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP allowed.'));
  }
}

const productUpload = multer({
  storage: makeStorage('products'),
  fileFilter,
  limits: { fileSize: config.MAX_IMAGE_SIZE_MB * 1024 * 1024 },
}).array('images', config.MAX_PRODUCT_IMAGES);

const profileUpload = multer({
  storage: makeStorage('profiles'),
  fileFilter,
  limits: { fileSize: config.MAX_IMAGE_SIZE_MB * 1024 * 1024 },
}).single('banner');

module.exports = { productUpload, profileUpload };
