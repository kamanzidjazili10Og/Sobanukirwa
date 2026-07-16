const mysql = require('mysql2/promise');

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Kamanzidjazili@123',
      database: 'sobanukirwa',
      charset: 'utf8mb4',
      connectTimeout: 10000,
    });
    console.log('Connected to MySQL!');
    const [tables] = await conn.query('SHOW TABLES');
    console.log('Tables:', tables.map(t => t['Tables_in_sobanukirwa']).join(', '));
    
    const [tracks] = await conn.query('SELECT COUNT(*) as cnt FROM tracks');
    console.log('Tracks:', tracks[0].cnt);
    
    const [artists] = await conn.query('SELECT COUNT(*) as cnt FROM artists');
    console.log('Artists:', artists[0].cnt);
    
    const [videos] = await conn.query('SELECT COUNT(*) as cnt FROM videos');
    console.log('Videos:', videos[0].cnt);
    
    const [books] = await conn.query('SELECT COUNT(*) as cnt FROM books');
    console.log('Books:', books[0].cnt);
    
    await conn.end();
    console.log('All good!');
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

test();
