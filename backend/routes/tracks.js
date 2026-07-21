const express = require('express');
const pool = require('../config/db');
const upload = require('../middleware/upload');
const router = express.Router();

// Ensure duration_str column exists
async function ensureColumns() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM tracks LIKE 'duration_str'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE tracks ADD COLUMN duration_str VARCHAR(10) DEFAULT '00:00'");
    }
    const [desc] = await pool.query("SHOW COLUMNS FROM tracks LIKE 'description'");
    if (desc.length === 0) {
      await pool.query("ALTER TABLE tracks ADD COLUMN description TEXT DEFAULT NULL");
    }
  } catch (e) { /* ignore */ }
}
ensureColumns();

const SAMPLE_TRACKS = [
  { title: 'Al-Fatiha', artistQuery: 'sheikh uqash', categorySlug: 'tauhid', audio_url: 'https://server7.mp3quran.net/ahmed/001.mp3', duration_str: '01:30' },
  { title: 'Ayat Al-Kursi', artistQuery: 'sheikh uqash', categorySlug: 'tauhid', audio_url: 'https://server7.mp3quran.net/ahmed/002.mp3', duration_str: '01:45' },
  { title: 'Surah Ar-Rahman', artistQuery: 'mutabaruka', categorySlug: 'tauhid', audio_url: 'https://server7.mp3quran.net/ahmed/055.mp3', duration_str: '08:30' },
  { title: 'Surah Al-Waqiah', artistQuery: 'mutabaruka', categorySlug: 'tauhid', audio_url: 'https://server7.mp3quran.net/ahmed/056.mp3', duration_str: '03:15' },
  { title: 'Surah Al-Mulk', artistQuery: 'muhamad sulaiman', categorySlug: 'tauhid', audio_url: 'https://server7.mp3quran.net/ahmed/067.mp3', duration_str: '07:00' },
  { title: 'Surah Ya-Sin', artistQuery: 'muhamad sulaiman', categorySlug: 'tauhid', audio_url: 'https://server7.mp3quran.net/ahmed/036.mp3', duration_str: '12:00' },
  { title: 'Morning Adhkar', artistQuery: 'gahutu', categorySlug: 'adhkar', audio_url: 'https://server7.mp3quran.net/ahmed/001.mp3', duration_str: '15:00' },
  { title: 'Evening Adhkar', artistQuery: 'djamidu', categorySlug: 'adhkar', audio_url: 'https://server7.mp3quran.net/ahmed/001.mp3', duration_str: '12:00' },
  { title: 'Tauhid Lesson 1', artistQuery: 'uqash', categorySlug: 'tauhid', audio_url: 'https://server7.mp3quran.net/ahmed/001.mp3', duration_str: '45:00' },
  { title: 'Sirah of Prophet', artistQuery: 'gahutu', categorySlug: 'sirah', audio_url: 'https://server7.mp3quran.net/ahmed/002.mp3', duration_str: '32:00' },
  { title: 'Akhlaq for Muslims', artistQuery: 'uwamungu', categorySlug: 'akhlaq', audio_url: 'https://server7.mp3quran.net/ahmed/003.mp3', duration_str: '28:00' },
  { title: 'Khutbah: Taqwa', artistQuery: 'mutabaruka', categorySlug: 'khutubah', audio_url: 'https://server7.mp3quran.net/ahmed/004.mp3', duration_str: '22:00' },
];

async function seedSampleTracks() {
  try {
    const [existing] = await pool.query('SELECT COUNT(*) as count FROM tracks WHERE is_active = 1');
    if (existing[0].count > 0) return false;
    const [artists] = await pool.query('SELECT id, LOWER(name) as name FROM artists');
    const [cats] = await pool.query('SELECT id, slug, LOWER(name) as name FROM categories');
    if (artists.length === 0) return false;
    let inserted = 0;
    for (const t of SAMPLE_TRACKS) {
      const artist = artists.find(a => a.name.includes(t.artistQuery));
      const cat = cats.find(c => c.slug === t.categorySlug || c.name.includes(t.categorySlug));
      await pool.query(
        'INSERT INTO tracks (artist_id, category_id, title, audio_url, duration_str, description) VALUES (?, ?, ?, ?, ?, ?)',
        [artist ? artist.id : artists[0].id, cat ? cat.id : null, t.title, t.audio_url, t.duration_str, t.title + ' - Sample track for admin preview']
      );
      inserted++;
    }
    console.log('Seeded ' + inserted + ' sample tracks');
    return true;
  } catch (err) {
    console.error('Auto-seed tracks failed:', err.message);
    return false;
  }
}

