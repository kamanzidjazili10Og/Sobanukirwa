try {
  require('./routes/artists');
  require('./routes/tracks');
  require('./routes/videos');
  require('./routes/books');
  require('./routes/categories');
  require('./routes/quran');
  require('./routes/settings');
  require('./routes/stats');
  require('./routes/adhkar');
  require('./config/db');
  require('./config/initDb');
  console.log('All modules loaded OK');
} catch(e) {
  console.error('LOAD ERROR:', e.message);
  process.exit(1);
}
