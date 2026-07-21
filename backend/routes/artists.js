const express = require('express');
const pool = require('../config/db');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT a.*, COUNT(t.id) as total_tracks FROM artists a LEFT JOIN tracks t ON a.id = t.artist_id AND t.is_active = 1 WHERE a.is_active = 1 GROUP BY a.id ORDER BY a.name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM artists WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Artist not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, name_ar, name_en, bio } = req.body;
    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : null;

    const [existing] = await pool.query(
      'SELECT id FROM artists WHERE name = ? AND is_active = 1 LIMIT 1',
      [name]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Artist already exists', existingId: existing[0].id });
    }

    const [result] = await pool.query(
      'INSERT INTO artists (name, name_ar, name_en, bio, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, name_ar, name_en, bio, imageUrl]
    );
    res.status(201).json({ id: result.insertId, message: 'Artist created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, name_ar, name_en, bio } = req.body;
    let query = 'UPDATE artists SET name=?, name_ar=?, name_en=?, bio=?';
    const params = [name, name_ar, name_en, bio];

    if (req.file) {
      query += ', image_url=?';
      params.push(`/uploads/images/${req.file.filename}`);
    }

    query += ' WHERE id=?';
    params.push(req.params.id);

    await pool.query(query, params);
    res.json({ message: 'Artist updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE artists SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Artist deactivated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
