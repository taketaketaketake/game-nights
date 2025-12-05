export function initializeChatSockets(io) {
  io.on('connection', (socket) => {

    // Join chat room
    socket.on('join-chat', (sessionId) => {
      socket.join(`chat-${sessionId}`);
      console.log(`Socket ${socket.id} joined chat room ${sessionId}`);
    });

    // Send chat message
    socket.on('chat-message', (data) => {
      const { sessionId, message, username, userId } = data;

      // Broadcast to all in room
      io.to(`chat-${sessionId}`).emit('chat-message', {
        id: Date.now(),
        userId,
        username,
        message,
        timestamp: new Date().toISOString()
      });
    });

    // Leave chat room
    socket.on('leave-chat', (sessionId) => {
      socket.leave(`chat-${sessionId}`);
    });
  });
}
