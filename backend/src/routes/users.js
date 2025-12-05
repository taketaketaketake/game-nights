import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, auth0_id, username, avatar_url, total_points, total_wins, created_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user stats
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        u.total_points,
        u.total_wins,
        COUNT(DISTINCT s.session_id) as games_played,
        AVG(s.points) as avg_score,
        MAX(s.points) as best_score
       FROM users u
       LEFT JOIN scores s ON s.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id, u.total_points, u.total_wins`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Create or update user (from Auth0 callback)
router.post('/', async (req, res) => {
  try {
    const { auth0_id, username, email, avatar_url } = req.body;

    const result = await query(
      `INSERT INTO users (auth0_id, username, email, avatar_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (auth0_id)
       DO UPDATE SET
         username = EXCLUDED.username,
         avatar_url = EXCLUDED.avatar_url
       RETURNING *`,
      [auth0_id, username, email, avatar_url]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

export default router;
