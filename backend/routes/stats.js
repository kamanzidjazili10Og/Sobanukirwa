const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const [artistRows] = await pool.query('SELECT COUNT(*) as total FROM artists WHERE is_active = 1');
    const [trackRows] = await pool.query('SELECT COUNT(*) as total FROM tracks WHERE is_active = 1');
    const [videoRows] = await pool.query('SELECT COUNT(*) as total FROM videos WHERE is_active = 1');
    const [bookRows] = await pool.query('SELECT COUNT(*) as total FROM books WHERE is_active = 1');
    const [playRows] = await pool.query('SELECT COALESCE(SUM(plays_count), 0) as total FROM tracks');
    const [catRows] = await pool.query('SELECT COUNT(*) as total FROM categories WHERE is_active = 1');

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
      total_artists: artistRows[0]?.total || 0,
      total_tracks: trackRows[0]?.total || 0,
      total_videos: videoRows[0]?.total || 0,
      total_books: bookRows[0]?.total || 0,
      total_plays: playRows[0]?.total || 0,
      total_categories: catRows[0]?.total || 0,
      recentTracks: recentTracks || [],
      topTracks: topTracks || [],
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
