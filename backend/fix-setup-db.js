const db = require('./config/db');

console.log("í» ï¸ Starting Database Migration...");

db.serialize(() => {
    // 1. Add Dep_ID to User table
    db.run("ALTER TABLE User ADD COLUMN Dep_ID INTEGER;", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("âœ… Column 'Dep_ID' already exists. Skipping.");
            } else {
                console.error("âŒ Error adding Dep_ID:", err.message);
            }
        } else {
            console.log("íº€ Success: Column 'Dep_ID' added to User table.");
        }
    });

    // 2. Add Audit_Log table
    db.run(`CREATE TABLE IF NOT EXISTS Audit_Log (
        Log_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        User_ID INTEGER,
        Org_ID INTEGER,
        Action TEXT NOT NULL,
        Table_Name TEXT,
        Record_ID INTEGER,
        Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`, (err) => {
        if (err) console.error("âŒ Error creating Audit_Log:", err.message);
        else console.log("âœ… Audit_Log table is ready.");
    });
});
