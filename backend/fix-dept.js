const db = require('./config/db');

console.log("🛠️ Fixing Department table...");

db.serialize(() => {
    // Add Is_Active to Department table if it doesn't exist
    db.run("ALTER TABLE Department ADD COLUMN Is_Active BOOLEAN DEFAULT 1;", (err) => {
        if (err) {
            console.log("ℹ️ Is_Active column might already exist, skipping...");
        } else {
            console.log("✅ Is_Active column added to Department table.");
        }
    });
});