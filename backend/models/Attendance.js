const db = require('../config/db');

const Attendance = {
  checkIn: (checkInData, callback) => {
    const sql = `
      INSERT INTO Attendance (User_ID, Check_in_time, Status_ID, Method_ID, Latitude, Longitude)
      VALUES (?, datetime('now'), ?, ?, ?, ?)
    `;
    db.run(sql, [
      checkInData.userId,
      checkInData.statusId || 1,
      checkInData.methodId || 1,
      checkInData.latitude,
      checkInData.longitude
    ], function(err) {
      if (err) return callback(err);
      callback(null, { Attend_ID: this.lastID, ...checkInData });
    });
  },

  checkOut: (attendId, latitude, longitude, callback) => {
    const sql = `
      UPDATE Attendance 
      SET Check_out_time = datetime('now'), Latitude = ?, Longitude = ?
      WHERE Attend_ID = ?
    `;
    db.run(sql, [latitude, longitude, attendId], function(err) {
      if (err) return callback(err);
      callback(null, { Attend_ID: attendId, changes: this.changes });
    });
  },

  findRecent: (limit, callback) => {
    db.all(`
      SELECT A.*, U.First_Name, U.SurName
      FROM Attendance A
      JOIN User U ON A.User_ID = U.User_ID
      ORDER BY A.Check_in_time DESC
      LIMIT ?
    `, [limit || 20], callback);
  },

  findOrgLogs: (orgId, limit, offset, callback) => {
    db.all(`
      SELECT A.Attend_ID, A.User_ID, U.First_Name, U.SurName, U.Job_Title,
             A.Check_in_time, A.Check_out_time, A.Status_ID, A.Method_ID,
             A.Latitude, A.Longitude, A.Notes
      FROM Attendance A
      JOIN User U ON A.User_ID = U.User_ID
      WHERE U.Org_ID = ?
      ORDER BY A.Check_in_time DESC
      LIMIT ? OFFSET ?
    `, [orgId, limit || 20, offset || 0], callback);
  },

  findOrgSummary: (orgId, callback) => {
    const today = new Date().toISOString().split('T')[0];
    db.get(`
      SELECT
        COUNT(A.Attend_ID) AS total_checkins,
        SUM(CASE WHEN date(A.Check_in_time) = ? THEN 1 ELSE 0 END) AS today_checkins,
        SUM(CASE WHEN A.Status_ID = 1 THEN 1 ELSE 0 END) AS on_time,
        SUM(CASE WHEN A.Status_ID = 2 THEN 1 ELSE 0 END) AS late,
        SUM(CASE WHEN A.Check_out_time IS NOT NULL THEN 1 ELSE 0 END) AS checkouts,
        AVG((julianday(A.Check_out_time) - julianday(A.Check_in_time)) * 24 * 60) AS avg_minutes
      FROM Attendance A
      JOIN User U ON A.User_ID = U.User_ID
      WHERE U.Org_ID = ?
    `, [today, orgId], callback);
  },

  findOrgWeeklyTrend: (orgId, callback) => {
    db.all(`
      SELECT date(Check_in_time) AS day, COUNT(*) AS total
      FROM Attendance A
      JOIN User U ON A.User_ID = U.User_ID
      WHERE U.Org_ID = ?
        AND date(Check_in_time) >= date('now', '-6 days')
      GROUP BY day
      ORDER BY day ASC
    `, [orgId], callback);
  },

  findTodaySummary: (callback) => {
    const today = new Date().toISOString().split('T')[0];
    db.get(`
      SELECT 
        COUNT(*) as total_checkins,
        COUNT(Check_out_time) as checkouts,
        AVG(julianday(Check_out_time) - julianday(Check_in_time)) * 24 * 60 as avg_hours
      FROM Attendance 
      WHERE date(Check_in_time) = ?
    `, [today], callback);
  }
};

module.exports = Attendance;
