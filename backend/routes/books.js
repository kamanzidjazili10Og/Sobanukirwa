const express = require('express');
const pool = require('../config/db');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM books WHERE is_active = TRUE ORDER BY created_at DESC'
    );

    const seen = {};
    const deduped = [];
    for (const row of rows) {
      const key = (row.title || '').toLowerCase().trim();
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
    const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', requireAuth, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, title_ar, title_en, author, author_ar, author_en, description, category, file_type } = req.body;
    const fileUrl = req.files.file ? `/uploads/documents/${req.files.file[0].filename}` : (req.body.file_url || '');
    const imageUrl = (req.files.image && req.files.image[0]) ? `/uploads/images/${req.files.image[0].filename}`
      : (req.files.cover && req.files.cover[0]) ? `/uploads/images/${req.files.cover[0].filename}`
      : (req.body.image_url || null);
    if (!fileUrl) return res.status(400).json({ message: 'A file upload or URL is required' });

    const { rows: existing } = await pool.query(
      'SELECT id FROM books WHERE title = $1 AND is_active = TRUE LIMIT 1',
      [title]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Book already exists', existingId: existing[0].id });
    }

    const { rows } = await pool.query(
      'INSERT INTO books (title, title_ar, title_en, author, author_ar, author_en, description, file_url, image_url, category, file_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
      [title, title_ar || null, title_en || null, author || null, author_ar || null, author_en || null, description || null, fileUrl, imageUrl, category || null, file_type || 'pdf']
    );
    res.status(201).json({ id: rows[0] ? rows[0].id : null, message: 'Book created' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', requireAuth, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, title_ar, title_en, author, author_ar, author_en, description, category, file_type } = req.body;
    let sql = 'UPDATE books SET title=$1, title_ar=$2, title_en=$3, author=$4, author_ar=$5, author_en=$6, description=$7, category=$8, file_type=$9';
    const params = [title, title_ar || null, title_en || null, author || null, author_ar || null, author_en || null, description || null, category || null, file_type || 'pdf'];

    if (req.files.file) { sql += `, file_url=$${params.length + 1}`; params.push(`/uploads/documents/${req.files.file[0].filename}`); }
    const coverFile = (req.files.image && req.files.image[0]) || (req.files.cover && req.files.cover[0]);
    if (coverFile) { sql += `, image_url=$${params.length + 1}`; params.push(`/uploads/images/${coverFile.filename}`); }

    sql += ` WHERE id=$${params.length + 1}`;
    params.push(req.params.id);

    await pool.query(sql, params);
    res.json({ message: 'Book updated' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE books SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Book deactivated' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
