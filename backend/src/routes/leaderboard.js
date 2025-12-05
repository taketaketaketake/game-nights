import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get global leaderboard
router.get('/global', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const result = await query(
      `SELECT
        ROW_NUMBER() OVER (ORDER BY total_points DESC) as rank,
        u.id,
        u.username,
        u.avatar_url,
        u.total_points,
        u.total_wins
       FROM users u
       ORDER BY u.total_points DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get leaderboard for specific game session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await query(
      `SELECT
        s.rank,
        s.points,
        u.id as user_id,
        u.username,
        u.avatar_url
       FROM scores s
       JOIN users u ON s.user_id = u.id
       WHERE s.session_id = $1
       ORDER BY s.rank ASC`,
      [sessionId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching session leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
