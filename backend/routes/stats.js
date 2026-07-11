const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const [[{ total_artists }]] = await pool.query('SELECT COUNT(*) as total_artists FROM artists WHERE is_active = 1');
    const [[{ total_tracks }]] = await pool.query('SELECT COUNT(*) as total_tracks FROM tracks WHERE is_active = 1');
    const [[{ total_videos }]] = await pool.query('SELECT COUNT(*) as total_videos FROM videos WHERE is_active = 1');
    const [[{ total_books }]] = await pool.query('SELECT COUNT(*) as total_books FROM books WHERE is_active = 1');
    const [[{ total_plays }]] = await pool.query('SELECT COALESCE(SUM(plays_count), 0) as total_plays FROM tracks');
    const [[{ total_categories }]] = await pool.query('SELECT COUNT(*) as total_categories FROM categories WHERE is_active = 1');

    const [recentTracks] = await pool.query(
      `SELECT t.title, t.plays_count, t.created_at, a.name as artist_name
       FROM tracks t LEFT JOIN artists a ON t.artist_id = a.id
       WHERE t.is_active = 1 ORDER BY t.created_at DESC LIMIT 5`
    );

    const [topTracks] = await pool.query(
      `SELECT t.title, t.plays_count, a.name as artist_name
       FROM tracks t LEFT JOIN artists a ON t.artist_id = a.id
       WHERE t.is_active = 1 ORDER BY t.plays_count DESC LIMIT 5`
    );

    res.json({
      total_artists, total_tracks, total_videos, total_books, total_plays, total_categories,
      recentTracks, topTracks
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
