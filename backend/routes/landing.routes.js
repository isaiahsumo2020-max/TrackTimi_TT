const express = require('express');
const db = require('../config/db');
const router = express.Router();

// GET /api/landing/stats - Public stats for landing page
router.get('/stats', (req, res) => {
  db.all(`
    SELECT 
      COUNT(DISTINCT Org_ID) as totalOrgs,
      COUNT(DISTINCT User_ID) as totalUsers,
      COUNT(*) as totalCheckinsToday
    FROM (
      SELECT Org_ID, COUNT(*) as userCount FROM User WHERE Is_Active = 1 GROUP BY Org_ID
      UNION ALL
      SELECT Org_ID, COUNT(*) as userCount FROM User WHERE Is_Active = 1
    ) users
    LEFT JOIN Attendance a ON a.Org_ID = users.Org_ID 
    WHERE DATE(a.Check_in_time) = DATE('now')
  `, (err, stats) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    res.json({
      success: true,
      stats: stats[0] || { totalOrgs: 0, totalUsers: 0, totalCheckinsToday: 0 }
    });
  });
});

// GET /api/landing/features - Feature list
router.get('/features', (req, res) => {
  res.json({
    success: true,
    features: [
      {
        icon: '🔒',
        title: 'Device Lockdown',
        description: 'One user = one device. Browser fingerprint + GPS verification.'
      },
      {
        icon: '📍',
        title: 'GPS Geofence',
        description: '500m office radius. Real-time location verification.'
      },
      {
        icon: '⚡',
        title: 'Instant Dashboard',
        description: 'Live attendance rates. Department breakdowns. Export reports.'
      }
    ]
  });
});

module.exports = router;
