const db = require('./config/db');
const crypto = require('crypto');

// Test: Generate a reset token and try to use it
console.log('🧪 Testing password reset flow...\n');

// Step 1: Get a user
db.get('SELECT User_ID, Email, First_Name FROM User LIMIT 1', (err, user) => {
  if (err) {
    console.error('❌ Error getting user:', err);
    process.exit(1);
  }

  if (!user) {
    console.error('❌ No user found');
    process.exit(1);
  }

  console.log('✅ Found user:', user.Email);

  // Step 2: Generate and store a reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  console.log('🔐 Generated token:', resetToken.substring(0, 8) + '...');
  console.log('⏰ Expires at:', resetExpires);

  db.run(
    'UPDATE User SET Password_Reset_Token = ?, Password_Reset_Expires = ? WHERE User_ID = ?',
    [resetToken, resetExpires, user.User_ID],
    (errUpdate) => {
      if (errUpdate) {
        console.error('❌ Error storing token:', errUpdate);
        process.exit(1);
      }

      console.log('✅ Token stored in database');

      // Step 3: Try to retrieve it
      db.get(
        `SELECT User_ID, Email, First_Name FROM User 
         WHERE Password_Reset_Token = ? 
         AND Password_Reset_Expires > datetime('now')
         AND Is_Active = 1`,
        [resetToken],
        (errGet, foundUser) => {
          if (errGet) {
            console.error('❌ Error retrieving token:', errGet);
            process.exit(1);
          }

          if (!foundUser) {
            console.error('❌ Could not find user with valid token!');
            
            // Debug: check what's in the DB
            db.get(
              `SELECT User_ID, Email, Password_Reset_Token, Password_Reset_Expires FROM User WHERE User_ID = ?`,
              [user.User_ID],
              (errDebug, debugUser) => {
                console.log('\n📋 Debug Info:');
                console.log('  Stored Token:', debugUser?.Password_Reset_Token?.substring(0, 8) + '...' || 'NULL');
                console.log('  Stored Expires:', debugUser?.Password_Reset_Expires || 'NULL');
                console.log('  Current Time:', new Date().toISOString());
                process.exit(1);
              }
            );
          } else {
            console.log('✅ Token found! Ready to reset password');
            console.log('\n📌 Test successful. Token:', resetToken);
            process.exit(0);
          }
        }
      );
    }
  );
});
