const db = require('../config/db');

const ClockOutAlert = {
  // CREATE alert record
  create: (alertData, callback) => {
    const sql = `
      INSERT INTO Clock_Out_Alert (User_ID, Attend_ID, Shift_ID, Notif_ID)
      VALUES (?, ?, ?, ?)
    `;
    db.run(sql, [
      alertData.userId,
      alertData.attendId,
      alertData.shiftId || null,
      alertData.notifId || null
    ], function(err) {
      if (err) {
        console.error('❌ ClockOutAlert.create DB error:', err.message);
        return callback(err);
      }
      callback(null, { Alert_ID: this.lastID, ...alertData });
    });
  },

  // CHECK if alert already sent for this attendance
  hasAlertBeenSent: (attendId, callback) => {
    const sql = `
      SELECT Alert_ID FROM Clock_Out_Alert 
      WHERE Attend_ID = ?
      LIMIT 1
    `;
    db.get(sql, [attendId], (err, row) => {
      callback(err, !!row);
    });
  },

  // GET recent active alerts (for debugging/monitoring)
  getRecentAlerts: (userId, hoursBack = 24, callback) => {
    const sql = `
      SELECT COA.*, A.Check_in_time, A.Check_out_time, S.Shift_End_Time, U.First_Name, U.SurName
      FROM Clock_Out_Alert COA
      JOIN Attendance A ON COA.Attend_ID = A.Attend_ID
      LEFT JOIN Shift S ON COA.Shift_ID = S.Shift_ID
      JOIN User U ON COA.User_ID = U.User_ID
      WHERE COA.User_ID = ?
      AND COA.Alert_Sent_At > datetime('now', '-' || ? || ' hours')
      ORDER BY COA.Alert_Sent_At DESC
    `;
    db.all(sql, [userId, hoursBack], callback);
  }
};

module.exports = ClockOutAlert;
