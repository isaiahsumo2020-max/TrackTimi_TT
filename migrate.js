const sqlite3 = require('sqlite3').verbose();
const db = require('./config/db.js');
const fs = require('fs');
const path = require('path');

const addOrgDomainToOrganization = () => {
  return new Promise((resolve, reject) => {
    db.run(`ALTER TABLE Organization ADD COLUMN Org_Domain TEXT UNIQUE`, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const addInvitationSystem = () => {
  return new Promise((resolve, reject) => {
    const migrationPath = path.join(__dirname, 'sql', 'migration_add_invitation_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    db.exec(migrationSQL, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const addEmployeeIdColumn = () => {
  return new Promise((resolve, reject) => {
    const migrationPath = path.join(__dirname, 'sql', 'migration_add_employee_id.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    db.exec(migrationSQL, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const addMissingUserColumns = () => {
  return new Promise((resolve, reject) => {
    const migrationPath = path.join(__dirname, 'sql', 'migration_add_missing_user_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    db.exec(migrationSQL, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Check if Organization table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Organization'", (err, row) => {
  if (err) {
    console.error('Error checking table:', err.message);
    db.close();
    return;
  }

  if (!row) {
    console.log('Organization table does not exist. Please run the schema.sql first.');
    db.close();
    return;
  }

  console.log('Organization table exists. Adding Org_Domain column...');

  // Run migrations sequentially
  db.run(`ALTER TABLE Organization ADD COLUMN Org_Domain TEXT UNIQUE`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Org_Domain column already exists.');
      } else {
        console.error('Error adding Org_Domain column:', err.message);
      }
    } else {
      console.log('Successfully added Org_Domain column.');
    }

    // Run invitation system migration
    console.log('Adding invitation system tables...');
    const migrationPath = path.join(__dirname, 'sql', 'migration_add_invitation_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    db.exec(migrationSQL, (err) => {
      if (err) {
        if (err.message.includes('already exists')) {
          console.log('Invitation system tables already exist.');
        } else {
          console.error('Error adding invitation system:', err.message);
        }
      } else {
        console.log('Successfully added invitation system tables.');
      }

      // Run employee ID migration
      console.log('Adding Employee_ID column...');
      const employeeIdMigrationPath = path.join(__dirname, 'sql', 'migration_add_employee_id.sql');
      const employeeIdMigrationSQL = fs.readFileSync(employeeIdMigrationPath, 'utf8');

      db.exec(employeeIdMigrationSQL, (err) => {
        if (err) {
          if (err.message.includes('duplicate column name')) {
            console.log('Employee_ID column already exists.');
          } else {
            console.error('Error adding Employee_ID column:', err.message);
          }
        } else {
          console.log('Successfully added Employee_ID column.');
        }

        // Run missing user columns migration
        console.log('Adding missing User table columns...');
        const missingColumnsMigrationPath = path.join(__dirname, 'sql', 'migration_add_missing_user_columns.sql');
        const missingColumnsMigrationSQL = fs.readFileSync(missingColumnsMigrationPath, 'utf8');

        db.exec(missingColumnsMigrationSQL, (err) => {
          if (err) {
            if (err.message.includes('duplicate column name')) {
              console.log('Missing User columns already exist.');
            } else {
              console.error('Error adding missing User columns:', err.message);
            }
          } else {
            console.log('Successfully added missing User columns.');
          }

          // Close database
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            } else {
              console.log('Database connection closed.');
            }
          });
        });
      });
    });
  });
});