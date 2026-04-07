let ioInstance = null;

function init(server) {
  try {
    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log(`📡 Socket connected: ${socket.id}`);

      /**
       * User Login & Channel Subscription
       * Joins appropriate role-based and org-based channels
       */
      socket.on('userLogin', (userData) => {
        const { userId, orgId, userTypeId, role } = userData;
        
        if (!userId) return;

        // Store user data on socket
        socket.userData = { userId, orgId, userTypeId, role };

        // Personal channel (all notifications for this user)
        socket.join(`user:${userId}`);
        console.log(`✅ User ${userId} joined personal channel: user:${userId}`);

        // Role-based channels
        if (userTypeId === 1) {
          // SuperAdmin
          socket.join('superadmin');
          console.log(`✅ SuperAdmin ${userId} joined: superadmin`);
        } else if (role === 'admin' && orgId) {
          // Organization Admin
          socket.join(`org_admin:${orgId}`);
          console.log(`✅ Org Admin ${userId} joined: org_admin:${orgId}`);

          // Also join org-wide channel for announcements
          socket.join(`org:${orgId}`);
        } else if (orgId) {
          // Regular Employee
          socket.join(`employee:${orgId}`);
          console.log(`✅ Employee ${userId} joined: employee:${orgId}`);

          // Also join org-wide channel for announcements
          socket.join(`org:${orgId}`);
        }
      });

      // Manual org joining (for announcements, etc)
      socket.on('joinOrg', (orgId) => {
        if (orgId && socket.userData?.orgId === orgId) {
          socket.join(`org:${orgId}`);
          console.log(`✅ User ${socket.userData?.userId} joined org: org:${orgId}`);
        }
      });

      socket.on('leaveOrg', (orgId) => {
        if (orgId) {
          socket.leave(`org:${orgId}`);
          console.log(`❌ User ${socket.userData?.userId} left org: org:${orgId}`);
        }
      });

      // Notification acknowledgment
      socket.on('notification:read', (notificationId) => {
        console.log(`✅ Notification ${notificationId} marked as read by user ${socket.userData?.userId}`);
      });

      // Dashboard handlers if available
      try {
        const dashboardEmitter = require('./dashboardEmitter');
        dashboardEmitter.initDashboardHandlers(io, socket);
      } catch (e) {
        // Dashboard emitter not available, skip
      }

      socket.on('disconnect', () => {
        console.log(`📴 Socket disconnected: ${socket.id} (user: ${socket.userData?.userId})`);
      });
    });

    ioInstance = io;
    console.log('✅ Socket.IO initialized with role-based notifications');
    return io;
  } catch (err) {
    console.error('❌ Failed to initialize Socket.IO', err);
    return null;
  }
}

function getIo() {
  if (!ioInstance) throw new Error('Socket.IO not initialized');
  return ioInstance;
}

/**
 * Broadcast to SuperAdmin channel
 */
function notifySuperAdmin(notificationData) {
  const io = getIo();
  io.to('superadmin').emit('notification:new', notificationData);
  console.log(`📡 Broadcast to superadmin:`, notificationData.title);
}

/**
 * Broadcast to Organization Admin channel
 */
function notifyOrgAdmin(orgId, notificationData) {
  const io = getIo();
  io.to(`org_admin:${orgId}`).emit('notification:new', notificationData);
  console.log(`📡 Broadcast to org_admin:${orgId}:`, notificationData.title);
}

/**
 * Broadcast to Employee channel
 */
function notifyEmployee(orgId, notificationData) {
  const io = getIo();
  io.to(`employee:${orgId}`).emit('notification:new', notificationData);
  console.log(`📡 Broadcast to employee:${orgId}:`, notificationData.title);
}

/**
 * Broadcast to Organization-wide channel (announcements, etc)
 */
function notifyOrg(orgId, notificationData) {
  const io = getIo();
  io.to(`org:${orgId}`).emit('notification:new', notificationData);
  console.log(`📡 Broadcast to org:${orgId}:`, notificationData.title);
}

/**
 * Broadcast to specific user
 */
function notifyUser(userId, notificationData) {
  const io = getIo();
  io.to(`user:${userId}`).emit('notification:new', notificationData);
  console.log(`📡 Broadcast to user:${userId}:`, notificationData.title);
}

module.exports = {
  init,
  getIo,
  notifySuperAdmin,
  notifyOrgAdmin,
  notifyEmployee,
  notifyOrg,
  notifyUser
};
