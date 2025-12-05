import express from 'express';
import { query } from '../config/db.js';
import { gameLimiter, strictLimiter } from '../middleware/rateLimiting.js';

const router = express.Router();

// Get all upcoming games
router.get('/', async (req, res) => {
  try {
    const { status = 'scheduled', limit = 20, offset = 0 } = req.query;

    const result = await query(
      `SELECT g.*, u.username as host_username, u.avatar_url as host_avatar,
        COUNT(DISTINCT s.user_id) as participant_count
       FROM games g
       LEFT JOIN users u ON g.host_id = u.id
       LEFT JOIN game_sessions gs ON gs.game_id = g.id
       LEFT JOIN scores s ON s.session_id = gs.id
       WHERE g.status = $1
       GROUP BY g.id, u.username, u.avatar_url
       ORDER BY g.scheduled_time ASC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get game by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT g.*, u.username as host_username, u.avatar_url as host_avatar
       FROM games g
       LEFT JOIN users u ON g.host_id = u.id
       WHERE g.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// Create new game (host only)
router.post('/', strictLimiter, async (req, res) => {
  try {
    const { host_id, title, description, scheduled_time, stream_url, prize_pool } = req.body;

    // TODO: Add authentication middleware to verify host

    const result = await query(
      `INSERT INTO games (host_id, title, description, scheduled_time, stream_url, prize_pool, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')
       RETURNING *`,
      [host_id, title, description, scheduled_time, stream_url, prize_pool || 0]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Update game status (host only)
router.patch('/:id/status', gameLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // TODO: Add authentication middleware to verify host ownership

    const result = await query(
      `UPDATE games SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

export default router;
