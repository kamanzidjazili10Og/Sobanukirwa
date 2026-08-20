const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, COUNT(t.id) as tracks_count
       FROM categories c
       LEFT JOIN tracks t ON c.id = t.category_id AND t.is_active = TRUE
       WHERE c.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name`
    );

    const seen = {};
    const deduped = [];
    for (const row of rows) {
      const key = (row.slug || '').toLowerCase().trim();
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
    const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Category not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, name_ar, name_en, slug, description, icon, sort_order } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const { rows: existing } = await pool.query(
      'SELECT id FROM categories WHERE (name = $1 OR slug = $2) AND is_active = TRUE LIMIT 1',
      [name, finalSlug]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Category already exists', existingId: existing[0].id });
    }

    const { rows } = await pool.query(
      'INSERT INTO categories (name, name_ar, name_en, slug, description, icon, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name, name_ar || null, name_en || null, finalSlug, description || null, icon || null, sort_order || 0]
    );
    res.status(201).json({ id: rows[0] ? rows[0].id : null, message: 'Category created' });
    req.app.get('bumpVersion')();
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'A category with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, name_ar, name_en, slug, description, icon, sort_order } = req.body;
    const sql = 'UPDATE categories SET name=$1, name_ar=$2, name_en=$3, slug=$4, description=$5, icon=$6, sort_order=$7 WHERE id=$8';
    const params = [name, name_ar || null, name_en || null, slug || null, description || null, icon || null, sort_order || 0, req.params.id];

    await pool.query(sql, params);
    res.json({ message: 'Category updated' });
    req.app.get('bumpVersion')();
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'A category with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE categories SET is_active = FALSE WHERE id = $1', [req.params.id]);
    await pool.query('UPDATE tracks SET category_id = NULL WHERE category_id = $1', [req.params.id]);
    res.json({ message: 'Category deleted' });
    req.app.get('bumpVersion')();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
