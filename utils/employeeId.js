const db = require('../config/db');

/**
 * Generate a unique 6-digit Employee ID
 * Format: EMP + 6 random digits (100000 - 999999)
 */
function generateUniqueEmployeeId(callback) {
  const generateId = () => {
    // Generate random 6-digit number (100000 - 999999)
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    const employeeId = `EMP${randomNum}`;

    // Check if this ID already exists
    db.get(
      'SELECT Employee_ID FROM User WHERE Employee_ID = ?',
      [employeeId],
      (err, row) => {
        if (err) {
          return callback(err);
        }

        // If ID already exists, generate a new one
        if (row) {
          generateId();
        } else {
          // ID is unique, return it
          callback(null, employeeId);
        }
      }
    );
  };

  generateId();
}

module.exports = { generateUniqueEmployeeId };
