const express = require('express');
const pool = require('../config/db');
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

router.post('/', async (req, res) => {
  try {
    const { arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target, category, audio_url, reference } = req.body;
    const [result] = await pool.query(
      'INSERT INTO adhkar (arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target, category, audio_url, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target || 33, category || 'general', audio_url, reference]
    );
    res.status(201).json({ id: result.insertId, message: 'Adhkar created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target, category, audio_url, reference } = req.body;
    await pool.query(
      'UPDATE adhkar SET arabic_text=?, transliteration=?, translation_rw=?, translation_en=?, translation_ar=?, count_target=?, category=?, audio_url=?, reference=? WHERE id=?',
      [arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target, category, audio_url, reference, req.params.id]
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
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
