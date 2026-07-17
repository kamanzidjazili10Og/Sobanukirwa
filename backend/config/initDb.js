const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function initDb() {
  const dbHost = process.env.DB_HOST || process.env.MYSQLHOST;
  const dbUser = process.env.DB_USER || process.env.MYSQLUSER || 'root';
  const dbPass = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';
  const dbPort = process.env.DB_PORT || process.env.MYSQLPORT || 3306;
  const isConfigured = dbHost && dbHost.length > 0;

  if (!isConfigured) {
    console.warn('DB_HOST/MYSQLHOST not configured. Skipping database initialization.');
    return;
  }

  const isCloud = dbHost !== 'localhost' && dbHost !== '127.0.0.1';
  const config = {
    host: dbHost,
    port: parseInt(dbPort),
    user: dbUser,
    password: dbPass,
    multipleStatements: true,
    charset: 'utf8mb4',
    connectTimeout: 15000,
  };
  if (isCloud) {
    config.ssl = { rejectUnauthorized: false };
  }

  const connection = await mysql.createConnection(config);

  const db = process.env.DB_NAME || 'sobanukirwa';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE \`${db}\``);

  const schemaPath = path.join(__dirname, '..', '..', 'database', 'sobanukirwa_schema.sql');

  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schema);
    console.log('Database schema initialized successfully');
  } catch (err) {
    console.error('Schema file error:', err.message);
    console.error('Falling back to manual table creation...');

    const tables = [
      `CREATE TABLE IF NOT EXISTS adhkar (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    ];

    for (const sql of tables) {
      await connection.query(sql);
    }
    console.log('Manual table creation completed');
  }

  await connection.end();

  // Post-schema migrations: ensure columns that may be missing from older schema
  const pool = require('./db');
  try {
    const [vcols] = await pool.query("SHOW COLUMNS FROM videos LIKE 'duration_str'");
    if (vcols.length === 0) {
      await pool.query("ALTER TABLE videos ADD COLUMN duration_str VARCHAR(10) DEFAULT NULL");
      console.log('Added duration_str column to videos table');
    }
  } catch (e) { /* ignore */ }
  try {
    const [tcols] = await pool.query("SHOW COLUMNS FROM tracks LIKE 'duration_str'");
    if (tcols.length === 0) {
      await pool.query("ALTER TABLE tracks ADD COLUMN duration_str VARCHAR(10) DEFAULT '00:00'");
      console.log('Added duration_str column to tracks table');
    }
    const [tdesc] = await pool.query("SHOW COLUMNS FROM tracks LIKE 'description'");
    if (tdesc.length === 0) {
      await pool.query("ALTER TABLE tracks ADD COLUMN description TEXT DEFAULT NULL");
      console.log('Added description column to tracks table');
    }
  } catch (e) { /* ignore */ }
}

module.exports = initDb;
