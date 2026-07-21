const express = require('express');
const pool = require('../config/db');
const upload = require('../middleware/upload');
const router = express.Router();

const SAMPLE_BOOKS = [
  { title: 'Quran mu Rurimi rw\'Ikinyarwanda', title_en: 'Quran in Kinyarwanda', author: 'Sheikh Uqash', category: 'Tauhid', file_type: 'pdf', file_url: null, image_url: null },
  { title: 'Ibyo kwizera n\'ibikorwa by\'Isilamu', title_en: 'Faith and Deeds in Islam', author: 'Dr. Uwimana', category: 'Akhlaq', file_type: 'text', file_url: null, image_url: null },
  { title: 'Amateka y\'Abahanuzi', title_en: 'Stories of the Prophets', author: 'Sheikh Nsengimana', category: 'Sirah', file_type: 'pdf', file_url: null, image_url: null },
  { title: 'Inyigisho z\'Imyemerere', title_en: 'Lessons of Faith', author: 'Sheikh Gahutu', category: 'Tauhid', file_type: 'text', file_url: null, image_url: null },
  { title: 'Uburyo bwo Gukora Swala', title_en: 'How to Perform Salah', author: 'Sheikh Djamidu', category: 'Fiqih', file_type: 'docx', file_url: null, image_url: null },
  { title: 'Kwihangana n\'Ibyiringiro', title_en: 'Patience and Hope', author: 'Sheikh Mutabaruka', category: 'Khutubah', file_type: 'pdf', file_url: null, image_url: null },
];

async function seedSampleBooks() {
  try {
    const [existing] = await pool.query('SELECT COUNT(*) as count FROM books WHERE is_active = 1');
    if (existing[0].count > 0) return;
    let inserted = 0;
    for (const b of SAMPLE_BOOKS) {
      await pool.query(
        'INSERT INTO books (title, title_en, author, category, file_type, file_url, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [b.title, b.title_en, b.author, b.category, b.file_type, b.file_url || '', b.image_url || null]
      );
      inserted++;
    }
    console.log('Seeded ' + inserted + ' sample books');
  } catch (err) {
    console.error('Auto-seed books failed:', err.message);
  }
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM books WHERE is_active = 1 ORDER BY created_at DESC'
    );
    if (rows.length === 0) {
      await seedSampleBooks();
      const [newRows] = await pool.query('SELECT * FROM books WHERE is_active = 1 ORDER BY created_at DESC');
      return res.json(newRows);
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, title_ar, title_en, author, author_ar, author_en, description, category, file_type } = req.body;
    const fileUrl = req.files.file ? `/uploads/documents/${req.files.file[0].filename}` : (req.body.file_url || '');
    const imageUrl = (req.files.image && req.files.image[0]) ? `/uploads/images/${req.files.image[0].filename}`
      : (req.files.cover && req.files.cover[0]) ? `/uploads/images/${req.files.cover[0].filename}`
      : (req.body.image_url || null);
    if (!fileUrl) return res.status(400).json({ message: 'A file upload or URL is required' });

    const [existing] = await pool.query(
      'SELECT id FROM books WHERE title = ? AND is_active = 1 LIMIT 1',
      [title]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Book already exists', existingId: existing[0].id });
    }

    const [result] = await pool.query(
      'INSERT INTO books (title, title_ar, title_en, author, author_ar, author_en, description, file_url, image_url, category, file_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, title_ar || null, title_en || null, author || null, author_ar || null, author_en || null, description || null, fileUrl, imageUrl, category || null, file_type || 'pdf']
    );
    res.status(201).json({ id: result.insertId, message: 'Book created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, title_ar, title_en, author, author_ar, author_en, description, category, file_type } = req.body;
    let sql = 'UPDATE books SET title=?, title_ar=?, title_en=?, author=?, author_ar=?, author_en=?, description=?, category=?, file_type=?';
    const params = [title, title_ar || null, title_en || null, author || null, author_ar || null, author_en || null, description || null, category || null, file_type || 'pdf'];

    if (req.files.file) { sql += ', file_url=?'; params.push(`/uploads/documents/${req.files.file[0].filename}`); }
    const coverFile = (req.files.image && req.files.image[0]) || (req.files.cover && req.files.cover[0]);
    if (coverFile) { sql += ', image_url=?'; params.push(`/uploads/images/${coverFile.filename}`); }

    sql += ' WHERE id=?';
    params.push(req.params.id);

    await pool.query(sql, params);
    res.json({ message: 'Book updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE books SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Book deactivated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
