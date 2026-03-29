const db = require('./config/db');
console.log("Ìª†Ô∏è Fixing Attendance table constraints...");
db.serialize(() => {
    // This adds the Org_ID column if it's missing
    db.run("ALTER TABLE Attendance ADD COLUMN Org_ID INTEGER;", (err) => {
        if (err) console.log("‚ÑπÔ∏è Org_ID column already exists.");
        else console.log("‚úÖ Org_ID column added.");
    });
    // Note: SQLite doesn't allow changing NOT NULL easily, 
    // so we just ensure the columns exist for now.
});