router.get('/', async (req, res) => {
  try {
    const { artist_id, category_id, search } = req.query;
    let sql = `SELECT t.*, a.name as artist_name, a.name_ar as artist_name_ar, a.name_en as artist_name_en,
               a.image_url as artist_image, c.name as category_name, c.name_ar as category_name_ar, c.name_en as category_name_en
               FROM tracks t
               LEFT JOIN artists a ON t.artist_id = a.id
               LEFT JOIN categories c ON t.category_id = c.id
               WHERE t.is_active = 1`;
    const params = [];

    if (artist_id) { sql += ' AND t.artist_id = ?'; params.push(artist_id); }
    if (category_id) { sql += ' AND t.category_id = ?'; params.push(category_id); }
    if (search) { sql += ' AND (t.title LIKE ? OR t.title_ar LIKE ? OR t.title_en LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    sql += ' ORDER BY t.sort_order ASC, t.created_at DESC';

    const [rows] = await pool.query(sql, params);

    if (rows.length === 0 && !artist_id && !category_id && !search) {
      const seeded = await seedSampleTracks();
      if (seeded) {
        const [newRows] = await pool.query(sql, params);
        return res.json(newRows);
      }
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, a.name as artist_name FROM tracks t
       LEFT JOIN artists a ON t.artist_id = a.id
       WHERE t.is_featured = 1 AND t.is_active = 1
       ORDER BY t.created_at DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, a.name as artist_name, c.name as category_name
       FROM tracks t
       LEFT JOIN artists a ON t.artist_id = a.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Track not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const { artist_id, category_id, title, title_ar, title_en, description, duration_str } = req.body;
    const audioUrl = req.file ? `/uploads/audio/${req.file.filename}` : req.body.audio_url;

    const [existing] = await pool.query(
      'SELECT id FROM tracks WHERE title = ? AND is_active = 1 LIMIT 1',
      [title]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Track already exists', existingId: existing[0].id });
    }

    let resolvedArtistId = artist_id || null;
    if (!resolvedArtistId) {
      const [firstArtist] = await pool.query('SELECT id FROM artists ORDER BY id ASC LIMIT 1');
      if (firstArtist.length > 0) resolvedArtistId = firstArtist[0].id;
    }

    const [result] = await pool.query(
      'INSERT INTO tracks (artist_id, category_id, title, title_ar, title_en, description, duration_str, audio_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [resolvedArtistId, category_id || null, title, title_ar || null, title_en || null, description || null, duration_str || '00:00', audioUrl]
    );

    if (resolvedArtistId) {
      await pool.query('UPDATE artists SET total_lessons = total_lessons + 1 WHERE id = ?', [resolvedArtistId]);
    }

    res.status(201).json({ id: result.insertId, message: 'Track created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', upload.single('audio'), async (req, res) => {
  try {
    const { artist_id, category_id, title, title_ar, title_en, description, duration_str } = req.body;
    let sql = 'UPDATE tracks SET artist_id=?, category_id=?, title=?, title_ar=?, title_en=?, description=?, duration_str=?';
    const params = [artist_id || null, category_id || null, title, title_ar || null, title_en || null, description || null, duration_str || '00:00'];

    if (req.file) {
      sql += ', audio_url=?';
      params.push(`/uploads/audio/${req.file.filename}`);
    }

    sql += ' WHERE id=?';
    params.push(req.params.id);

    await pool.query(sql, params);
    res.json({ message: 'Track updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [track] = await pool.query('SELECT artist_id FROM tracks WHERE id = ?', [req.params.id]);
    await pool.query('UPDATE tracks SET is_active = 0 WHERE id = ?', [req.params.id]);
    if (track.length > 0) {
      await pool.query('UPDATE artists SET total_lessons = total_lessons - 1 WHERE id = ?', [track[0].artist_id]);
    }
    res.json({ message: 'Track deactivated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/play', async (req, res) => {
  try {
    await pool.query('UPDATE tracks SET plays_count = plays_count + 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Play counted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
