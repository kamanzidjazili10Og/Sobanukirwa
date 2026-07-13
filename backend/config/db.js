const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbHost = process.env.DB_HOST;
const isConfigured = dbHost && dbHost.length > 0;

let pool = null;

if (isConfigured) {
  const isCloud = dbHost !== 'localhost' && dbHost !== '127.0.0.1';
  const config = {
    host: dbHost,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sobanukirwa',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    connectTimeout: 15000,
  };
  if (isCloud) {
    config.ssl = { rejectUnauthorized: false };
  }
  pool = mysql.createPool(config);
  console.log('MySQL pool created for ' + dbHost);
} else {
  console.warn('DB_HOST not configured. Running without database.');
}

const safePool = {
  query: async (sql, params) => {
    if (!pool) return [[]];
    try {
      return await pool.query(sql, params);
    } catch (err) {
      console.error('DB query error:', err.message);
      return [[]];
    }
  },
  execute: async (sql, params) => {
    if (!pool) return [[]];
    try {
      return await pool.execute(sql, params);
    } catch (err) {
      console.error('DB execute error:', err.message);
      return [[]];
    }
  },
  getConnection: async () => {
    if (!pool) throw new Error('Database not configured');
    return await pool.getConnection();
  },
  end: async () => {
    if (pool) await pool.end();
  }
};

module.exports = safePool;
