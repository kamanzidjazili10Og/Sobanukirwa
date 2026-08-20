const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function splitSql(sql) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let inDollar = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1] || '';

    if (inLineComment) {
      if (ch === '\n') { inLineComment = false; current += ch; }
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') { inBlockComment = false; current += ' */'; i++; }
      continue;
    }

    if (!inSingle && !inDouble && !inDollar) {
      if (ch === '-' && next === '-') { inLineComment = true; continue; }
      if (ch === '/' && next === '*') { inBlockComment = true; current += '/* '; i++; continue; }
      if (ch === "'") { inSingle = true; current += ch; continue; }
      if (ch === '"') { inDouble = true; current += ch; continue; }
      if (ch === '$' && next === '$') { inDollar = true; current += ch + next; i++; continue; }
      if (ch === ';') {
        const trimmed = current.trim();
        if (trimmed) statements.push(trimmed);
        current = '';
        continue;
      }
    } else if (inSingle) {
      if (ch === "'" && next !== "'") { inSingle = false; current += ch; continue; }
      if (ch === "'" && next === "'") { current += ch + next; i++; continue; }
    } else if (inDouble) {
      if (ch === '"' && next !== '"') { inDouble = false; current += ch; continue; }
      if (ch === '"' && next === '"') { current += ch + next; i++; continue; }
    } else if (inDollar) {
      if (ch === '$' && next === '$') { inDollar = false; current += ch + next; i++; continue; }
    }

    current += ch;
  }

  const trimmed = current.trim();
  if (trimmed) statements.push(trimmed);
  return statements;
}

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

  const pool = new Pool(connectionConfig);

  try {
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'sobanukirwa_pg.sql');
    const fallbackPath = path.join(__dirname, '..', '..', 'database', 'sobanukirwa_schema.sql');

    let schemaFile = schemaPath;
    if (!fs.existsSync(schemaPath) && fs.existsSync(fallbackPath)) {
      schemaFile = fallbackPath;
    }

    if (!fs.existsSync(schemaFile)) {
      console.warn('Schema file not found:', schemaFile);
      await pool.end();
      return;
    }

    const schema = fs.readFileSync(schemaFile, 'utf8');
    const statements = splitSql(schema);
    console.log(`Running ${statements.length} SQL statements...`);

    let succeeded = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await pool.query(stmt);
        succeeded++;
      } catch (err) {
        if (err.code === '42P07' || err.code === '42710' || err.code === '23505') {
          failed++;
        } else {
          const errMsg = `SQL ${i + 1}: ${err.message.substring(0, 200)}`;
          errors.push(errMsg);
          console.error(errMsg);
          console.error('Statement:', stmt.substring(0, 150));
          failed++;
        }
      }
    }

    console.log(`Schema init complete: ${succeeded} succeeded, ${failed} skipped/failed`);
    await pool.end();
    return { succeeded, failed, errors };
  } catch (err) {
    console.error('Init error:', err.message);
    try { await pool.end(); } catch (e) {}
    throw err;
  }
}

module.exports = initDb;
