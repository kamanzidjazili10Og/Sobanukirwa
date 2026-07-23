const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'other';
    if (file.mimetype.startsWith('audio/')) subDir = 'audio';
    else if (file.mimetype.startsWith('video/')) subDir = 'videos';
    else if (file.mimetype === 'application/pdf' || file.mimetype.includes('document')) subDir = 'documents';
    else if (file.mimetype.startsWith('image/')) subDir = 'images';

    const dir = path.join(uploadDir, subDir);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

function fileFilter(req, file, cb) {
  const allowedAudio = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
    'audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/aac',
    'audio/ogg', 'audio/flac', 'audio/x-flac',
    'audio/webm', 'audio/x-matroska', 'audio/x-ms-wma',
    'audio/amr', 'audio/x-amr'
  ];
  const allowedVideo = ['video/mp4', 'video/mpeg', 'video/webm', 'video/ogg', 'video/x-matroska'];
  const allowedDoc = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedImage = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];

  const allAllowed = [...allowedAudio, ...allowedVideo, ...allowedDoc, ...allowedImage];

  if (allAllowed.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed: ' + file.mimetype), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024, fieldSize: 50 * 1024 * 1024 }
});

module.exports = upload;
