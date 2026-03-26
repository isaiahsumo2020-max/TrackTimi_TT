const db = require('../config/db');
const { generateUniqueEmployeeId } = require('../utils/employeeId');

const User = {
  // CREATE user
  create: (userData, callback) => {
    // Generate unique Employee_ID before creating user
    generateUniqueEmployeeId((err, employeeId) => {
      if (err) return callback(err);

      const sql = `
        INSERT INTO User (First_Name, SurName, Last_Name, Email, Password, Org_ID, User_Type_ID, Employee_ID, Phone_Num, Dep_ID, Job_Title)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const departmentId = userData.departId ?? userData.depId ?? null;
      const params = [
        userData.firstName,
        userData.surName,
        userData.lastName || null,
        userData.email || null,
        userData.password || null,
        userData.orgId || null,
        userData.userTypeId || null,
        employeeId,
        userData.phone || null,
        departmentId,
        userData.jobTitle || null
      ];
      
      db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ User.create DB error:', err.message, 'SQL:', sql, 'Params:', params);
          return callback(err);
        }
        callback(null, { User_ID: this.lastID, Employee_ID: employeeId, ...userData });
      });
    });
  },

  // READ all users
  findAll: (callback) => {
    db.all(`
      SELECT User_ID, First_Name, SurName, Email, Employee_ID, Phone_Num, Job_Title, Role_ID, User_Type_ID, Is_Active, Created_at
      FROM User ORDER BY User_ID DESC
    `, callback);
  },

  // READ single user by ID
  findById: (id, callback) => {
    db.get('SELECT * FROM User WHERE User_ID = ?', [id], callback);
  },

  // READ by email (for login)
  findByEmail: (email, callback) => {
    db.get('SELECT * FROM User WHERE Email = ?', [email], callback);
  },

  // UPDATE user
  update: (id, userData, callback) => {
    const sql = `
      UPDATE User SET 
        First_Name = ?, SurName = ?, Last_Name = ?, Email = ?, Phone_Num = ?, Job_Title = ?
      WHERE User_ID = ?
    `;
    db.run(sql, [
      userData.firstName, userData.surName, userData.lastName || null,
      userData.email || null, userData.phone || null, userData.jobTitle || null, id
    ], callback);
  },

  // DELETE user
  delete: (id, callback) => {
    db.run('DELETE FROM User WHERE User_ID = ?', [id], callback);
  }
};

module.exports = User;
