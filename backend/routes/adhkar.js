const express = require('express');
const pool = require('../config/db');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM adhkar WHERE is_active = 1';
    const params = [];
    if (category) { sql += ' AND category = ?'; params.push(category); }
    sql += ' ORDER BY sort_order ASC, id ASC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM adhkar WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Adhkar not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err && err.code !== 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Upload error', error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target, category, audio_url, reference } = req.body;
    const audioPath = req.file ? `/uploads/audio/${req.file.filename}` : (audio_url || null);

    const [existing] = await pool.query(
      'SELECT id FROM adhkar WHERE arabic_text = ? AND is_active = 1 LIMIT 1',
      [arabic_text]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Adhkar already exists', existingId: existing[0].id });
    }

    const [result] = await pool.query(
      'INSERT INTO adhkar (arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target, category, audio_url, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target || 33, category || 'general', audioPath, reference]
    );
    res.status(201).json({ id: result.insertId, message: 'Adhkar created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err && err.code !== 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Upload error', error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target, category, audio_url, reference } = req.body;
    let audioPath = audio_url || null;
    if (req.file) {
      audioPath = `/uploads/audio/${req.file.filename}`;
    }
    await pool.query(
      'UPDATE adhkar SET arabic_text=?, transliteration=?, translation_rw=?, translation_en=?, translation_ar=?, count_target=?, category=?, audio_url=?, reference=? WHERE id=?',
      [arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target, category, audioPath, reference, req.params.id]
    );
    res.json({ message: 'Adhkar updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE adhkar SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Adhkar deactivated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
