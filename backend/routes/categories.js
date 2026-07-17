const express = require('express');
const pool = require('../config/db');
const router = express.Router();

const DEFAULT_CATEGORIES = [
  { name: 'Tauhid', name_ar: 'التوحيد', name_en: 'Tawheed', slug: 'tauhid', sort_order: 1 },
  { name: 'Fiqih', name_ar: 'الفقه', name_en: 'Fiqh', slug: 'fiqih', sort_order: 2 },
  { name: 'Sirah', name_ar: 'السيرة', name_en: 'Seerah', slug: 'sirah', sort_order: 3 },
  { name: 'Khutubah', name_ar: 'الخطب', name_en: 'Khutbah', slug: 'khutubah', sort_order: 4 },
  { name: 'Akhlaq', name_ar: 'الأخلاق', name_en: 'Akhlaq', slug: 'akhlaq', sort_order: 5 },
  { name: 'Adhkar', name_ar: 'الأذكار', name_en: 'Adhkar', slug: 'adhkar', sort_order: 6 },
];

async function seedDefaultCategories() {
  try {
    const [existing] = await pool.query('SELECT COUNT(*) as count FROM categories WHERE is_active = 1');
    if (existing[0].count > 0) return false;
    let inserted = 0;
    for (const c of DEFAULT_CATEGORIES) {
      await pool.query(
        'INSERT INTO categories (name, name_ar, name_en, slug, sort_order) VALUES (?, ?, ?, ?, ?)',
        [c.name, c.name_ar, c.name_en, c.slug, c.sort_order]
      );
      inserted++;
    }
    console.log('Seeded ' + inserted + ' default categories');
    return true;
  } catch (err) {
    console.error('Auto-seed categories failed:', err.message);
    return false;
  }
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(t.id) as tracks_count
       FROM categories c
       LEFT JOIN tracks t ON c.id = t.category_id AND t.is_active = 1
       WHERE c.is_active = 1
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name`
    );

    if (rows.length === 0) {
      const seeded = await seedDefaultCategories();
      if (seeded) {
        const [newRows] = await pool.query(
          `SELECT c.*, COUNT(t.id) as tracks_count
           FROM categories c
           LEFT JOIN tracks t ON c.id = t.category_id AND t.is_active = 1
           WHERE c.is_active = 1
           GROUP BY c.id
           ORDER BY c.sort_order ASC, c.name`
        );
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
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
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

    const [result] = await pool.query(
      'INSERT INTO categories (name, name_ar, name_en, slug, description, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, name_ar || null, name_en || null, finalSlug, description || null, icon || null, sort_order || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Category created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'A category with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, name_ar, name_en, slug, description, icon, sort_order } = req.body;
    let sql = 'UPDATE categories SET name=?, name_ar=?, name_en=?, slug=?, description=?, icon=?, sort_order=?';
    const params = [name, name_ar || null, name_en || null, slug || null, description || null, icon || null, sort_order || 0];

    sql += ' WHERE id=?';
    params.push(req.params.id);

    await pool.query(sql, params);
    res.json({ message: 'Category updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'A category with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE categories SET is_active = 0 WHERE id = ?', [req.params.id]);
    await pool.query('UPDATE tracks SET category_id = NULL WHERE category_id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
