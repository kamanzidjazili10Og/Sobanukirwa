const express = require('express');
const pool = require('../config/db');
const upload = require('../middleware/upload');
const router = express.Router();

async function ensureColumns() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM videos LIKE 'duration_str'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE videos ADD COLUMN duration_str VARCHAR(10) DEFAULT NULL");
    }
  } catch (e) { /* ignore */ }
}
ensureColumns();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM videos WHERE is_active = 1 ORDER BY created_at DESC'
    );

    const seen = {};
    const deduped = [];
    for (const row of rows) {
      const key = (row.title || '').toLowerCase().trim();
      if (seen[key]) continue;
      seen[key] = true;
      deduped.push(row);
    }

    res.json(deduped);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM videos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Video not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, title_ar, title_en, author, author_ar, author_en, description } = req.body;
    const videoUrl = req.files.video ? `/uploads/videos/${req.files.video[0].filename}` : req.body.video_url;
    const thumbnailUrl = req.files.thumbnail ? `/uploads/images/${req.files.thumbnail[0].filename}` : req.body.thumbnail_url;

    const [existing] = await pool.query(
      'SELECT id FROM videos WHERE title = ? AND is_active = 1 LIMIT 1',
      [title]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Video already exists', existingId: existing[0].id });
    }

    const [result] = await pool.query(
      'INSERT INTO videos (title, title_ar, title_en, author, author_ar, author_en, description, video_url, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, title_ar || null, title_en || null, author || null, author_ar || null, author_en || null, description || null, videoUrl, thumbnailUrl || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Video created' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, title_ar, title_en, author, author_ar, author_en, description } = req.body;
    let sql = 'UPDATE videos SET title=?, title_ar=?, title_en=?, author=?, author_ar=?, author_en=?, description=?';
    const params = [title, title_ar || null, title_en || null, author || null, author_ar || null, author_en || null, description || null];

    if (req.files && req.files.video) { sql += ', video_url=?'; params.push(`/uploads/videos/${req.files.video[0].filename}`); }
    if (req.files && req.files.thumbnail) { sql += ', thumbnail_url=?'; params.push(`/uploads/images/${req.files.thumbnail[0].filename}`); }

    sql += ' WHERE id=?';
    params.push(req.params.id);

    await pool.query(sql, params);
    res.json({ message: 'Video updated' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE videos SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Video deactivated' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
