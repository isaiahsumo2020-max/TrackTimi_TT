const db = require('../config/db');

/**
 * Dashboard WebSocket Event Handlers
 * Emits real-time metrics to connected clients
 */

function initDashboardHandlers(io, socket) {
  // ===== REQUEST HANDLERS =====

  /**
   * Request metrics refresh from client
   */
  socket.on('dashboard:requestMetrics', async (data) => {
    const { type } = data;
    const orgId = socket.handshake.auth.orgId;
    const userId = socket.handshake.auth.userId;

    try {
      switch (type) {
        case 'all':
        case 'orgMetrics':
          if (orgId) {
            emitOrgMetrics(io, orgId);
          }
          break;

        case 'employeeMetrics':
          if (userId) {
            emitEmployeeMetrics(io, userId, orgId);
          }
          break;

        case 'systemMetrics':
          emitSystemMetrics(io);
          break;

        default:
          break;
      }
    } catch (err) {
      console.error('Error handling metrics request:', err);
      socket.emit('dashboard:error', {
        message: 'Failed to fetch metrics',
        timestamp: new Date()
      });
    }
  });

  // ===== DISCONNECT =====
  socket.on('disconnect', () => {
    console.log(`Dashboard client disconnected: ${socket.id}`);
  });
}

/**
 * Emit organization dashboard metrics
 */
function emitOrgMetrics(io, orgId) {
  const queries = {
    // Total active employees
    employees: 'SELECT COUNT(*) as count FROM User WHERE Org_ID = ? AND Is_Active = 1',

    // Employees checked in today
    checkedInToday: `
      SELECT COUNT(DISTINCT u.User_ID) as count 
      FROM User u
      LEFT JOIN Attendance a ON u.User_ID = a.User_ID 
        AND DATE(a.Check_In_Time) = CURDATE()
      WHERE u.Org_ID = ? AND u.Is_Active = 1 AND a.Attendance_ID IS NOT NULL
    `,

    // Attendance rate today
    attendanceRate: `
      SELECT 
        ROUND(COUNT(DISTINCT a.User_ID) / COUNT(DISTINCT u.User_ID) * 100, 2) as rate
      FROM User u
      LEFT JOIN Attendance a ON u.User_ID = a.User_ID 
        AND DATE(a.Check_In_Time) = CURDATE()
      WHERE u.Org_ID = ? AND u.Is_Active = 1
    `,

    // Average hours worked recent days
    avgHoursWorked: `
      SELECT 
        ROUND(AVG(TIMESTAMPDIFF(HOUR, a.Check_In_Time, a.Check_Out_Time)), 2) as hours
      FROM Attendance a
      JOIN User u ON a.User_ID = u.User_ID
      WHERE u.Org_ID = ? AND DATE(a.Check_In_Time) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         AND a.Check_Out_Time IS NOT NULL
    `,

    // Department count
    departments: 'SELECT COUNT(*) as count FROM Department WHERE Org_ID = ?',

    // Active shifts today
    activeShifts: `
      SELECT COUNT(*) as count FROM Shift 
      WHERE Org_ID = ? AND Shift_Date = CURDATE() AND Shift_Status = 'Active'
    `,

    // Pending approvals (leaves, requests, etc.)
    pendingApprovals: `
      SELECT COUNT(*) as count FROM Excuse 
      WHERE Org_ID = ? AND Status = 'Pending'
    `
  };

  const metrics = {
    totalEmployees: 0,
    checkedInToday: 0,
    attendanceRate: 0,
    avgHoursWorked: 0,
    departmentCount: 0,
    activeShifts: 0,
    pendingApprovals: 0,
    updatedAt: new Date().toISOString()
  };

  let completedQueries = 0;

  // Execute all queries
  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, [orgId], (err, row) => {
      if (!err && row) {
        const metricKey = key.charAt(0) + key.slice(1);
        Object.keys(metrics).forEach(k => {
          if (k.toLowerCase() === key.toLowerCase()) {
            metrics[k] = row.count || row.rate || row.hours || 0;
          }
        });
      }

      completedQueries++;

      // Emit when all queries are done
      if (completedQueries === Object.keys(queries).length) {
        io.to(`org:${orgId}`).emit('dashboard:orgMetrics', metrics);
      }
    });
  });
}

