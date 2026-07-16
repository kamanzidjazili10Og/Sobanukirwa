require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const schemaPath = path.join(__dirname, '..', '..', 'database', 'sobanukirwa_schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  try {
    await connection.query(schema);
    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seed error:', err.message);
  }

  await connection.end();
  process.exit(0);
}

seed();
