const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sobanukirwa',
  charset: 'utf8mb4'
});

async function cleanupDuplicateArtists() {
  console.log('\n--- Cleaning duplicate artists ---');
  const [rows] = await pool.query(
    `SELECT name, MIN(id) as keep_id, COUNT(*) as cnt
     FROM artists WHERE is_active = 1
     GROUP BY LOWER(name)
     HAVING cnt > 1`
  );

  if (rows.length === 0) {
    console.log('  No duplicate artists found.');
    return 0;
  }

  let removed = 0;
  for (const dup of rows) {
    console.log(`  Found ${dup.cnt} copies of artist "${dup.name}" (keeping id=${dup.keep_id})`);
    await pool.query(
      'UPDATE artists SET is_active = 0 WHERE LOWER(name) = LOWER(?) AND id != ? AND is_active = 1',
      [dup.name, dup.keep_id]
    );
    // Reassign tracks from deactivated artists to the kept one
    const [deactivated] = await pool.query(
      'SELECT id FROM artists WHERE LOWER(name) = LOWER(?) AND is_active = 0 AND id != ?',
      [dup.name, dup.keep_id]
    );
    for (const d of deactivated) {
      await pool.query('UPDATE tracks SET artist_id = ? WHERE artist_id = ?', [dup.keep_id, d.id]);
      await pool.query('UPDATE artists SET total_lessons = total_lessons + (SELECT COUNT(*) FROM tracks WHERE artist_id = ?) WHERE id = ?', [dup.keep_id, dup.keep_id]);
    }
    removed += dup.cnt - 1;
  }
  console.log(`  Deactivated ${removed} duplicate artist(s).`);
  return removed;
}

async function cleanupDuplicateTracks() {
  console.log('\n--- Cleaning duplicate tracks ---');
  const [rows] = await pool.query(
    `SELECT title, artist_id, MIN(id) as keep_id, COUNT(*) as cnt
     FROM tracks WHERE is_active = 1
     GROUP BY title, artist_id
     HAVING cnt > 1`
  );

  if (rows.length === 0) {
    console.log('  No duplicate tracks found.');
    return 0;
  }

  let removed = 0;
  for (const dup of rows) {
    console.log(`  Found ${dup.cnt} copies of track "${dup.title}" (artist_id=${dup.artist_id}, keeping id=${dup.keep_id})`);
    await pool.query(
      'UPDATE tracks SET is_active = 0 WHERE title = ? AND artist_id = ? AND id != ? AND is_active = 1',
      [dup.title, dup.artist_id, dup.keep_id]
    );
    removed += dup.cnt - 1;
  }
  console.log(`  Deactivated ${removed} duplicate track(s).`);
  return removed;
}

async function cleanupDuplicateVideos() {
  console.log('\n--- Cleaning duplicate videos ---');
  const [rows] = await pool.query(
    `SELECT title, MIN(id) as keep_id, COUNT(*) as cnt
     FROM videos WHERE is_active = 1
     GROUP BY title
     HAVING cnt > 1`
  );

  if (rows.length === 0) {
    console.log('  No duplicate videos found.');
    return 0;
  }

  let removed = 0;
  for (const dup of rows) {
    console.log(`  Found ${dup.cnt} copies of video "${dup.title}" (keeping id=${dup.keep_id})`);
    await pool.query(
      'UPDATE videos SET is_active = 0 WHERE title = ? AND id != ? AND is_active = 1',
      [dup.title, dup.keep_id]
    );
    removed += dup.cnt - 1;
  }
  console.log(`  Deactivated ${removed} duplicate video(s).`);
  return removed;
}

async function cleanupDuplicateBooks() {
  console.log('\n--- Cleaning duplicate books ---');
  const [rows] = await pool.query(
    `SELECT title, MIN(id) as keep_id, COUNT(*) as cnt
     FROM books WHERE is_active = 1
     GROUP BY title
     HAVING cnt > 1`
  );

  if (rows.length === 0) {
    console.log('  No duplicate books found.');
    return 0;
  }

  let removed = 0;
  for (const dup of rows) {
    console.log(`  Found ${dup.cnt} copies of book "${dup.title}" (keeping id=${dup.keep_id})`);
    await pool.query(
      'UPDATE books SET is_active = 0 WHERE title = ? AND id != ? AND is_active = 1',
      [dup.title, dup.keep_id]
    );
    removed += dup.cnt - 1;
  }
  console.log(`  Deactivated ${removed} duplicate book(s).`);
  return removed;
}

