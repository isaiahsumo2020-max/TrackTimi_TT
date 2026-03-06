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
