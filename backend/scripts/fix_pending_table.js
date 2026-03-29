const db = require('../config/db');

db.serialize(() => {
  db.all("PRAGMA foreign_key_list('Pending_Employee')", (err, rows) => {
    if (err) {
      console.error('Error reading FK list:', err);
      return;
    }
    console.log('Current Pending_Employee foreign keys:', rows);

    db.run('DROP TABLE IF EXISTS Pending_Employee', (dropErr) => {
      if (dropErr) {
        console.error('Failed to drop Pending_Employee:', dropErr);
        return;
      }
      console.log('Dropped Pending_Employee');

      db.run(`CREATE TABLE Pending_Employee (
        Pending_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Email TEXT NOT NULL,
        First_Name TEXT NOT NULL,
        SurName TEXT NOT NULL,
        Job_Title TEXT,
        Depart_ID INTEGER,
        Org_ID INTEGER NOT NULL,
        Invitation_ID INTEGER UNIQUE,
        User_Type_ID INTEGER DEFAULT 3,
        Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
        FOREIGN KEY (Invitation_ID) REFERENCES Invitation(Invitation_ID),
        FOREIGN KEY (Depart_ID) REFERENCES Department(Dep_ID),
        FOREIGN KEY (User_Type_ID) REFERENCES User_Type(User_Type_ID)
      )`, (createErr) => {
        if (createErr) {
          console.error('Failed to create Pending_Employee:', createErr);
        } else {
          console.log('Pending_Employee recreated successfully');
        }
        db.all("PRAGMA foreign_key_list('Pending_Employee')", (err2, rows2) => {
          if (err2) {
            console.error('Error verifying FK list:', err2);
          } else {
            console.log('New Pending_Employee foreign keys:', rows2);
          }
          db.close();
        });
      });
    });
  });
});
