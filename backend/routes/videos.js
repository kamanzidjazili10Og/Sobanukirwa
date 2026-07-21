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

const SAMPLE_VIDEOS = [
  { title: 'Amateka y\'intumwa y\'imana Muhamad (S.A.W)', author: 'Sheikh Uqash', video_url: '/uploads/videos/sample-1.mp4', duration_str: '45:00', title_en: 'The Story of Prophet Muhammad (PBUH)', description: 'Amateka y\'Intumwa Muhamad (SAW) y\'umuvandimwe wacu.' },
  { title: 'Inyigisho ku Kwihangana', author: 'Sheikh Mutabaruka', video_url: '/uploads/videos/sample-2.mp4', duration_str: '32:00', title_en: 'Lesson on Patience', description: 'Inyigisho zibanzirizwa ku kwihangana mu buzima bw\'imisi yose.' },
  { title: 'Gusobanukirwa Icyo Kwemera Ari cyo', author: 'Sheikh Gahutu', video_url: '/uploads/videos/sample-3.mp4', duration_str: '28:00', title_en: 'Understanding What Faith Is', description: 'Ubusobanuro bwa Imani n\'uburyo bwayo.' },
  { title: 'Uburyo bwo Gusenga', author: 'Sheikh Djamidu', video_url: '/uploads/videos/sample-4.mp4', duration_str: '38:00', title_en: 'How to Pray', description: 'Inama zerekerana n\'uburyo bwo gusenga neza.' },
  { title: 'Urukundo mu Buvandimwe', author: 'Sheikh Uwamungu', video_url: '/uploads/videos/sample-5.mp4', duration_str: '25:00', title_en: 'Love Among Brothers', description: 'Akamaro k\'urukundo n\'ubuvandimwe mu Isilamu.' },
  { title: 'Kubaha Ababyeyi', author: 'Sheikh Mugabo', video_url: '/uploads/videos/sample-6.mp4', duration_str: '30:00', title_en: 'Respecting Parents', description: 'Ubuhe buryo bw\'ubuhizi n\'ubukwe bwa vyakuru.' },
  { title: 'Ingaruka z\'Ubuyobe', author: 'Sheikh Habyarimana', video_url: '/uploads/videos/sample-7.mp4', duration_str: '27:00', title_en: 'Consequences of Sin', description: 'Ingaruka z\'ubusambanyi n\'ubuyobe mu buzima.' },
  { title: 'Uburenganzira bw\'Umugore mu Isilamu', author: 'Sheikh Uwimana', video_url: '/uploads/videos/sample-8.mp4', duration_str: '35:00', title_en: 'Women\'s Rights in Islam', description: 'Uburenganzira bwa so mu Isilamu.' },
  { title: 'Akamaro k\'Ishuri', author: 'Sheikh Niyonzima', video_url: '/uploads/videos/sample-9.mp4', duration_str: '22:00', title_en: 'Importance of Knowledge', description: 'Akamaro k\'ubumenyi mu buzima bw\'umuntu.' },
  { title: 'Kugirana Imyifatire Myiza', author: 'Sheikh Tuyisenge', video_url: '/uploads/videos/sample-10.mp4', duration_str: '29:00', title_en: 'Having Good Character', description: 'Uburyo bwo gutega imyifatire myiza mu buzima.' },
  { title: 'Urupfu n\'Ubuzima nyuma y\'Urupfu', author: 'Sheikh Munyaneza', video_url: '/uploads/videos/sample-11.mp4', duration_str: '40:00', title_en: 'Death and the Afterlife', description: 'Ijambo rerekerana urupfu n\'ubuzima busigaye.' },
  { title: 'Ubumwe n\'Urukundo mu Bamisilamu', author: 'Sheikh Nsabimana', video_url: '/uploads/videos/sample-12.mp4', duration_str: '33:00', title_en: 'Unity and Love Among Muslims', description: 'Akamaro k\'ubumwe n\'urukundo mu bamisilamu.' },
];

async function seedSampleVideos() {
  try {
    const [existing] = await pool.query('SELECT COUNT(*) as count FROM videos WHERE is_active = 1');
    if (existing[0].count > 0) return false;
    let inserted = 0;
    for (const v of SAMPLE_VIDEOS) {
      await pool.query(
        'INSERT INTO videos (title, title_en, author, description, video_url, thumbnail_url, duration_str) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [v.title, v.title_en || null, v.author || null, v.description || null, v.video_url, v.thumbnail_url || null, v.duration_str || null]
      );
      inserted++;
    }
    console.log('Seeded ' + inserted + ' sample videos');
    return true;
  } catch (err) {
    console.error('Auto-seed videos failed:', err.message);
    return false;
  }
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM videos WHERE is_active = 1 ORDER BY created_at DESC'
    );

    if (rows.length === 0) {
      const seeded = await seedSampleVideos();
      if (seeded) {
        const [newRows] = await pool.query('SELECT * FROM videos WHERE is_active = 1 ORDER BY created_at DESC');
        return res.json(newRows);
      }
    }

    res.json(rows);
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
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE videos SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Video deactivated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
