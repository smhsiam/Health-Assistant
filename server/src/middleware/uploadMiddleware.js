const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const maxMb = Number(process.env.MAX_FILE_SIZE_MB) || 5;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${crypto.randomBytes(16).toString('hex')}.pdf`),
});

const fileFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === 'application/pdf' &&
    path.extname(file.originalname).toLowerCase() === '.pdf';

  if (!isPdf) {
    const error = new Error('Only PDF reports are supported right now');
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
        message: 'Upload failed. Send one PDF file in the field named file',
      });
    }

    res
      .status(error.status || 500)
      .json({ message: error.status ? error.message : 'Upload failed' });
  });
};

module.exports = { uploadSingle };