const express = require('express');
const pool = require('../config/db');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { artist_id, category_id, search } = req.query;
    let sql = `SELECT t.*, a.name as artist_name, a.name_ar as artist_name_ar, a.name_en as artist_name_en,
               a.image_url as artist_image, c.name as category_name, c.name_ar as category_name_ar, c.name_en as category_name_en
               FROM tracks t
               LEFT JOIN artists a ON t.artist_id = a.id
               LEFT JOIN categories c ON t.category_id = c.id
               WHERE t.is_active = TRUE`;
    const params = [];
    let i = 1;

    if (artist_id) { sql += ` AND t.artist_id = $${i++}`; params.push(artist_id); }
    if (category_id) { sql += ` AND t.category_id = $${i++}`; params.push(category_id); }
    if (search) { sql += ` AND (t.title ILIKE $${i} OR t.title_ar ILIKE $${i} OR t.title_en ILIKE $${i})`; params.push(`%${search}%`); i++; }

    sql += ' ORDER BY t.sort_order ASC, t.created_at DESC';

    const { rows } = await pool.query(sql, params);

    const seen = {};
    const deduped = [];
    for (const row of rows) {
      const key = `${(row.title || '').toLowerCase().trim()}|${row.artist_id || ''}`;
      if (seen[key]) continue;
      seen[key] = true;
      deduped.push(row);
    }

    res.json(deduped);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, a.name as artist_name FROM tracks t
       LEFT JOIN artists a ON t.artist_id = a.id
       WHERE t.is_featured = TRUE AND t.is_active = TRUE
       ORDER BY t.created_at DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, a.name as artist_name, c.name as category_name
       FROM tracks t
       LEFT JOIN artists a ON t.artist_id = a.id
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Track not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const { artist_id, category_id, title, title_ar, title_en, description, duration_str } = req.body;
    const audioUrl = req.file ? `/uploads/audio/${req.file.filename}` : req.body.audio_url;

    const { rows: existing } = await pool.query(
      'SELECT id FROM tracks WHERE title = $1 AND is_active = TRUE LIMIT 1',
      [title]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Track already exists', existingId: existing[0].id });
    }

    let resolvedArtistId = artist_id || null;
    if (!resolvedArtistId) {
      const { rows: firstArtist } = await pool.query('SELECT id FROM artists ORDER BY id ASC LIMIT 1');
      if (firstArtist.length > 0) resolvedArtistId = firstArtist[0].id;
    }

    const { rows } = await pool.query(
      'INSERT INTO tracks (artist_id, category_id, title, title_ar, title_en, description, duration_str, audio_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [resolvedArtistId, category_id || null, title, title_ar || null, title_en || null, description || null, duration_str || '00:00', audioUrl]
    );

    if (resolvedArtistId) {
      await pool.query('UPDATE artists SET total_lessons = total_lessons + 1 WHERE id = $1', [resolvedArtistId]);
    }

    res.status(201).json({ id: rows[0] ? rows[0].id : null, message: 'Track created' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', upload.single('audio'), async (req, res) => {
  try {
    const { artist_id, category_id, title, title_ar, title_en, description, duration_str } = req.body;
    let sql = 'UPDATE tracks SET artist_id=$1, category_id=$2, title=$3, title_ar=$4, title_en=$5, description=$6, duration_str=$7';
    const params = [artist_id || null, category_id || null, title, title_ar || null, title_en || null, description || null, duration_str || '00:00'];

    if (req.file) {
      sql += `, audio_url=$${params.length + 1}`;
      params.push(`/uploads/audio/${req.file.filename}`);
    }

    sql += ` WHERE id=$${params.length + 1}`;
    params.push(req.params.id);

    await pool.query(sql, params);
    res.json({ message: 'Track updated' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rows: track } = await pool.query('SELECT artist_id FROM tracks WHERE id = $1', [req.params.id]);
    await pool.query('UPDATE tracks SET is_active = FALSE WHERE id = $1', [req.params.id]);
    if (track.length > 0) {
      await pool.query('UPDATE artists SET total_lessons = total_lessons - 1 WHERE id = $1', [track[0].artist_id]);
    }
    res.json({ message: 'Track deactivated' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/:id/play', async (req, res) => {
  try {
    await pool.query('UPDATE tracks SET plays_count = plays_count + 1 WHERE id = $1', [req.params.id]);
    res.json({ message: 'Play counted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
