const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || null;

let pool = null;

if (connectionString) {
  let url = connectionString;
  if (url.includes('?')) {
    url += '&sslmode=require';
  } else {
    url += '?sslmode=require';
  }
  pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  });
  console.log('PostgreSQL pool created');
} else {
  const dbHost = process.env.DB_HOST;
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPass = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'sobanukirwa';
  const dbPort = process.env.DB_PORT || 5432;

  if (dbHost) {
    pool = new Pool({
      host: dbHost,
      port: parseInt(dbPort),
      user: dbUser,
      password: dbPass,
      database: dbName,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      ssl: dbHost !== 'localhost' && dbHost !== '127.0.0.1' ? { rejectUnauthorized: false } : false,
    });
    console.log('PostgreSQL pool created for ' + dbHost + ':' + dbPort + '/' + dbName);
  } else {
    console.warn('DATABASE_URL/DB_HOST not configured. Running without database.');
  }
}

const safePool = {
  query: async (sql, params) => {
    if (!pool) {
      console.warn('DB query attempted but pool is null');
      return { rows: [], rowCount: 0 };
    }
    try {
      return await pool.query(sql, params);
    } catch (err) {
      console.error('DB query error:', err.message);
      return { rows: [], rowCount: 0 };
    }
  },
  execute: async (sql, params) => {
    if (!pool) {
      console.warn('DB execute attempted but pool is null');
      return { rows: [], rowCount: 0 };
    }
    try {
      return await pool.query(sql, params);
    } catch (err) {
      console.error('DB execute error:', err.message);
      return { rows: [], rowCount: 0 };
    }
  },
  getConnection: async () => {
    if (!pool) throw new Error('Database not configured');
    return await pool.connect();
  },
  end: async () => {
    if (pool) await pool.end();
  },
  ping: async () => {
    if (!pool) return { connected: false, error: 'No pool configured' };
    try {
      const result = await pool.query('SELECT 1 as ok');
      return { connected: true, rows: result.rows };
    } catch (err) {
      return { connected: false, error: err.message, code: err.code };
    }
  },
  isReady: () => pool !== null,
};

module.exports = safePool;
