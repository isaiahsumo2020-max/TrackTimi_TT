const db = require('../config/db');

const Shift = {
  create: (shiftData, callback) => {
    const sql = `
      INSERT INTO Shift (User_ID, Shift_Start_Time, Shift_End_Time, Shift_Date)
      VALUES (?, ?, ?, ?)
    `;
    db.run(sql, [
      shiftData.userId,
      shiftData.shiftStartTime,
      shiftData.shiftEndTime,
      shiftData.shiftDate
    ], function(err) {
      if (err) return callback(err);
      callback(null, { Shift_ID: this.lastID });
    });
  },

  findByUserId: (userId, callback) => {
    db.all(`
      SELECT S.*, U.First_Name, U.SurName
      FROM Shift S
      JOIN User U ON S.User_ID = U.User_ID
      WHERE S.User_ID = ?
      ORDER BY S.Shift_Date DESC, S.Shift_Start_Time
    `, [userId], callback);
  },

  findTodayShifts: (callback) => {
    const today = new Date().toISOString().split('T')[0];
    db.all(`
      SELECT S.*, U.First_Name, U.SurName
      FROM Shift S
      JOIN User U ON S.User_ID = U.User_ID
      WHERE date(S.Shift_Date) = ?
      ORDER BY S.Shift_Start_Time
    `, [today], callback);
  },

  findById: (id, callback) => {
    db.get(`
      SELECT S.*, U.First_Name, U.SurName
      FROM Shift S
      JOIN User U ON S.User_ID = U.User_ID
      WHERE S.Shift_ID = ?
    `, [id], callback);
  }
};

module.exports = Shift;
