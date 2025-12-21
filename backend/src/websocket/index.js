/**
 * Socket.io Initialization
 * Attach Socket.io to HTTP server and register handlers.
 */

const chatHandler = require('./chatHandler');

function initWebsocket(server, corsOrigin) {
  const { Server } = require('socket.io');

  const io = new Server(server, {
    cors: {
      origin: corsOrigin || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Setup chat handler
    chatHandler(io, socket);
  });

  return io;
}

module.exports = { initWebsocket };
