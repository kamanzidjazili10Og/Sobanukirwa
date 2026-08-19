const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const initDb = require('./config/initDb');

const app = express();
const PORT = process.env.PORT || 5000;
const ROOT_DIR = path.join(__dirname, '..');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

['audio', 'videos', 'documents', 'images', 'other'].forEach(sub => {
  fs.mkdirSync(path.join(UPLOAD_DIR, sub), { recursive: true });
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

app.use('/uploads', express.static(UPLOAD_DIR));

const AUDIO_DIR = path.join(ROOT_DIR, 'audio');
if (fs.existsSync(AUDIO_DIR)) {
  app.use('/audio', express.static(AUDIO_DIR));
}
const SOUNDS_DIR = path.join(ROOT_DIR, 'Sounds');
if (fs.existsSync(SOUNDS_DIR)) {
  app.use('/Sounds', express.static(SOUNDS_DIR));
}
const IMAGES_DIR = path.join(ROOT_DIR, 'Images');
if (fs.existsSync(IMAGES_DIR)) {
  app.use('/Images', express.static(IMAGES_DIR));
}
const DOCUMENT_DIR = path.join(ROOT_DIR, 'Document');
if (fs.existsSync(DOCUMENT_DIR)) {
  app.use('/Document', express.static(DOCUMENT_DIR));
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Sobanukirwa@123';

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: 'admin-session-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

const adminPath = path.join(ROOT_DIR, 'admin');

app.get('/admin', (req, res) => {
  res.sendFile(path.join(adminPath, 'index.html'));
});
app.get('/admin/', (req, res) => {
  res.sendFile(path.join(adminPath, 'index.html'));
});
app.get('/admin/index.html', (req, res) => {
  res.sendFile(path.join(adminPath, 'index.html'));
});
app.use('/admin', express.static(adminPath));

app.use('/api/artists', require('./routes/artists'));
app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/books', require('./routes/books'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/quran', require('./routes/quran'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/adhkar', require('./routes/adhkar'));
app.use('/api/settings', require('./routes/settings'));

let contentVersion = Date.now();

function bumpContentVersion() { contentVersion = Date.now(); }

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/version', (req, res) => {
  res.json({ version: contentVersion, timestamp: new Date(contentVersion).toISOString() });
});

app.set('bumpVersion', bumpContentVersion);

app.get('/', (req, res) => {
  res.redirect('/admin');
});

app.use('/', express.static(ROOT_DIR));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message, err.stack);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

(async () => {
  try {
    await initDb();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database init failed:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sobanukirwa API server running on port ${PORT}`);
    console.log(`Upload directory: ${UPLOAD_DIR}`);
    console.log(`Root directory: ${ROOT_DIR}`);
    console.log(`Admin path: ${adminPath}`);
    console.log(`Uploads dir exists: ${fs.existsSync(UPLOAD_DIR)}`);
    console.log(`Admin dir exists: ${fs.existsSync(adminPath)}`);
  });
})();
