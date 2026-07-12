const express = require('express');
const cors = require('cors');
const path = require('path');
const initDb = require('./config/initDb');
require('dotenv').config();

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

initDb().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Sobanukirwa API server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Kill the existing process or use a different port.`);
      console.error(`Run: npx kill-port ${PORT}  (or manually find and kill the process)`);
      process.exit(1);
    } else {
      console.error('Server error:', err.message);
      process.exit(1);
    }
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});
