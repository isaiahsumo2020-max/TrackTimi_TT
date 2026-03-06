const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = 'tracktimi_secret_2026';

// 1. BASIC AUTH - Verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      required: true
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        expired: err.name === 'TokenExpiredError'
      });
    }
    
    req.user = decoded; // { User_ID, firstName, email, userTypeId }
    next();
  });
};

// 2. ADMIN ONLY (User_Type_ID = 1)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.userTypeId !== 1) {
    return res.status(403).json({ 
      error: 'Admin access required',
      currentRole: req.user.userTypeId || 'unknown'
    });
  }
  
  next();
};

// 3. MANAGER OR ADMIN (User_Type_ID = 1 or 2)
const requireManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (![1, 2].includes(req.user.userTypeId)) {
    return res.status(403).json({ 
      error: 'Manager or Admin access required',
      allowedRoles: [1, 2],
      currentRole: req.user.userTypeId || 'unknown'
    });
  }
  
  next();
};

// 4. STAFF/STUDENT ACCESS (User_Type_ID = 3, 4)
const requireStaffStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (![3, 4].includes(req.user.userTypeId)) {
    return res.status(403).json({ 
      error: 'Staff or Student access required',
      allowedRoles: [3, 4],
      currentRole: req.user.userTypeId || 'unknown'
    });
  }
  
  next();
};

// 5. USER CAN ONLY ACCESS OWN DATA
const requireOwnData = (req, res, next) => {
  const userId = req.user.User_ID;
  const targetId = req.params.id || req.body.userId;
  
  if (parseInt(targetId) !== parseInt(userId)) {
    return res.status(403).json({ 
      error: 'You can only access your own data',
      yourId: userId,
      targetId: targetId
    });
  }
  
  next();
};

// 6. DEPARTMENT MANAGER CHECK (verify user manages dept)
const requireDeptManager = (req, res, next) => {
  const deptId = req.params.deptId || req.body.depId;
  const userId = req.user.User_ID;
  
  db.get(`
    SELECT U.User_Type_ID 
    FROM User U 
    JOIN Department D ON U.Dep_ID = D.Dep_ID 
    WHERE U.User_ID = ? AND D.Dep_ID = ?
  `, [userId, deptId], (err, user) => {
    if (err || !user || user.User_Type_ID !== 2) { // 2 = Manager
      return res.status(403).json({ 
        error: 'Department manager access required' 
      });
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireManager,
  requireStaffStudent,
  requireOwnData,
  requireDeptManager
};
