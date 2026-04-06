let ioInstance = null;

function init(server) {
  try {
    const { Server } = require('socket.io');
    const dashboardEmitter = require('./dashboardEmitter');
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log(`📡 Socket connected: ${socket.id}`);

      // Authenticate user from token
      const token = socket.handshake.auth.token;
      
      // Handle user login to join personal room
      socket.on('userLogin', (userData) => {
        const { userId, orgId } = userData;
        if (userId && orgId) {
          socket.join(`user:${userId}`);
          socket.join(`org:${orgId}`);
          socket.userData = { userId, orgId };
          console.log(`✅ User ${userId} joined personal & org rooms`);
        }
      });

      // Expect client to join an org room after connecting
      socket.on('joinOrg', (orgId) => {
        if (orgId) {
          socket.join(`org:${orgId}`);
          console.log(`✅ Client joined org: ${orgId}`);
        }
      });

      socket.on('leaveOrg', (orgId) => {
        if (orgId) {
          socket.leave(`org:${orgId}`);
          console.log(`❌ Client left org: ${orgId}`);
        }
      });

      // Handle notification acknowledgment
      socket.on('notification:read', (notificationId) => {
        console.log(`✅ Notification ${notificationId} marked as read by user ${socket.userData?.userId}`);
      });

      // Initialize dashboard handlers
      dashboardEmitter.initDashboardHandlers(io, socket);

      socket.on('disconnect', () => {
        console.log(`📴 Socket disconnected: ${socket.id}`);
      });
    });

    // Set up periodic metric broadcasts (every 30 seconds per org)
    setInterval(() => {
      // This can be enhanced to track active orgs
      // For now, metrics will be pulled on demand
    }, 30000);

    ioInstance = io;
    console.log('✅ Socket.IO initialized with notification support');
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
