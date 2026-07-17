const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const initDb = require('./config/initDb');

const app = express();
const PORT = process.env.PORT || 5000;
const ROOT_DIR = path.join(__dirname, '..');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');

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

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Kamanzi@123';

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: 'admin-session-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'admin', 'index.html'));
});
app.get('/admin/', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'admin', 'index.html'));
});
app.get('/admin/index.html', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'admin', 'index.html'));
});

app.use('/api/artists', require('./routes/artists'));
app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/books', require('./routes/books'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/quran', require('./routes/quran'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/adhkar', require('./routes/adhkar'));
app.use('/api/settings', require('./routes/settings'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/admin', express.static(path.join(ROOT_DIR, 'admin')));
app.use('/', express.static(ROOT_DIR));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sobanukirwa API server running on port ${PORT}`);
  console.log(`Upload directory: ${UPLOAD_DIR}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    console.error('Server error:', err.message);
    process.exit(1);
  }
});

const DB_TIMEOUT = 15000;
const dbTimeout = setTimeout(() => {
  console.warn('Database initialization timed out after 15s, continuing without DB...');
}, DB_TIMEOUT);

initDb()
  .then(() => {
    clearTimeout(dbTimeout);
    console.log('Database initialized successfully');
  })
  .catch((err) => {
    clearTimeout(dbTimeout);
    console.error('Database init failed (server still running):', err.message);
  });
