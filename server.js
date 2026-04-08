const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./config/db');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// EARLY DEBUG: Log ALL requests
app.use((req, res, next) => {
  console.log('【DEBUG】 EVERY REQUEST:', req.method, req.path, req.url);
  next();
});

// Security headers
app.use(helmet());

// Apply general rate limits to API routes
app.use('/api', generalLimiter);

// Domain detection middleware
const { detectOrganization } = require('./middleware/domain.middleware');
app.use(detectOrganization);

// JWT_SECRET (keep consistent with authentication routes defaults)
const JWT_SECRET = process.env.JWT_SECRET || 'tracktimi_secret_2026';

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user; // { userId, orgId, orgSlug, role }
    next();
  });
};

// Health check
app.get('/', (req, res) => {
  res.json({
    message: '🚀 TrackTimi API v1.0 - LIVE ✅',
    status: 'production-ready',
    endpoints: {
      auth: '/api/auth/register-org, /api/auth/login',
      org: '/api/org/users, /api/org/departments',
      attendance: '/api/attendance/checkin'
    }
  });
});

// TEST ROUTE: Direct password reset test
app.post('/api/test-reset', (req, res) => {
  console.log('✅ TEST ROUTE HIT - No middleware blocked us!');
  res.json({ success: true, message: 'Test route works - no auth middleware'});
});

// ==================== ROUTES ====================

// DEBUG: Log all requests to /api/auth
app.use('/api/auth', (req, res, next) => {
  console.log('🔍 /api/auth request:', req.method, req.path, 'Authorization:', req.headers.authorization ? 'YES' : 'NO');
  next();
});

// 1. Authentication (PUBLIC)
app.use('/api/auth', require('./routes/auth.routes'));

// 2. Protected Org routes (require JWT)
app.use('/api/org', authenticateToken);
// Mount org-scoped routes: ensure specific `/org/users` routes load before the generic org routes
app.use('/api/org', require('./routes/org.users.routes'));
app.use('/api/org', require('./routes/org.routes'));

// 3. Attendance (require JWT)
app.use('/api/attendance', authenticateToken);
// server.js
app.use('/api/attendance', require('./routes/attendance.routes'));

// 4. Excuses/Leave Requests (require JWT)
app.use('/api/excuses', authenticateToken);
app.use('/api/excuses', require('./routes/excuse.routes'));

// 5. Notifications (require JWT)
app.use('/api/notifications', authenticateToken);
app.use('/api/notifications', require('./routes/notification.routes'));

// 6. Feedback (require JWT)
app.use('/api/feedback', authenticateToken);
app.use('/api/feedback', require('./routes/feedback.routes'));

// Other routes...
// Keep legacy /api/users but prefer admin routes under /api/org/users
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/shifts', require('./routes/shift.routes'));
app.use('/api/lookup', require('./routes/lookup.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// ⭐ 4. LANDING PAGE (PUBLIC)
app.use('/api/landing', require('./routes/landing.routes'));

// ⭐ 5. SUPER ADMIN LOGIN (PUBLIC) - Must be BEFORE /api/superadmin to match first
/// server.js

// 1. The public login route for you
app.use('/api/superadmin/auth', require('./routes/superadmin-auth.routes'));

// 2. The protected dashboard route (where the data is)
app.use('/api/superadmin', require('./routes/superadmin.routes'));
// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    available: ['/api/auth/register-org', '/api/auth/login']
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 4000;

// Wait for database initialization to complete before starting server
global.dbReadyCallback = () => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 TrackTimi API → http://localhost:${PORT}`);
    console.log(`📱 Frontend → http://localhost:5173`);
    console.log(`💾 DB → backend/data/tracktimi.db`);
  });

  // Initialize Socket.IO for real-time updates
  try {
    const socketHelper = require('./utils/socket');
    socketHelper.init(server);
  } catch (err) {
    console.error('Socket.IO init error:', err);
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Shutting down gracefully...');
    server.close(() => {
      db.close((err) => {
        if (err) console.error('DB close error:', err);
        console.log('✅ DB closed');
        process.exit(0);
      });
    });
  });
};

module.exports = app;
