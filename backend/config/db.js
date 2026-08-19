const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || null;

let pool = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
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
    if (!pool) throw new Error('Database not configured. Set DATABASE_URL environment variable.');
    return await pool.query(sql, params);
  },
  execute: async (sql, params) => {
    if (!pool) throw new Error('Database not configured. Set DATABASE_URL environment variable.');
    return await pool.query(sql, params);
  },
  getConnection: async () => {
    if (!pool) throw new Error('Database not configured');
    return await pool.connect();
  },
  end: async () => {
    if (pool) await pool.end();
  },
  isReady: () => pool !== null,
};

module.exports = safePool;
