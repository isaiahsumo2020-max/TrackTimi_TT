const db = require('./config/db');

console.log("🛠️  PERFORMING MASTER GEOFENCE REPAIR...");

db.serialize(() => {
    // 1. Drop the table to start fresh
    db.run("DROP TABLE IF EXISTS Geofence", (err) => {
        if (err) console.error("Error dropping table:", err.message);
        else console.log("🗑️  Old table removed.");
    });

    // 2. Create the table with the PERFECT schema
    db.run(`CREATE TABLE Geofence (
        Fence_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Org_ID INTEGER NOT NULL,
        Location_Name TEXT NOT NULL,
        Latitude REAL NOT NULL,
        Longitude REAL NOT NULL,
        Radius INTEGER DEFAULT 500,
        Is_Active BOOLEAN DEFAULT 1,
        Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error("❌ ERROR CREATING TABLE:", err.message);
        else console.log("✅ Geofence table recreated perfectly!");
    });
});