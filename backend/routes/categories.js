const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT c.*, COUNT(t.id) as total_tracks FROM categories c LEFT JOIN tracks t ON c.id = t.category_id AND t.is_active = 1 WHERE c.is_active = 1 GROUP BY c.id ORDER BY c.sort_order'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, name_ar, name_en, slug, description, icon, sort_order } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'Name and slug are required' });
    const [result] = await pool.query(
      'INSERT INTO categories (name, name_ar, name_en, slug, description, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, name_ar || null, name_en || null, slug, description || null, icon || null, sort_order || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Category created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Slug already exists' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, name_ar, name_en, slug, description, icon, sort_order } = req.body;
    await pool.query(
      'UPDATE categories SET name=?, name_ar=?, name_en=?, slug=?, description=?, icon=?, sort_order=? WHERE id=?',
      [name, name_ar || null, name_en || null, slug, description || null, icon || null, sort_order || 0, req.params.id]
    );
    res.json({ message: 'Category updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Slug already exists' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE categories SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deactivated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
