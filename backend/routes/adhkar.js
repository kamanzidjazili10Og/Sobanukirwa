const express = require('express');
const pool = require('../config/db');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM adhkar WHERE is_active = TRUE';
    const params = [];
    let i = 1;
    if (category) { sql += ` AND category = $${i++}`; params.push(category); }
    sql += ' ORDER BY sort_order ASC, id ASC';
    const { rows } = await pool.query(sql, params);

    const seen = {};
    const deduped = [];
    for (const row of rows) {
      const key = (row.arabic_text || '').trim();
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
    const { rows } = await pool.query('SELECT * FROM adhkar WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Adhkar not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
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

    const { rows: existing } = await pool.query(
      'SELECT id FROM adhkar WHERE arabic_text = $1 AND is_active = TRUE LIMIT 1',
      [arabic_text]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Adhkar already exists', existingId: existing[0].id });
    }

    const { rows } = await pool.query(
      'INSERT INTO adhkar (arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target, category, audio_url, reference) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target || 33, category || 'general', audioPath, reference]
    );
    res.status(201).json({ id: rows[0].id, message: 'Adhkar created' });
    req.app.get('bumpVersion')();
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
      'UPDATE adhkar SET arabic_text=$1, transliteration=$2, translation_rw=$3, translation_en=$4, translation_ar=$5, count_target=$6, category=$7, audio_url=$8, reference=$9 WHERE id=$10',
      [arabic_text, transliteration, translation_rw, translation_en, translation_ar, count_target, category, audioPath, reference, req.params.id]
    );
    res.json({ message: 'Adhkar updated' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE adhkar SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Adhkar deactivated' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
