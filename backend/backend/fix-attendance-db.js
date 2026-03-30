const db = require('./config/db');

console.log("🛠️ Fixing Attendance table constraints...");

db.serialize(() => {
    // 1. Check if Device_ID exists. If not, add it as a nullable column.
    db.run("ALTER TABLE Attendance ADD COLUMN Device_ID INTEGER;", (err) => {
        if (err) {
            console.log("ℹ️ Device_ID column already exists or handled.");
        } else {
            console.log("✅ Device_ID column added as optional.");
        }
    });

    // 2. Ensure Org_ID is also in the Attendance table (Crucial for SaaS Isolation)
    db.run("ALTER TABLE Attendance ADD COLUMN Org_ID INTEGER;", (err) => {
        if (err) console.log("ℹ️ Org_ID column already exists.");
        else console.log("✅ Org_ID column added.");
    });
});