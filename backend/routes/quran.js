const express = require('express');
const pool = require('../config/db');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/surahs', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM quran_surahs ORDER BY surah_number');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/surahs/:number', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM quran_surahs WHERE surah_number = $1', [req.params.number]);
    if (rows.length === 0) return res.status(404).json({ message: 'Surah not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/surahs/:number', async (req, res) => {
  try {
    const { name, name_arabic, ayahs_count, revelation_type } = req.body;
    await pool.query(
      'UPDATE quran_surahs SET name=$1, name_arabic=$2, ayahs_count=$3, revelation_type=$4 WHERE surah_number=$5',
      [name, name_arabic, ayahs_count, revelation_type, req.params.number]
    );
    res.json({ message: 'Surah updated' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/surahs/:number/audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No audio file uploaded' });
    const audioUrl = `/uploads/audio/${req.file.filename}`;
    await pool.query('UPDATE quran_surahs SET audio_url = $1 WHERE surah_number = $2', [audioUrl, req.params.number]);
    res.json({ message: 'Audio uploaded', audio_url: audioUrl });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
