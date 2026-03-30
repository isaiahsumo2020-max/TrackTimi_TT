let ioInstance = null;

function init(server) {
  try {
    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      // Expect client to join an org room after connecting
      socket.on('joinOrg', (orgId) => {
        if (orgId) socket.join(`org:${orgId}`);
      });

      socket.on('leaveOrg', (orgId) => {
        if (orgId) socket.leave(`org:${orgId}`);
      });

      socket.on('disconnect', () => {});
    });

    ioInstance = io;
    console.log('✅ Socket.IO initialized');
    return io;
  } catch (err) {
    console.error('Failed to initialize Socket.IO', err);
    return null;
  }
}

function getIo() {
  if (!ioInstance) throw new Error('Socket.IO not initialized');
  return ioInstance;
}

module.exports = { init, getIo };
