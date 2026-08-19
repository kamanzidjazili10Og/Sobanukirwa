const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function initDb() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || null;
  const dbHost = process.env.DB_HOST;

  if (!connectionString && !dbHost) {
    console.warn('DATABASE_URL/DB_HOST not configured. Skipping database initialization.');
    return;
  }

  let connectionConfig;
  if (connectionString) {
    connectionConfig = { connectionString, ssl: { rejectUnauthorized: false } };
  } else {
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPass = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'sobanukirwa';
    const dbPort = process.env.DB_PORT || 5432;
    connectionConfig = {
      host: dbHost,
      port: parseInt(dbPort),
      user: dbUser,
      password: dbPass,
      database: dbName,
      ssl: dbHost !== 'localhost' && dbHost !== '127.0.0.1' ? { rejectUnauthorized: false } : false,
    };
  }

  const connection = new Pool(connectionConfig);

  try {
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'sobanukirwa_schema.sql');
    const fallbackPath = path.join(__dirname, '..', '..', 'database', 'sobanukirwa_pg.sql');

    let schemaFile = schemaPath;
    if (!fs.existsSync(schemaPath) && fs.existsSync(fallbackPath)) {
      schemaFile = fallbackPath;
    }

    try {
      const schema = fs.readFileSync(schemaFile, 'utf8');
      await connection.query(schema);
      console.log('Database schema initialized successfully');
    } catch (err) {
      console.error('Schema file error:', err.message);
      console.error('Falling back to manual table creation...');

      const tables = [
        `CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          name_ar VARCHAR(100) DEFAULT NULL,
          name_en VARCHAR(100) DEFAULT NULL,
          slug VARCHAR(100) NOT NULL UNIQUE,
          description TEXT DEFAULT NULL,
          icon VARCHAR(50) DEFAULT NULL,
          sort_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS artists (
          id SERIAL PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          name_ar VARCHAR(200) DEFAULT NULL,
          name_en VARCHAR(200) DEFAULT NULL,
          bio TEXT DEFAULT NULL,
          image_url VARCHAR(500) DEFAULT NULL,
          total_lessons INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS tracks (
          id SERIAL PRIMARY KEY,
          artist_id INT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
          category_id INT DEFAULT NULL REFERENCES categories(id) ON DELETE SET NULL,
          title VARCHAR(300) NOT NULL,
          title_ar VARCHAR(300) DEFAULT NULL,
          title_en VARCHAR(300) DEFAULT NULL,
          audio_url VARCHAR(500) NOT NULL,
          description TEXT DEFAULT NULL,
          duration INT DEFAULT 0,
          duration_str VARCHAR(10) DEFAULT '00:00',
          file_size BIGINT DEFAULT 0,
          plays_count INT DEFAULT 0,
          downloads_count INT DEFAULT 0,
          is_featured BOOLEAN DEFAULT FALSE,
          sort_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS videos (
          id SERIAL PRIMARY KEY,
          title VARCHAR(300) NOT NULL,
          title_ar VARCHAR(300) DEFAULT NULL,
          title_en VARCHAR(300) DEFAULT NULL,
          author VARCHAR(200) DEFAULT NULL,
          author_ar VARCHAR(200) DEFAULT NULL,
          author_en VARCHAR(200) DEFAULT NULL,
          description TEXT DEFAULT NULL,
          thumbnail_url VARCHAR(500) DEFAULT NULL,
          video_url VARCHAR(500) NOT NULL,
          duration INT DEFAULT 0,
          duration_str VARCHAR(10) DEFAULT NULL,
          file_size BIGINT DEFAULT 0,
          views_count INT DEFAULT 0,
          is_featured BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS books (
          id SERIAL PRIMARY KEY,
          title VARCHAR(300) NOT NULL,
          title_ar VARCHAR(300) DEFAULT NULL,
          title_en VARCHAR(300) DEFAULT NULL,
          author VARCHAR(200) DEFAULT NULL,
          author_ar VARCHAR(200) DEFAULT NULL,
          author_en VARCHAR(200) DEFAULT NULL,
          description TEXT DEFAULT NULL,
          image_url VARCHAR(500) DEFAULT NULL,
          file_url VARCHAR(500) NOT NULL,
          file_type VARCHAR(10) DEFAULT 'pdf',
          category VARCHAR(100) DEFAULT NULL,
          pages_count INT DEFAULT 0,
          downloads_count INT DEFAULT 0,
          is_featured BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS quran_surahs (
          id SERIAL PRIMARY KEY,
          surah_number INT NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          name_arabic VARCHAR(100) NOT NULL,
          ayahs_count INT DEFAULT 0,
          revelation_type VARCHAR(20) DEFAULT 'Makkah',
          audio_url VARCHAR(500) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS play_history (
          id SERIAL PRIMARY KEY,
          user_id INT DEFAULT NULL,
          track_id INT DEFAULT NULL REFERENCES tracks(id) ON DELETE SET NULL,
          video_id INT DEFAULT NULL REFERENCES videos(id) ON DELETE SET NULL,
          played_at TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value TEXT DEFAULT NULL,
          updated_at TIMESTAMP DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS adhkar (
          id SERIAL PRIMARY KEY,
          arabic_text VARCHAR(500) NOT NULL,
          transliteration VARCHAR(300) DEFAULT NULL,
          translation_rw VARCHAR(500) DEFAULT NULL,
          translation_en VARCHAR(500) DEFAULT NULL,
          translation_ar VARCHAR(500) DEFAULT NULL,
          count_target INT DEFAULT 33,
          category VARCHAR(100) DEFAULT 'general',
          audio_url VARCHAR(500) DEFAULT NULL,
          reference VARCHAR(300) DEFAULT NULL,
          sort_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW()
        )`
      ];

      for (const sql of tables) {
        await connection.query(sql);
      }
      console.log('Manual table creation completed');
    }

    await connection.end();
  } catch (err) {
    console.error('Init error:', err.message);
    await connection.end();
  }
}

module.exports = initDb;
