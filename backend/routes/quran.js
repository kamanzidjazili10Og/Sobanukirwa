const express = require('express');
const pool = require('../config/db');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/surahs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM quran_surahs ORDER BY surah_number');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/surahs/:number', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM quran_surahs WHERE surah_number = ?', [req.params.number]);
    if (rows.length === 0) return res.status(404).json({ message: 'Surah not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/surahs/:number/audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No audio file uploaded' });
    const audioUrl = `/uploads/audio/${req.file.filename}`;
    await pool.query('UPDATE quran_surahs SET audio_url = ? WHERE surah_number = ?', [audioUrl, req.params.number]);
    res.json({ message: 'Audio uploaded', audio_url: audioUrl });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
