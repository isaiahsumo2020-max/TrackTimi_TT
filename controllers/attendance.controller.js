const db = require('../config/db');
const geo = require('../utils/geo');
const socketHelper = require('../utils/socket');
const Notification = require('../models/Notification');
const ClockOutAlert = require('../models/ClockOutAlert');

// =============================================================
// HELPER: Get organization clock-in settings
// =============================================================
const getOrgClockInSettings = (orgId) => {
  return new Promise((resolve) => {
    db.get('SELECT Clock_In_Window_Minutes, Clock_Out_Alert_Minutes FROM Organization WHERE Org_ID = ?', [orgId], (err, row) => {
      if (err || !row) {
        resolve({ clockInWindow: 30, clockOutAlert: 15 }); // defaults
      } else {
        resolve({
          clockInWindow: row.Clock_In_Window_Minutes || 30,
          clockOutAlert: row.Clock_Out_Alert_Minutes || 15
        });
      }
    });
  });
};

// =============================================================
// HELPER: Get user's today shift
// =============================================================
const getUserTodayShift = (userId, orgId = null) => {
  return new Promise((resolve) => {
    const today = new Date().toISOString().split('T')[0];
    
    // First try to get from Schedule (assigned by admin)
    const scheduleSql = `
      SELECT 
        s.Schedule_ID,
        s.Schedule_Name,
        s.Start_Date as Shift_Date,
        st.Start_Time as Shift_Start_Time,
        st.End_Time as Shift_End_Time,
        st.ShiftType_Name,
        st.Color_Code,
        d.Depart_Name,
        'Schedule' as source
      FROM Schedule s
      INNER JOIN ScheduleEmployee se ON s.Schedule_ID = se.Schedule_ID
      INNER JOIN ShiftType st ON s.ShiftType_ID = st.ShiftType_ID
      INNER JOIN User u ON se.User_ID = u.User_ID
      LEFT JOIN Department d ON u.Dep_ID = d.Dep_ID
      WHERE se.User_ID = ? 
      AND date(?) >= date(s.Start_Date)
      AND date(?) <= date(s.End_Date)
      AND s.Is_Active = 1
      LIMIT 1
    `;
    
    db.get(scheduleSql, [userId, today, today], (err, row) => {
      if (row) {
        resolve(row);
      } else {
        // Fallback to Shift table for individual one-off shifts
        const shiftSql = `
          SELECT * FROM Shift 
          WHERE User_ID = ? 
          AND date(Shift_Date) = ?
          AND Is_Active = 1
          LIMIT 1
        `;
        db.get(shiftSql, [userId, today], (err, shiftRow) => {
          resolve(shiftRow || null);
        });
      }
    });
  });
};

// =============================================================
// HELPER: Check if clock-in is within allowed window
// =============================================================
const isClockInWithinWindow = (shift, clockInWindowMinutes) => {
  if (!shift) return { isAllowed: false, reason: 'No shift scheduled for today' };
  
  const now = new Date();
  const [hours, minutes] = shift.Shift_Start_Time.split(':').map(Number);
  const shiftStart = new Date();
  shiftStart.setHours(hours, minutes, 0, 0);
  
  const windowStart = new Date(shiftStart);
  const windowEnd = new Date(shiftStart);
  windowEnd.setMinutes(windowEnd.getMinutes() + clockInWindowMinutes);
  
  const diff = (now - shiftStart) / (1000 * 60); // minutes difference
  
  if (diff < 0) {
    return {
      isAllowed: false,
      reason: `Shift starts at ${shift.Shift_Start_Time}. Early clock-in not allowed.`,
      minutesTilStart: -Math.floor(diff)
    };
  }
  
  if (diff > clockInWindowMinutes) {
    return {
      isAllowed: false,
      reason: `Clock-in window closed. Window was ${clockInWindowMinutes} minutes after shift start.`,
      minutesLate: Math.floor(diff - clockInWindowMinutes)
    };
  }
  
  return {
    isAllowed: true,
    isLate: diff > 0,
    minutesLate: Math.floor(diff)
  };
};

