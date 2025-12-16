require('dotenv').config();

const { app, connectDB } = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join user-specific room for real-time updates
  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
  });

  // Join chat session room
  socket.on('join-chat-session', (sessionId) => {
    socket.join(`chat_${sessionId}`);
  });

  // Community chat rooms
  socket.on('join-community', (channel) => {
    socket.join(`community_${channel}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Store io instance for use in routes/controllers
app.set('io', io);

// Start server
const startServer = async () => {
  let dbConnected = false;

  try {
    // Try to connect to database but don't fail if it's not available
    try {
      await connectDB();
      dbConnected = true;
    } catch (dbError) {
      console.warn('⚠️  Database connection failed, continuing without DB for development:', dbError.message);
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 Database: ${dbConnected ? 'Connected' : 'Not Connected'}`);
      console.log(`💬 Socket.io: Initialized`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

startServer();
