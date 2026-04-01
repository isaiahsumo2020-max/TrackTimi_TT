const db = require('./config/db');

console.log("🛠️ Adding missing timestamp columns...");

db.serialize(() => {
    // Add Created_at if missing
    db.run("ALTER TABLE User ADD COLUMN Created_at DATETIME DEFAULT CURRENT_TIMESTAMP;", (err) => {
        if (err) console.log("ℹ️ Created_at might already exist, skipping...");
        else console.log("✅ Created_at added.");
    });

    // Add Updated_at if missing (THIS IS YOUR ERROR CAUSE)
    db.run("ALTER TABLE User ADD COLUMN Updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;", (err) => {
        if (err) console.log("ℹ️ Updated_at might already exist, skipping...");
        else console.log("✅ Updated_at added.");
    });

    // Add Employee_ID if missing (Good for SaaS tracking)
    db.run("ALTER TABLE User ADD COLUMN Employee_ID TEXT;", (err) => {
        if (err) console.log("ℹ️ Employee_ID might already exist, skipping...");
        else console.log("✅ Employee_ID added.");
    });
});