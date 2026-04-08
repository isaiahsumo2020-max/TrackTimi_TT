const http = require('http');
const db = require('./config/db');

console.log('🧪 Full End-to-End Password Reset Test\n');

// Step 1: Call request-password-reset
console.log('📧 Step 1: Requesting password reset...');

const testEmail = 'abrahamfallahjr@gmail.com';

const requestData = JSON.stringify({ email: testEmail });

const requestOptions = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/request-password-reset',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData)
  }
};

const requestReq = http.request(requestOptions, (requestRes) => {
  let data = '';
  
  requestRes.on('data', (chunk) => {
    data += chunk;
  });
  
  requestRes.on('end', () => {
    console.log('✅ Request status:', requestRes.statusCode);
    console.log('✅ Response:', data);
    
    if (requestRes.statusCode === 200) {
      // Step 2: Get the token from database
      setTimeout(() => {
        console.log('\n📋 Step 2: Retrieving token from database...');
        
        db.get(
          'SELECT User_ID, Password_Reset_Token, Password_Reset_Expires FROM User WHERE Email = ?',
          [testEmail],
          (err, user) => {
            if (err) {
              console.error('❌ DB error:', err);
              process.exit(1);
            }
            
            if (!user || !user.Password_Reset_Token) {
              console.error('❌ No reset token found in database');
              process.exit(1);
            }
            
            console.log('✅ Token found:', user.Password_Reset_Token.substring(0, 8) + '...');
            console.log('⏰ Expires:', user.Password_Reset_Expires);
            
            // Step 3: Call reset-password
            console.log('\n🔑 Step 3: Resetting password with token...');
            
            const resetData = JSON.stringify({
              token: user.Password_Reset_Token,
              newPassword: 'TestPass123',
              confirmPassword: 'TestPass123'
            });
            
            const resetOptions = {
              hostname: 'localhost',
              port: 4000,
              path: '/api/auth/reset-password',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(resetData)
              }
            };
            
            const resetReq = http.request(resetOptions, (resetRes) => {
              let resetResponseData = '';
              
              resetRes.on('data', (chunk) => {
                resetResponseData += chunk;
              });
              
              resetRes.on('end', () => {
                console.log('✅ Reset status:', resetRes.statusCode);
                console.log('✅ Response:', resetResponseData);
                
                if (resetRes.statusCode === 200) {
                  console.log('\n✅ SUCCESS! Password reset works correctly');
                } else {
                  console.log('\n❌ FAILED! Password reset returned error');
                }
                
                process.exit(0);
              });
            });
            
            resetReq.on('error', (error) => {
              console.error('❌ Reset request error:', error.message);
              process.exit(1);
            });
            
            resetReq.write(resetData);
            resetReq.end();
          }
        );
      }, 500);
    } else {
      console.error('❌ Request-password-reset failed');
      process.exit(1);
    }
  });
});

requestReq.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});

requestReq.write(requestData);
requestReq.end();