async function cleanupDuplicateAdhkar() {
  console.log('\n--- Cleaning duplicate adhkar ---');
  const [rows] = await pool.query(
    `SELECT arabic_text, MIN(id) as keep_id, COUNT(*) as cnt
     FROM adhkar WHERE is_active = 1
     GROUP BY arabic_text
     HAVING cnt > 1`
  );

  if (rows.length === 0) {
    console.log('  No duplicate adhkar found.');
    return 0;
  }

  let removed = 0;
  for (const dup of rows) {
    console.log(`  Found ${dup.cnt} copies of adhkar (keeping id=${dup.keep_id})`);
    await pool.query(
      'UPDATE adhkar SET is_active = 0 WHERE arabic_text = ? AND id != ? AND is_active = 1',
      [dup.arabic_text, dup.keep_id]
    );
    removed += dup.cnt - 1;
  }
  console.log(`  Deactivated ${removed} duplicate adhkar entry(ies).`);
  return removed;
}

async function cleanupDuplicateCategories() {
  console.log('\n--- Cleaning duplicate categories ---');
  const [rows] = await pool.query(
    `SELECT slug, MIN(id) as keep_id, COUNT(*) as cnt
     FROM categories WHERE is_active = 1
     GROUP BY LOWER(slug)
     HAVING cnt > 1`
  );

  if (rows.length === 0) {
    console.log('  No duplicate categories found.');
    return 0;
  }

  let removed = 0;
  for (const dup of rows) {
    console.log(`  Found ${dup.cnt} copies of category "${dup.slug}" (keeping id=${dup.keep_id})`);
    // Reassign tracks to kept category
    const [deactivated] = await pool.query(
      'SELECT id FROM categories WHERE LOWER(slug) = LOWER(?) AND is_active = 0 AND id != ?',
      [dup.slug, dup.keep_id]
    );
    for (const d of deactivated) {
      await pool.query('UPDATE tracks SET category_id = ? WHERE category_id = ?', [dup.keep_id, d.id]);
    }
    await pool.query(
      'UPDATE categories SET is_active = 0 WHERE LOWER(slug) = LOWER(?) AND id != ? AND is_active = 1',
      [dup.slug, dup.keep_id]
    );
    removed += dup.cnt - 1;
  }
  console.log(`  Deactivated ${removed} duplicate category(ies).`);
  return removed;
}

async function printCounts() {
  console.log('\n=== Current Record Counts ===');
  const [artists] = await pool.query('SELECT COUNT(*) as c FROM artists WHERE is_active = 1');
  const [tracks] = await pool.query('SELECT COUNT(*) as c FROM tracks WHERE is_active = 1');
  const [videos] = await pool.query('SELECT COUNT(*) as c FROM videos WHERE is_active = 1');
  const [books] = await pool.query('SELECT COUNT(*) as c FROM books WHERE is_active = 1');
  const [adhkar] = await pool.query('SELECT COUNT(*) as c FROM adhkar WHERE is_active = 1');
  const [cats] = await pool.query('SELECT COUNT(*) as c FROM categories WHERE is_active = 1');

  console.log(`  Artists:    ${artists[0].c}`);
  console.log(`  Tracks:     ${tracks[0].c}`);
  console.log(`  Videos:     ${videos[0].c}`);
  console.log(`  Books:      ${books[0].c}`);
  console.log(`  Adhkar:     ${adhkar[0].c}`);
  console.log(`  Categories: ${cats[0].c}`);
}

async function main() {
  console.log('Sobanukirwa - Duplicate Cleanup Script');
  console.log('======================================');

  await printCounts();

  const totalRemoved =
    (await cleanupDuplicateArtists()) +
    (await cleanupDuplicateTracks()) +
    (await cleanupDuplicateVideos()) +
    (await cleanupDuplicateBooks()) +
    (await cleanupDuplicateAdhkar()) +
    (await cleanupDuplicateCategories());

  console.log('\n=== Cleanup Summary ===');
  console.log(`  Total duplicate records deactivated: ${totalRemoved}`);

  await printCounts();

  console.log('\nCleanup complete!');
  await pool.end();
  process.exit(0);
}

main().catch(err => {
  console.error('Cleanup failed:', err.message);
  process.exit(1);
});
