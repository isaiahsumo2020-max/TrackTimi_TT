const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./config/db');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

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

// ==================== ROUTES ====================

// 1. Authentication (PUBLIC)
app.use('/api/auth', require('./routes/auth.routes'));

// 2. Protected Org routes (require JWT)
app.use('/api/org', authenticateToken);
app.use('/api/org', require('./routes/org.routes'));

// 3. Attendance (require JWT)
app.use('/api/attendance', authenticateToken);
app.use('/api/attendance', require('./routes/attendance.routes'));

// Other routes...
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/shifts', require('./routes/shift.routes'));
app.use('/api/lookup', require('./routes/lookup.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// ⭐ 4. LANDING PAGE (PUBLIC)
app.use('/api/landing', require('./routes/landing.routes'));

// ⭐ 5. SUPER ADMIN (SEPARATE JWT)
app.use('/api/superadmin', require('./routes/superadmin.routes'));

// ⭐ SUPER ADMIN LOGIN (PUBLIC)
app.use('/api/superadmin/auth', require('./routes/superadmin-auth.routes'));

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
const server = app.listen(PORT, () => {
  console.log(`🚀 TrackTimi API → http://localhost:${PORT}`);
  console.log(`📱 Frontend → http://localhost:5173`);
  console.log(`💾 DB → backend/data/tracktimi.db`);
});

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

module.exports = app;