/**
 * Broadcast organization metrics periodically (every 30 seconds)
 */
function broadcastOrgMetrics(io, orgId) {
  emitOrgMetrics(io, orgId);
}

/**
 * Emit employee dashboard metrics
 */
function emitEmployeeMetrics(io, userId, orgId) {
  const queries = {
    // Hours worked today
    hoursWorkedToday: `
      SELECT 
        ROUND(TIMESTAMPDIFF(HOUR, MIN(a.Check_In_Time), 
          COALESCE(MAX(a.Check_Out_Time), NOW())), 2) as hours
      FROM Attendance a
      WHERE a.User_ID = ? AND DATE(a.Check_In_Time) = CURDATE()
    `,

    // Current check-in status
    checkedInStatus: `
      SELECT 
        COUNT(*) as count,
        MAX(a.Check_In_Time) as lastCheckIn
      FROM Attendance a
      WHERE a.User_ID = ? AND DATE(a.Check_In_Time) = CURDATE() AND a.Check_Out_Time IS NULL
    `,

    // This week's hours
    weeklyHours: `
      SELECT 
        ROUND(SUM(TIMESTAMPDIFF(HOUR, a.Check_In_Time, a.Check_Out_Time)), 2) as hours
      FROM Attendance a
      WHERE a.User_ID = ? AND a.Check_Out_Time IS NOT NULL
        AND WEEK(a.Check_In_Time) = WEEK(CURDATE())
    `,

    // This month's hours
    monthlyHours: `
      SELECT 
        ROUND(SUM(TIMESTAMPDIFF(HOUR, a.Check_In_Time, a.Check_Out_Time)), 2) as hours
      FROM Attendance a
      WHERE a.User_ID = ? AND a.Check_Out_Time IS NOT NULL
        AND MONTH(a.Check_In_Time) = MONTH(CURDATE())
    `,

    // Attendance rate this month
    attendanceRate: `
      SELECT 
        ROUND(COUNT(DISTINCT DATE(a.Check_In_Time)) / 
          COUNT(DISTINCT DATE(s.Shift_Date)) * 100, 2) as rate
      FROM Shift s
      LEFT JOIN Attendance a ON s.Shift_ID = a.Shift_ID
      WHERE s.User_ID = ? AND MONTH(s.Shift_Date) = MONTH(CURDATE())
    `,

    // On-time rate this month
    onTimeRate: `
      SELECT 
        ROUND(COUNT(CASE WHEN a.Is_Late_Clock_In = 0 THEN 1 END) / 
          COUNT(*) * 100, 2) as rate
      FROM Attendance a
      WHERE a.User_ID = ? AND MONTH(a.Check_In_Time) = MONTH(CURDATE())
    `,

    // Upcoming shift
    upcomingShift: `
      SELECT s.*, st.ShiftType_Name, d.Depart_Name
      FROM Shift s
      LEFT JOIN ShiftType st ON s.ShiftType_ID = st.ShiftType_ID
      LEFT JOIN Department d ON s.Department_ID = d.Department_ID
      WHERE s.User_ID = ? AND s.Shift_Date >= CURDATE()
      ORDER BY s.Shift_Date ASC, s.Shift_Start_Time ASC
      LIMIT 1
    `
  };

  const metrics = {
    hoursWorkedToday: 0,
    checkedIn: false,
    lastCheckInTime: null,
    upcomingShift: null,
    weeklyHours: 0,
    monthlyHours: 0,
    attendanceRate: 0,
    onTimeRate: 0,
    updatedAt: new Date().toISOString()
  };

  let completedQueries = 0;

  // Execute all queries
  Object.entries(queries).forEach(([key, query]) => {
    const isMulti = key === 'upcomingShift';
    const dbMethod = isMulti ? 'get' : 'get';

    db.get(query, [userId, userId, userId, userId, userId, userId, userId].slice(0, query.split('?').length - 1), (err, row) => {
      if (!err && row) {
        switch (key) {
          case 'hoursWorkedToday':
            metrics.hoursWorkedToday = row.hours || 0;
            break;
          case 'checkedInStatus':
            metrics.checkedIn = row.count > 0;
            metrics.lastCheckInTime = row.lastCheckIn || null;
            break;
          case 'weeklyHours':
            metrics.weeklyHours = row.hours || 0;
            break;
          case 'monthlyHours':
            metrics.monthlyHours = row.hours || 0;
            break;
          case 'attendanceRate':
            metrics.attendanceRate = row.rate || 0;
            break;
          case 'onTimeRate':
            metrics.onTimeRate = row.rate || 0;
            break;
          case 'upcomingShift':
            metrics.upcomingShift = row || null;
            break;
        }
      }

      completedQueries++;

      // Emit when all queries are done
      if (completedQueries === Object.keys(queries).length) {
        io.to(`org:${orgId}`).emit('dashboard:employeeMetrics', metrics);
      }
    });
  });
}

