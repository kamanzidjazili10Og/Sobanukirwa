const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, COUNT(t.id) as total_tracks FROM artists a LEFT JOIN tracks t ON a.id = t.artist_id AND t.is_active = TRUE WHERE a.is_active = TRUE GROUP BY a.id ORDER BY a.name`
    );
    const seen = {};
    const deduped = [];
    for (const row of rows) {
      const key = (row.name || '').toLowerCase().trim();
      if (key && seen[key]) continue;
      if (key) seen[key] = true;
      deduped.push(row);
    }
    res.json(deduped);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM artists WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Artist not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, name_ar, name_en, bio } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/images/${req.file.filename}`;
    }

    const { rows: existing } = await pool.query(
      'SELECT id FROM artists WHERE LOWER(name) = LOWER($1) AND is_active = TRUE LIMIT 1',
      [name]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Artist already exists', existingId: existing[0].id });
    }

    const { rows } = await pool.query(
      'INSERT INTO artists (name, name_ar, name_en, bio, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, name_ar || null, name_en || null, bio || null, imageUrl]
    );
    res.status(201).json({ id: rows[0].id, message: 'Artist created' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, name_ar, name_en, bio } = req.body;
    let query = 'UPDATE artists SET name=$1, name_ar=$2, name_en=$3, bio=$4';
    const params = [name, name_ar || null, name_en || null, bio || null];

    if (req.file) {
      params.push(`/uploads/images/${req.file.filename}`);
      query += `, image_url=$${params.length}`;
    }

    params.push(req.params.id);
    query += ` WHERE id=$${params.length}`;

    await pool.query(query, params);
    res.json({ message: 'Artist updated' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE artists SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Artist deactivated' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
