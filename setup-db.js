const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Open database
const db = new sqlite3.Database('./tracktimi.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

// Disable foreign keys temporarily
db.run('PRAGMA foreign_keys = OFF', (err) => {
  if (err) {
    console.error('Error disabling foreign keys:', err.message);
    return;
  }

  // Read and execute schema.sql
  const schemaPath = path.join(__dirname, 'sql', 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

  console.log('Executing schema.sql...');

  // Execute the entire schema as one statement
  db.exec(schemaSQL, (err) => {
    if (err) {
      console.error('Error executing schema:', err.message);
    } else {
      console.log('Schema execution completed.');
    }

    // Re-enable foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        console.error('Error re-enabling foreign keys:', err.message);
      } else {
        console.log('Foreign keys re-enabled.');
      }

      // Check if columns exist and add them if needed
      db.all("PRAGMA table_info(Organization)", (err, columns) => {
        if (err) {
          console.error('Error checking table info:', err.message);
        } else {
          const columnNames = columns.map(col => col.name);
          const hasOrgDomain = columnNames.includes('Org_Domain');
          const hasLogPath = columnNames.includes('Logo_Path');
          const hasThemeColor = columnNames.includes('Theme_Color');
          const hasLogoMimeType = columnNames.includes('Logo_MIME_Type');

          let migrationsNeeded = 0;

          // Track pending migrations
          const pendingMigrations = [];

          if (!hasOrgDomain) {
            pendingMigrations.push('Org_Domain');
            migrationsNeeded++;
          }
          if (!hasLogPath) {
            pendingMigrations.push('Logo_Path');
            migrationsNeeded++;
          }
          if (!hasThemeColor) {
            pendingMigrations.push('Theme_Color');
            migrationsNeeded++;
          }
          if (!hasLogoMimeType) {
            pendingMigrations.push('Logo_MIME_Type');
            migrationsNeeded++;
          }

          let completedMigrations = 0;

          const checkAndClose = () => {
            completedMigrations++;
            if (completedMigrations === migrationsNeeded || migrationsNeeded === 0) {
              // Close database
              db.close((err) => {
                if (err) {
                  console.error('Error closing database:', err.message);
                } else {
                  console.log('Database setup completed successfully!');
                }
              });
            }
          };

          if (!hasOrgDomain) {
            console.log('Adding Org_Domain column...');
            db.run(`ALTER TABLE Organization ADD COLUMN Org_Domain TEXT UNIQUE`, (err) => {
              if (err) {
                console.error('Error adding Org_Domain column:', err.message);
              } else {
                console.log('Successfully added Org_Domain column.');
              }
              checkAndClose();
            });
          }

          if (!hasLogPath) {
            console.log('Adding Logo_Path column...');
            db.run(`ALTER TABLE Organization ADD COLUMN Logo_Path TEXT`, (err) => {
              if (err) {
                console.error('Error adding Logo_Path column:', err.message);
              } else {
                console.log('Successfully added Logo_Path column.');
              }
              checkAndClose();
            });
          }

          if (!hasThemeColor) {
            console.log('Adding Theme_Color column...');
            db.run(`ALTER TABLE Organization ADD COLUMN Theme_Color TEXT DEFAULT '#ff6600'`, (err) => {
              if (err) {
                console.error('Error adding Theme_Color column:', err.message);
              } else {
                console.log('Successfully added Theme_Color column.');
              }
              checkAndClose();
            });
          }

          if (!hasLogoMimeType) {
            console.log('Adding Logo_MIME_Type column...');
            db.run(`ALTER TABLE Organization ADD COLUMN Logo_MIME_Type TEXT DEFAULT 'image/png'`, (err) => {
              if (err) {
                console.error('Error adding Logo_MIME_Type column:', err.message);
              } else {
                console.log('Successfully added Logo_MIME_Type column.');
              }
              checkAndClose();
            });
          }

          // If no migrations needed, close immediately
          if (migrationsNeeded === 0) {
            console.log('All columns already exist.');
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err.message);
              } else {
                console.log('Database setup completed successfully!');
              }
            });
          }
        }
      });
    });
  });
});