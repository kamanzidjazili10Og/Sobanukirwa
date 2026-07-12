const mysql = require('mysql2/promise');
require('dotenv').config();

const dbHost = process.env.DB_HOST;
const isConfigured = dbHost && dbHost !== 'localhost' && dbHost !== '127.0.0.1';

let pool = null;

if (isConfigured) {
  pool = mysql.createPool({
    host: dbHost,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sobanukirwa',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    connectTimeout: 10000,
  });
} else {
  console.warn('DB_HOST not configured or is localhost. Running without database.');
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