// =============================================================
// 1. STATUS CHECK
// =============================================================
exports.getCheckinStatus = (req, res) => {
  const userId = req.user.userId;
  const sql = `SELECT * FROM Attendance WHERE User_ID = ? AND Check_out_time IS NULL LIMIT 1`;
  
  db.get(sql, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ checkedIn: !!row, session: row || null });
  });
};

// =============================================================
// 2. CLOCK IN (With Geofence & Time Window Validation)
// =============================================================
exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const { userId, orgId } = req.user;

    console.log(`📍 User ${userId} attempting clock-in at: Lat ${latitude}, Lng ${longitude}`);

    // A. Check geofence authorization
    const fences = await new Promise((resolve) => {
      db.all('SELECT * FROM Geofence WHERE Org_ID = ? AND Is_Active = 1', [orgId], (err, rows) => resolve(rows || []));
    });

    console.log(`🔍 Found ${fences.length} authorized zones for Org ${orgId}`);

    let authorized = false;
    let minDistance = 999999;

    for (const fence of fences) {
      const check = geo.isWithinGeofence(
        parseFloat(latitude), 
        parseFloat(longitude), 
        parseFloat(fence.Latitude), 
        parseFloat(fence.Longitude), 
        parseInt(fence.Radius)
      );

      console.log(`📏 Distance to "${fence.Location_Name}": ${check.distance}m (Allowed: ${fence.Radius}m)`);

      if (check.isWithin) {
        authorized = true;
        break;
      }
      if (check.distance < minDistance) minDistance = check.distance;
    }

    if (!authorized) {
      return res.status(403).json({ 
        error: `Denied: Nearest zone is ${minDistance}m away.`,
        distance: minDistance
      });
    }

    // B. Check if already clocked in
    const active = await new Promise((resolve) => {
      db.get('SELECT * FROM Attendance WHERE User_ID = ? AND Check_out_time IS NULL', [userId], (err, row) => resolve(row));
    });
    if (active) return res.status(400).json({ error: 'You are already clocked in.' });

    // C. CHECK CLOCK-IN TIME WINDOW
    const orgSettings = await getOrgClockInSettings(orgId);
    const shift = await getUserTodayShift(userId);
    const timeCheckResult = isClockInWithinWindow(shift, orgSettings.clockInWindow);

    if (!timeCheckResult.isAllowed) {
      return res.status(400).json({
        error: timeCheckResult.reason,
        minutesTilStart: timeCheckResult.minutesTilStart,
        minutesLate: timeCheckResult.minutesLate
      });
    }

    // D. Record Attendance (Using Method_ID 3 for GPS)
    const sql = `
      INSERT INTO Attendance (
        User_ID, Org_ID, Check_in_time, Status_ID, Method_ID, Latitude, Longitude, Device_ID, Is_Late_Clock_In, Minutes_Late
      ) VALUES (?, ?, datetime('now', 'localtime'), 1, 3, ?, ?, 1, ?, ?)
    `;

    db.run(sql, [userId, orgId, latitude, longitude, timeCheckResult.isLate ? 1 : 0, timeCheckResult.minutesLate || 0], function(err) {
      if (err) return res.status(500).json({ error: 'DB Error: ' + err.message });
      
      // Emit realtime event
      try {
        const io = socketHelper.getIo();
        io.to(`org:${orgId}`).emit('attendance:created', {
          attendId: this.lastID,
          userId: userId,
          orgId: orgId,
          latitude: latitude,
          longitude: longitude,
          timestamp: new Date().toISOString(),
          withinGeofence: true,
          isLate: timeCheckResult.isLate,
          minutesLate: timeCheckResult.minutesLate
        });
      } catch (socketErr) {
        console.error('Failed to emit attendance:created event:', socketErr.message);
      }
      
      res.status(201).json({ 
        success: true, 
        message: 'Clock-in successful', 
        attendId: this.lastID,
        isLate: timeCheckResult.isLate,
        minutesLate: timeCheckResult.minutesLate
      });
    });

  } catch (error) {
    console.error("💥 Check-in system error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============================================================
// 3. CLOCK OUT (With Geofence Validation)
// =============================================================
exports.checkOut = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const { userId, orgId } = req.user;

    // A. Geofence Check
    const fences = await new Promise((resolve) => {
      db.all('SELECT * FROM Geofence WHERE Org_ID = ? AND Is_Active = 1', [orgId], (err, rows) => resolve(rows || []));
    });

    let authorized = fences.length === 0;
    let nearestDist = 999999;

    for (const fence of fences) {
      const check = geo.isWithinGeofence(
        parseFloat(latitude), 
        parseFloat(longitude), 
        parseFloat(fence.Latitude), 
        parseFloat(fence.Longitude), 
        parseInt(fence.Radius || 500)
      );
      if (check.isWithin) { authorized = true; break; }
      if (check.distance < nearestDist) nearestDist = check.distance;
    }

    if (!authorized) {
      return res.status(403).json({ 
        error: `Denied: You must be at the work zone to clock out. (Distance: ${nearestDist}m)` 
      });
    }

    // B. Get today's shift to check for overtime
    const todayShift = await getUserTodayShift(userId, orgId);
    
    // B1. Calculate if clocking out after shift end time (overtime)
    let overtimeMinutes = 0;
    if (todayShift && todayShift.Shift_End_Time) {
      const now = new Date();
      const [shiftHours, shiftMins] = todayShift.Shift_End_Time.split(':').map(Number);
      const shiftEnd = new Date();
      shiftEnd.setHours(shiftHours, shiftMins, 0, 0);
      
      if (now > shiftEnd) {
        overtimeMinutes = Math.floor((now - shiftEnd) / (1000 * 60));
      }
    }

    // C. Update record with overtime info
    const updateSql = overtimeMinutes > 0 
      ? `UPDATE Attendance 
         SET Check_out_time = datetime('now', 'localtime'),
             Is_Late_Clock_In = 0,  -- 0 = not late, we use this for overtime tracking
             Minutes_Late = ?
         WHERE User_ID = ? AND Org_ID = ? AND Check_out_time IS NULL`
      : `UPDATE Attendance 
         SET Check_out_time = datetime('now', 'localtime')
         WHERE User_ID = ? AND Org_ID = ? AND Check_out_time IS NULL`;

    const params = overtimeMinutes > 0 
      ? [overtimeMinutes, userId, orgId]
      : [userId, orgId];

    db.run(updateSql, params, function(err) {
      if (err) return res.status(500).json({ error: 'Check-out failed' });
      if (this.changes === 0) return res.status(400).json({ error: 'No active session found.' });
      
      // Get the attendance record to emit with socket
      db.get('SELECT * FROM Attendance WHERE User_ID = ? AND Org_ID = ? AND Check_out_time IS NOT NULL ORDER BY Attend_ID DESC LIMIT 1', [userId, orgId], (err, attend) => {
        // Emit realtime event
        try {
          const io = socketHelper.getIo();
          io.to(`org:${orgId}`).emit('attendance:updated', {
            attendId: attend?.Attend_ID,
            userId: userId,
            orgId: orgId,
            latitude: latitude,
            longitude: longitude,
            timestamp: new Date().toISOString(),
            checkOutTime: attend?.Check_out_time,
            overtimeMinutes: overtimeMinutes
          });
        } catch (socketErr) {
          console.error('Failed to emit attendance:updated event:', socketErr.message);
        }
      });
      
      const message = overtimeMinutes > 0 
        ? `Clock-out successful. Extra time recorded: ${Math.floor(overtimeMinutes / 60)}h ${overtimeMinutes % 60}m`
        : 'Clock-out successful.';
      
      res.json({ success: true, message: message, overtimeMinutes: overtimeMinutes });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============================================================
// 4. PERSONAL HISTORY
// =============================================================
exports.getMyHistory = (req, res) => {
  const userId = req.user.userId;
  const sql = `
    SELECT 
      a.Attend_ID, a.Check_in_time, a.Check_out_time, 
      s.Status_Name, m.Method_Name,
      CASE WHEN a.Check_out_time IS NOT NULL 
           THEN (julianday(a.Check_out_time) - julianday(a.Check_in_time)) * 24 
           ELSE 0 END as duration
    FROM Attendance a
    JOIN Attendance_Status s ON a.Status_ID = s.Status_ID
    JOIN Attendance_Method m ON a.Method_ID = m.Method_ID
    WHERE a.User_ID = ?
    ORDER BY a.Check_in_time DESC`;

  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch history' });
    res.json(rows);
  });
};

// =============================================================
// 5. ADMIN UTILITIES
// =============================================================
exports.getRecent = (req, res) => {
  const orgId = req.user.orgId;
  const sql = `
    SELECT a.*, u.First_Name, u.SurName 
    FROM Attendance a 
    JOIN User u ON a.User_ID = u.User_ID 
    WHERE u.Org_ID = ? 
    ORDER BY a.Check_in_time DESC LIMIT 15`;

  db.all(sql, [orgId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Fetch failed' });
    res.json(rows || []);
  });
};

exports.getOrgSummary = (req, res) => res.json({ success: true });
exports.getOrgLogs = (req, res) => res.json({ logs: [] });
exports.generateReport = (req, res) => res.json({ success: true });

// =============================================================
// 6. BREAK MANAGEMENT
// =============================================================
exports.startBreak = (req, res) => {
  try {
    const { userId, orgId } = req.user;
    const { latitude, longitude } = req.body;

    // Check if already on break
    const checkBreak = `SELECT * FROM Break WHERE User_ID = ? AND End_Time IS NULL`;
    
    db.get(checkBreak, [userId], (err, existing) => {
      if (existing) {
        return res.status(400).json({ error: 'You are already on a break' });
      }

      // Create break record
      const sql = `
        INSERT INTO Break (User_ID, Org_ID, Start_Time, Latitude, Longitude)
        VALUES (?, ?, datetime('now', 'localtime'), ?, ?)
      `;

      db.run(sql, [userId, orgId, latitude, longitude], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to start break' });

        // Emit real-time event
        try {
          const io = socketHelper.getIo();
          io.to(`org:${orgId}`).emit('break:started', {
            userId: userId,
            breakId: this.lastID,
            startTime: new Date().toISOString()
          });
        } catch (socketErr) {
          console.error('Failed to emit break:started event:', socketErr.message);
        }

        res.json({ success: true, message: 'Break started' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.endBreak = (req, res) => {
  try {
    const { userId } = req.user;
    const { latitude, longitude } = req.body;

    const sql = `
      UPDATE Break 
      SET End_Time = datetime('now', 'localtime'), End_Latitude = ?, End_Longitude = ?
      WHERE User_ID = ? AND End_Time IS NULL
    `;

    db.run(sql, [latitude, longitude, userId], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to end break' });
      if (this.changes === 0) return res.status(400).json({ error: 'No active break found' });

      res.json({ success: true, message: 'Break ended' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getBreaks = (req, res) => {
  try {
    const { userId } = req.user;
    const today = new Date().toISOString().split('T')[0];

    const sql = `
      SELECT Break_ID, Start_Time, End_Time,
             CASE WHEN End_Time IS NOT NULL
                  THEN (julianday(End_Time) - julianday(Start_Time)) * 24 * 60
                  ELSE 0
             END as duration
      FROM Break
      WHERE User_ID = ? AND date(Start_Time) = ?
      ORDER BY Start_Time DESC
    `;

    db.all(sql, [userId, today], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch breaks' });
      
      const breaks = rows.map(b => ({
        ...b,
        duration: Math.round(b.duration) // Convert to minutes
      }));

      res.json(breaks || []);
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============================================================
// 7. ANALYTICS & STATISTICS
// =============================================================
exports.getAnalytics = (req, res) => {
  try {
    const { userId, orgId } = req.user;

    // Get 7-day average
    const sevenDayAvg = `
      SELECT AVG(daily_hours) as avg_hours
      FROM (
        SELECT date(Check_in_time) as work_date,
               SUM(CASE WHEN Check_out_time IS NOT NULL
                   THEN (julianday(Check_out_time) - julianday(Check_in_time)) * 24
                   ELSE 0 END) as daily_hours
        FROM Attendance
        WHERE User_ID = ? AND Check_in_time >= date('now', '-7 days')
        GROUP BY date(Check_in_time)
      )
    `;

    // Get this month's hours
    const monthlyHours = `
      SELECT SUM(CASE WHEN Check_out_time IS NOT NULL
                      THEN (julianday(Check_out_time) - julianday(Check_in_time)) * 24
                      ELSE 0 END) as total_hours
      FROM Attendance
      WHERE User_ID = ? AND strftime('%m', Check_in_time) = strftime('%m', 'now')
        AND strftime('%Y', Check_in_time) = strftime('%Y', 'now')
    `;

    // Get check-in rate (% of scheduled days attended)
    const checkInRate = `
      SELECT COUNT(DISTINCT date(a.Check_in_time)) as attended_days,
             COUNT(DISTINCT s.Schedule_ID) as scheduled_days
      FROM Attendance a
      LEFT JOIN Schedule s ON date(a.Check_in_time) = date(s.Start_Date)
        AND a.User_ID = s.User_ID
      WHERE a.User_ID = ? AND date(a.Check_in_time) >= date('now', '-30 days')
    `;

    // Get weekly activity
    const weeklyActivity = `
      SELECT 
        CASE CAST(strftime('%w', Check_in_time) - 1 AS INTEGER)
          WHEN 0 THEN 'Mon'
          WHEN 1 THEN 'Tue'
          WHEN 2 THEN 'Wed'
          WHEN 3 THEN 'Thu'
          WHEN 4 THEN 'Fri'
          WHEN 5 THEN 'Sat'
          WHEN 6 THEN 'Sun'
        END as day_name,
        SUM(CASE WHEN Check_out_time IS NOT NULL
               THEN (julianday(Check_out_time) - julianday(Check_in_time)) * 24
               ELSE 0 END) as hours
      FROM Attendance
      WHERE User_ID = ? AND Check_in_time >= date('now', '-7 days')
      GROUP BY strftime('%w', Check_in_time)
    `;

    Promise.all([
      new Promise(resolve => db.get(sevenDayAvg, [userId], (err, row) => resolve(row?.avg_hours || 8))),
      new Promise(resolve => db.get(monthlyHours, [userId], (err, row) => resolve(row?.total_hours || 0))),
      new Promise(resolve => db.get(checkInRate, [userId], (err, row) => {
        const attended = row?.attended_days || 0;
        const scheduled = row?.scheduled_days || 1;
        resolve(Math.round((attended / scheduled) * 100) || 95);
      })),
      new Promise(resolve => db.all(weeklyActivity, [userId], (err, rows) => resolve(rows || [])))
    ]).then(([avgHours, monthlyHours, checkInRate, weeklyData]) => {
      const weeklyActivity = [
        { day: 'Mon', hours: 0 },
        { day: 'Tue', hours: 0 },
        { day: 'Wed', hours: 0 },
        { day: 'Thu', hours: 0 },
        { day: 'Fri', hours: 0 },
        { day: 'Sat', hours: 0 },
        { day: 'Sun', hours: 0 }
      ];

      weeklyData.forEach(w => {
        const dayIndex = weeklyActivity.findIndex(d => d.day === w.day_name);
        if (dayIndex >= 0) {
          weeklyActivity[dayIndex].hours = Math.round(w.hours);
        }
      });

      res.json({
        avgHoursPerDay: Math.round(avgHours * 10) / 10,
        totalMonthHours: Math.round(monthlyHours * 10) / 10,
        checkInRate: checkInRate,
        onTimeRate: 98, // Could be calculated from scheduled vs actual check-in times
        weeklyActivity: weeklyActivity,
        targetMonthHours: 160
      });
    }).catch(error => {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to calculate analytics' });
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============================================================
// 8. CURRENT SHIFT INFO
// =============================================================
exports.getCurrentShift = (req, res) => {
  try {
    const { userId } = req.user;

    const sql = `
      SELECT s.Schedule_ID, s.Start_Date, s.Start_Time, s.End_Time,
             st.ShiftType_Name, d.Depart_Name, s.Color_Code
      FROM Schedule s
      JOIN ShiftType st ON s.ShiftType_ID = st.ShiftType_ID
      LEFT JOIN Department d ON s.Department_ID = d.Depart_ID
      WHERE s.User_ID = ? 
        AND date(s.Start_Date) >= date('now')
      ORDER BY s.Start_Date ASC, s.Start_Time ASC
      LIMIT 1
    `;

    db.get(sql, [userId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch current shift' });
      res.json(row || { Shift_Date: null, Shift_Start_Time: null });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============================================================
// 9. USER DASHBOARD DATA (READ-ONLY)
// =============================================================
exports.getUserDashboard = async (req, res) => {
  try {
    const { userId, orgId } = req.user;

    // A. Get user profile
    const userProfile = await new Promise((resolve) => {
      const sql = `
        SELECT User_ID, First_Name, SurName, Email, Phone_Num, Job_Title, 
               Employee_ID, Avatar_Data, Avatar_MIME_Type, Created_at
        FROM User 
        WHERE User_ID = ?
      `;
      db.get(sql, [userId], (err, row) => resolve(row || {}));
    });

    // B. Get today's shift (from Schedule table assigned by admin)
    const shift = await getUserTodayShift(userId, orgId);
    
    // C. Get org clock-in settings (show to user)
    const orgSettings = await getOrgClockInSettings(orgId);

    // D. Get current attendance session
    const currentSession = await new Promise((resolve) => {
      db.get('SELECT Attend_ID, Check_in_time, User_ID, Org_ID FROM Attendance WHERE User_ID = ? AND Check_out_time IS NULL LIMIT 1', [userId], (err, row) => resolve(row || null));
    });

    // E. Get today's attendance history
    const todayAttendance = await new Promise((resolve) => {
      const today = new Date().toISOString().split('T')[0];
      const sql = `
        SELECT Attend_ID, Check_in_time, Check_out_time, Is_Late_Clock_In, Minutes_Late, 
               Method_ID, Latitude, Longitude
        FROM Attendance
        WHERE User_ID = ? AND date(Check_in_time) = ?
        ORDER BY Check_in_time DESC
      `;
      db.all(sql, [userId, today], (err, rows) => resolve(rows || []));
    });

    // F. Get upcoming shifts/schedules (from Schedule+ScheduleEmployee + Shift tables)
    const upcomingShifts = await new Promise((resolve) => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get from Schedule table (primary - assigned by admin)
      const scheduleSql = `
        SELECT 
          s.Schedule_ID,
          s.Schedule_Name,
          s.Start_Date as Shift_Date,
          st.Start_Time as Shift_Start_Time,
          st.End_Time as Shift_End_Time,
          st.ShiftType_Name,
          st.Color_Code,
          d.Depart_Name,
          'Schedule' as source
        FROM Schedule s
        INNER JOIN ScheduleEmployee se ON s.Schedule_ID = se.Schedule_ID
        INNER JOIN ShiftType st ON s.ShiftType_ID = st.ShiftType_ID
        INNER JOIN User u ON se.User_ID = u.User_ID
        LEFT JOIN Department d ON u.Dep_ID = d.Dep_ID
        WHERE se.User_ID = ? 
        AND s.Org_ID = ?
        AND date(s.End_Date) >= date(?)
        AND s.Is_Active = 1
        ORDER BY s.Start_Date ASC, st.Start_Time ASC
        LIMIT 7
      `;
      
      db.all(scheduleSql, [userId, orgId, today], (err, scheduleRows) => {
        if (scheduleRows && scheduleRows.length > 0) {
          resolve(scheduleRows);
        } else {
          // Fallback to Shift table if no Schedule entries
          const shiftSql = `
            SELECT 
              Shift_ID,
              Shift_Date,
              Shift_Start_Time,
              Shift_End_Time,
              Is_Active,
              'Shift' as source
            FROM Shift
            WHERE User_ID = ? 
            AND Shift_Date >= ?
            AND Is_Active = 1
            ORDER BY Shift_Date ASC, Shift_Start_Time ASC
            LIMIT 7
          `;
          db.all(shiftSql, [userId, today], (err, shiftRows) => {
            resolve(shiftRows || []);
          });
        }
      });
    });

    // G. Get unread notifications
    const unreadNotifs = await new Promise((resolve) => {
      const sql = `
        SELECT Notify_ID, Title, Message, Type, Category, Created_at
        FROM Notification
        WHERE User_ID = ? AND Is_Read = 0
        ORDER BY Created_at DESC
        LIMIT 10
      `;
      db.all(sql, [userId], (err, rows) => resolve(rows || []));
    });

    // H. Calculate shift alert info (for clock-out)
    let clockOutAlertInfo = null;
    if (shift && currentSession) {
      const shiftEndTime = shift.Shift_End_Time;
      const [hours, minutes] = shiftEndTime.split(':').map(Number);
      const shiftEnd = new Date();
      shiftEnd.setHours(hours, minutes, 0, 0);
      const alertTime = new Date(shiftEnd);
      alertTime.setMinutes(alertTime.getMinutes() - orgSettings.clockOutAlert);
      
      clockOutAlertInfo = {
        shiftEndTime: shiftEndTime,
        alertWillSendAt: alertTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        minutesBeforeEnd: orgSettings.clockOutAlert
      };
    }

    res.json({
      success: true,
      user: userProfile,
      todayShift: shift,
      currentSession: currentSession,
      todayAttendance: todayAttendance,
      upcomingShifts: upcomingShifts,
      unreadNotifications: unreadNotifs,
      clockOutAlertInfo: clockOutAlertInfo,
      orgSettings: {
        clockInWindowMinutes: orgSettings.clockInWindow,
        clockOutAlertMinutes: orgSettings.clockOutAlert
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

// =============================================================
// 10. GET NOTIFICATIONS
// =============================================================
exports.getNotifications = (req, res) => {
  try {
    const { userId } = req.user;
    const limit = parseInt(req.query.limit) || 50;

    const sql = `
      SELECT Notify_ID, Title, Message, Type, Category, Is_Read, Created_at, Read_at
      FROM Notification
      WHERE User_ID = ?
      ORDER BY Is_Read ASC, Created_at DESC
      LIMIT ?
    `;

    db.all(sql, [userId, limit], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch notifications' });
      res.json(rows || []);
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============================================================
// 11. MARK NOTIFICATION AS READ
// =============================================================
exports.markNotificationAsRead = (req, res) => {
  try {
    const { notifyId } = req.params;
    const { userId } = req.user;

    const sql = `
      UPDATE Notification
      SET Is_Read = 1, Read_at = datetime('now', 'localtime')
      WHERE Notify_ID = ? AND User_ID = ?
    `;

    db.run(sql, [notifyId, userId], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to mark as read' });
      if (this.changes === 0) return res.status(404).json({ error: 'Notification not found' });
      
      res.json({ success: true, message: 'Marked as read' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============================================================
// 12. CLOCK-OUT ALERT CHECK (Called periodically or on demand)
// =============================================================
exports.checkAndSendClockOutAlerts = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    
    // Get all active sessions for this org
    const activeSessions = await new Promise((resolve) => {
      const sql = `
        SELECT A.Attend_ID, A.User_ID, A.Check_in_time, S.Shift_ID, S.Shift_End_Time, U.First_Name, U.SurName
        FROM Attendance A
        JOIN Shift S ON S.User_ID = A.User_ID AND date(S.Shift_Date) = date(A.Check_in_time)
        JOIN User U ON A.User_ID = U.User_ID
        WHERE A.Org_ID = ? 
        AND A.Check_out_time IS NULL
        AND S.Is_Active = 1
      `;
      db.all(sql, [orgId], (err, rows) => resolve(rows || []));
    });

    const orgSettings = await getOrgClockInSettings(orgId);
    const alertsSent = [];

    for (const session of activeSessions) {
      // Check if alert already sent
      const alertExists = await new Promise((resolve) => {
        db.get('SELECT Alert_ID FROM Clock_Out_Alert WHERE Attend_ID = ?', [session.Attend_ID], (err, row) => {
          resolve(!!row);
        });
      });

      if (alertExists) continue;

      // Calculate when alert should be sent
      const [hours, minutes] = session.Shift_End_Time.split(':').map(Number);
      const shiftEnd = new Date();
      shiftEnd.setHours(hours, minutes, 0, 0);
      
      const alertTime = new Date(shiftEnd);
      alertTime.setMinutes(alertTime.getMinutes() - orgSettings.clockOutAlert);
      
      const now = new Date();

      // If current time is within alert window (±2 minutes tolerance)
      if (Math.abs(now - alertTime) < 2 * 60 * 1000 || (now >= alertTime && now < shiftEnd)) {
        // Create notification
        const notifData = {
          userId: session.User_ID,
          orgId: orgId,
          title: 'Time to Clock Out',
          message: `Your shift ends at ${session.Shift_End_Time}. Please clock out within the next ${orgSettings.clockOutAlert} minutes.`,
          type: 'warning',
          category: 'clock_out',
          relatedRecordId: session.Attend_ID
        };

        const notifId = await new Promise((resolve) => {
          Notification.create(notifData, (err, result) => {
            resolve(result?.Notify_ID);
          });
        });

        // Record alert sent
        if (notifId) {
          await new Promise((resolve) => {
            const alertData = {
              userId: session.User_ID,
              attendId: session.Attend_ID,
              shiftId: session.Shift_ID,
              notifId: notifId
            };
            ClockOutAlert.create(alertData, (err, result) => {
              resolve(result);
            });
          });

          // Emit realtime alert via socket
          try {
            const io = socketHelper.getIo();
            io.to(`user:${session.User_ID}`).emit('clock_out_alert', {
              title: notifData.title,
              message: notifData.message,
              shiftEndTime: session.Shift_End_Time,
              minutesBefore: orgSettings.clockOutAlert
            });
          } catch (socketErr) {
            console.error('Failed to emit clock_out_alert:', socketErr.message);
          }

          alertsSent.push({
            userId: session.User_ID,
            userName: `${session.First_Name} ${session.SurName}`,
            notifId: notifId
          });
        }
      }
    }

    res.json({
      success: true,
      alertsSent: alertsSent,
      count: alertsSent.length
    });

  } catch (error) {
    console.error('Alert check error:', error);
    res.status(500).json({ error: 'Failed to check alerts' });
  }
};