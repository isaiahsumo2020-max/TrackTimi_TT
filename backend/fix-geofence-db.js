const db = require('./config/db');

console.log("🛠️ Repairing Geofence table...");

db.serialize(() => {
    // 1. Create the table if it doesn't exist at all
    db.run(`CREATE TABLE IF NOT EXISTS Geofence (
        Fence_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Org_ID INTEGER NOT NULL,
        Location_Name TEXT NOT NULL,
        Latitude REAL NOT NULL,
        Longitude REAL NOT NULL,
        Radius INTEGER DEFAULT 200,
        Is_Active BOOLEAN DEFAULT 1,
        Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID)
    );`, (err) => {
        if (err) console.error("❌ Error creating table:", err.message);
        else console.log("✅ Geofence table is present.");
    });

    // 2. Add Is_Active column in case the table existed without it
    db.run("ALTER TABLE Geofence ADD COLUMN Is_Active BOOLEAN DEFAULT 1;", (err) => {
        if (err) console.log("ℹ️ Is_Active column already exists.");
        else console.log("✅ Is_Active column added.");
    });
});