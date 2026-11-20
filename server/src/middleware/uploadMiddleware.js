const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const maxMb = Number(process.env.MAX_FILE_SIZE_MB) || 8;

const allowedTypes = {
  '.pdf': ['application/pdf'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomBytes(16).toString('hex')}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const mimeList = allowedTypes[extension];

  if (!mimeList || !mimeList.includes(file.mimetype)) {
    const error = new Error('Only PDF, JPG or PNG reports are supported');
    error.status = 400;
    return cb(error);
  }

  cb(null, true);
};

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
}).single('file');

const uploadSingle = (req, res, next) => {
  uploader(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(413)
        .json({ message: `File is too large. Maximum size is ${maxMb} MB` });
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message: 'Upload failed. Send one file in the field named file',
      });
    }

    res
      .status(error.status || 500)
      .json({ message: error.status ? error.message : 'Upload failed' });
  });
};

module.exports = { uploadSingle };