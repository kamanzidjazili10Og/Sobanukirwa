const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const initDb = require('./config/initDb');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, '..')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

app.use('/api/artists', require('./routes/artists'));
app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/books', require('./routes/books'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/quran', require('./routes/quran'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/adhkar', require('./routes/adhkar'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sobanukirwa API server running on port ${PORT}`);
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
