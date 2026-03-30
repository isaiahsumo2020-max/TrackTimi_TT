const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'tracktimi_secret_2026';

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Session expired. Please log in again.' });
    
    req.user = {
      userId: decoded.userId || decoded.User_ID,
      orgId: decoded.orgId || decoded.Org_ID,
      userTypeId: decoded.userTypeId || decoded.User_Type_ID,
      role: decoded.role
    };
    next();
  });
};

exports.requireAdmin = (req, res, next) => {
  // Allow Admin (1) and Manager (2)
  if (req.user.userTypeId === 1 || req.user.userTypeId === 2 || req.user.role === 'Admin') {
    return next();
  }
  return res.status(403).json({ error: 'Administrative privileges required' });
};