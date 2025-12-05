import { query } from '../config/db.js';

const activeSessions = new Map(); // sessionId -> game state

export function initializeGameSockets(io) {
  io.on('connection', (socket) => {

    // Join a game session
    socket.on('join-game', async (sessionId) => {
      try {
        const userId = socket.handshake.auth.userId;

        if (!userId) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        socket.join(`game-${sessionId}`);

        // Initialize or update session state
        if (!activeSessions.has(sessionId)) {
          activeSessions.set(sessionId, {
            players: new Set(),
            currentQuestion: null,
            scores: new Map()
          });
        }

        const session = activeSessions.get(sessionId);
        session.players.add(userId);
        socket.userId = userId;
        socket.sessionId = sessionId;

        // Create score entry if not exists
        await query(
          `INSERT INTO scores (session_id, user_id, points)
           VALUES ($1, $2, 0)
           ON CONFLICT (session_id, user_id) DO NOTHING`,
          [sessionId, userId]
        );

        console.log(`User ${userId} joined game session ${sessionId}`);

        // Notify others
        io.to(`game-${sessionId}`).emit('player-joined', {
          userId,
          totalPlayers: session.players.size
        });

        // Send current leaderboard
        await broadcastLeaderboard(io, sessionId);

      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    // Submit answer
    socket.on('submit-answer', async (data) => {
      try {
        const { questionId, answer, timeElapsed } = data;
        const userId = socket.userId;
        const sessionId = socket.sessionId;

        if (!userId || !sessionId) {
          socket.emit('error', { message: 'Not in a game session' });
          return;
        }

        // Calculate points based on correctness and speed
        const pointsEarned = await calculatePoints(questionId, answer, timeElapsed);

        // Update score in database
        await query(
          `UPDATE scores
           SET points = points + $1
           WHERE session_id = $2 AND user_id = $3`,
          [pointsEarned, sessionId, userId]
        );

        // Update user's total points
        await query(
          `UPDATE users
           SET total_points = total_points + $1
           WHERE id = $2`,
          [pointsEarned, userId]
        );

        // Notify player
        socket.emit('score-update', pointsEarned);

        // Broadcast updated leaderboard
        await broadcastLeaderboard(io, sessionId);

      } catch (error) {
        console.error('Error submitting answer:', error);
        socket.emit('error', { message: 'Failed to submit answer' });
      }
    });

    // Leave game
    socket.on('leave-game', () => {
      if (socket.sessionId) {
        const session = activeSessions.get(socket.sessionId);
        if (session) {
          session.players.delete(socket.userId);
          io.to(`game-${socket.sessionId}`).emit('player-left', {
            userId: socket.userId,
            totalPlayers: session.players.size
          });
        }
      }
    });

    socket.on('disconnect', () => {
      if (socket.sessionId) {
        const session = activeSessions.get(socket.sessionId);
        if (session) {
          session.players.delete(socket.userId);
        }
      }
    });
  });
}

// Helper function to broadcast question to all players in a session
export async function broadcastQuestion(io, sessionId, question) {
  io.to(`game-${sessionId}`).emit('question', {
    id: question.id,
    text: question.question_text,
    options: [
      question.correct_answer,
      ...JSON.parse(question.wrong_answers)
    ].sort(() => Math.random() - 0.5), // Shuffle options
    timeLimit: question.time_limit
  });
}

// Helper function to broadcast leaderboard
async function broadcastLeaderboard(io, sessionId) {
  try {
    const result = await query(
      `SELECT
        ROW_NUMBER() OVER (ORDER BY s.points DESC) as rank,
        s.user_id,
        u.username,
        u.avatar_url,
        s.points as score
       FROM scores s
       JOIN users u ON s.user_id = u.id
       WHERE s.session_id = $1
       ORDER BY s.points DESC
       LIMIT 10`,
      [sessionId]
    );

    io.to(`game-${sessionId}`).emit('leaderboard-update', result.rows);
  } catch (error) {
    console.error('Error broadcasting leaderboard:', error);
  }
}

// Helper function to calculate points
async function calculatePoints(questionId, answer, timeElapsed) {
  try {
    const result = await query(
      `SELECT correct_answer, points, time_limit FROM questions WHERE id = $1`,
      [questionId]
    );

    if (result.rows.length === 0) return 0;

    const question = result.rows[0];

    // Check if answer is correct
    if (answer !== question.correct_answer) return 0;

    // Award points with time bonus
    const basePoints = question.points;
    const timeBonus = Math.max(0, 1 - (timeElapsed / question.time_limit));
    const totalPoints = Math.round(basePoints * (0.5 + 0.5 * timeBonus));

    return totalPoints;
  } catch (error) {
    console.error('Error calculating points:', error);
    return 0;
  }
}

export { activeSessions };