/**
 * Emit system-wide metrics (for SuperAdmin)
 */
function emitSystemMetrics(io) {
  const queries = {
    // Total organizations
    organizations: 'SELECT COUNT(*) as count FROM Organization WHERE Is_Active = 1',

    // Total users across all orgs
    users: 'SELECT COUNT(*) as count FROM User WHERE Is_Active = 1',

    // Check-ins today globally
    todayCheckins: `
      SELECT COUNT(DISTINCT User_ID) as count 
      FROM Attendance 
      WHERE DATE(Check_In_Time) = CURDATE()
    `,

    // Active organizations
    activeOrgs: 'SELECT COUNT(*) as count FROM Organization WHERE Is_Active = 1',

    // System load (simulated - can be enhanced with real metrics)
    systemHealth: 'SELECT 100 as health' // Default to 100%
  };

  const metrics = {
    totalOrganizations: 0,
    totalUsers: 0,
    todayCheckins: 0,
    activeOrganizations: 0,
    systemHealth: 100,
    dbLoad: Math.floor(Math.random() * 60) + 20, // Simulated 20-80%
    updatedAt: new Date().toISOString()
  };

  let completedQueries = 0;

  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, [], (err, row) => {
      if (!err && row) {
        switch (key) {
          case 'organizations':
            metrics.totalOrganizations = row.count || 0;
            break;
          case 'users':
            metrics.totalUsers = row.count || 0;
            break;
          case 'todayCheckins':
            metrics.todayCheckins = row.count || 0;
            break;
          case 'activeOrgs':
            metrics.activeOrganizations = row.count || 0;
            break;
          case 'systemHealth':
            metrics.systemHealth = row.health || 100;
            break;
        }
      }

      completedQueries++;

      if (completedQueries === Object.keys(queries).length) {
        io.emit('dashboard:systemMetrics', metrics);
      }
    });
  });
}

/**
 * Broadcast employee attendance update to organization
 */
function broadcastAttendanceUpdate(io, orgId) {
  db.get(`
    SELECT 
      COUNT(DISTINCT User_ID) as checkedInCount,
      ROUND(COUNT(DISTINCT User_ID) / (
        SELECT COUNT(*) FROM User WHERE Org_ID = ? AND Is_Active = 1
      ) * 100, 2) as attendanceRate
    FROM Attendance a
    WHERE User_ID IN (
      SELECT User_ID FROM User WHERE Org_ID = ?
    )
    AND DATE(a.Check_In_Time) = CURDATE()
  `, [orgId, orgId], (err, row) => {
    if (!err && row) {
      io.to(`org:${orgId}`).emit('dashboard:attendanceUpdate', {
        checkedInCount: row.checkedInCount || 0,
        attendanceRate: row.attendanceRate || 0,
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * Broadcast system alert to all clients
 */
function broadcastSystemAlert(io, alert) {
  io.emit('dashboard:systemAlert', {
    type: alert.type || 'system',
    message: alert.message,
    severity: alert.severity || 'warning',
    timestamp: new Date().toISOString()
  });
}

/**
 * Broadcast notification to organization
 */
function broadcastNotification(io, orgId, notification) {
  io.to(`org:${orgId}`).emit('dashboard:notification', {
    message: notification.message,
    severity: notification.severity || 'info',
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  initDashboardHandlers,
  emitOrgMetrics,
  emitEmployeeMetrics,
  emitSystemMetrics,
  broadcastOrgMetrics,
  broadcastAttendanceUpdate,
  broadcastSystemAlert,
  broadcastNotification
};
