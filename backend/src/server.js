import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

// Load environment variables
dotenv.config();

// Import routes
import gamesRouter from './routes/games.js';
import usersRouter from './routes/users.js';
import leaderboardRouter from './routes/leaderboard.js';

// Import socket handlers
import { initializeGameSockets } from './sockets/gameRoom.js';
import { initializeChatSockets } from './sockets/chat.js';

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4321',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4321',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Game Night Live API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/games', gamesRouter);
app.use('/api/users', usersRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Initialize socket handlers
initializeGameSockets(io);
initializeChatSockets(io);

// Redis adapter (optional - for scaling)
if (process.env.REDIS_URL) {
  try {
    const { createClient } = await import('redis');
    const { createAdapter } = await import('@socket.io/redis-adapter');

    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    console.log('✅ Redis adapter enabled for Socket.io');
  } catch (error) {
    console.warn('⚠️  Redis connection failed, running in single-server mode');
  }
} else {
  console.log('ℹ️  Running without Redis (single server mode)');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log('🎮 Game Night Live Server');
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io };
