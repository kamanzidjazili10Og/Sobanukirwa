const express = require('express');
const pool = require('../config/db');
const router = express.Router();

async function ensureTable() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS adhkar (
      id INT AUTO_INCREMENT PRIMARY KEY,
      arabic_text VARCHAR(500) NOT NULL,
      transliteration VARCHAR(300) DEFAULT NULL,
      translation_rw VARCHAR(500) DEFAULT NULL,
      translation_en VARCHAR(500) DEFAULT NULL,
      translation_ar VARCHAR(500) DEFAULT NULL,
      count_target INT DEFAULT 33,
      category VARCHAR(100) DEFAULT 'general',
      audio_url VARCHAR(500) DEFAULT NULL,
      reference VARCHAR(300) DEFAULT NULL,
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM adhkar');
    if (rows[0].count === 0) {
      await pool.query("INSERT INTO adhkar (arabic_text, transliteration, translation_rw, translation_en, count_target, category, sort_order) VALUES ?", [
        [
          ['سُبْحَانَ اللَّهِ', 'Subhanallah', 'Ibyubahiro ni ibya Allah', 'Glory be to Allah', 33, 'general', 1],
          ['الْحَمْدُ لِلَّهِ', 'Alhamdulillah', 'Ishimwe n\'ikuzo ni ibya Allah', 'Praise be to Allah', 33, 'general', 2],
          ['اللَّهُ أَكْبَرُ', 'Allahu Akbar', 'Allah ni Umukuru w\'ikirenga', 'Allah is the Greatest', 34, 'general', 3],
          ['لَا إِلَٰهَ إِلَّا اللَّهُ', 'La ilaha illallah', 'Nta mana iri isobok uretse Allah', 'There is no god but Allah', 10, 'general', 4],
          ['أَسْتَغْفِرُ اللَّهَ', 'Astaghfirullah', 'Nsaba imbabazi kwa Allah', 'I seek forgiveness from Allah', 10, 'general', 5],
          ['سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', 'Subhanallahi wa bihamdihi', 'Ibyubahiro n\'ishimwe ni ibya Allah', 'Glory and praise be to Allah', 100, 'morning', 6],
          ['لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', 'La ilaha illallahu wahdahu la sharika lah', 'Nta mana iri isobok uretse Allah wenyine', 'There is no god but Allah alone', 10, 'morning', 7]
        ]
      ]);
      console.log('Seeded 7 adhkar entries');
    }
  } catch (e) { console.error('Adhkar table error:', e.message); }
}
ensureTable();

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
