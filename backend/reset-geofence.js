const db = require('./config/db');

console.log("🧨 Resetting Geofence table...");

db.serialize(() => {
    // 1. Delete the old, broken table
    db.run("DROP TABLE IF EXISTS Geofence", (err) => {
        if (err) console.error("❌ Error dropping table:", err.message);
        else console.log("🗑️ Old Geofence table deleted.");
    });

    // 2. Create the perfect version matching your schema
    db.run(`CREATE TABLE Geofence (
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
        else console.log("✅ Geofence table recreated with 'Location_Name' column!");
    });
});