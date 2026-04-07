/**
 * Test script to verify notification system is working
 * Run with: node test-notifications.js
 */

const db = require('./config/db');
const { 
  notifyNewOrganization,
  notifyEmployeeAdded,
  notifyDepartmentCreated,
  notifyLocationCreated,
  notifyEmployeeOnboarding
} = require('./utils/notificationService');

console.log('🧪 Testing Notification System\n');

const runTests = async () => {
  try {
    // Get first superadmin and org
    const superAdmin = await new Promise((resolve) => {
      db.get('SELECT User_ID FROM User WHERE User_Type_ID = 1 LIMIT 1', (err, row) => resolve(row));
    });

    const org = await new Promise((resolve) => {
      db.get('SELECT * FROM Organization LIMIT 1', (err, row) => resolve(row));
    });

    console.log('✅ Database connected');
    console.log(`📋 SuperAdmin ID: ${superAdmin?.User_ID}`);
    console.log(`📋 Org ID: ${org?.Org_ID}, Name: ${org?.Org_Name}\n`);

    // Test 1: New Organization Notification
    console.log('📢 Test 1: New Organization Notification');
    const testOrg = {
      Org_ID: org.Org_ID,
      Org_Name: 'Test Organization ' + Date.now()
    };
    await notifyNewOrganization(testOrg);
    console.log('✅ Organization notification sent\n');

    // Test 2: Department Created Notification
    console.log('📢 Test 2: Department Created Notification');
    await notifyDepartmentCreated(
      'Test Department ' + Date.now(),
      org.Org_ID,
      org.Org_Name,
      1
    );
    console.log('✅ Department notification sent\n');

    // Test 3: Location Created Notification
    console.log('📢 Test 3: Location Created Notification');
    await notifyLocationCreated(
      'Test Location ' + Date.now(),
      org.Org_ID,
      org.Org_Name,
      1
    );
    console.log('✅ Location notification sent\n');

    // Test 4: Employee Added Notification
    console.log('📢 Test 4: Employee Added Notification');
    const employee = await new Promise((resolve) => {
      db.get('SELECT User_ID, First_Name, SurName FROM User WHERE User_Type_ID = 3 LIMIT 1', (err, row) => resolve(row));
    });
    
    if (employee) {
      await notifyEmployeeAdded(
        employee.User_ID,
        employee.First_Name,
        employee.SurName,
        org.Org_ID,
        org.Org_Name
      );
      console.log('✅ Employee notification sent\n');
    } else {
      console.log('⏭️  No employees to test\n');
    }

    console.log('✨ All notification tests completed!');
    console.log('\n📥 Check your notification bell for incoming notifications (real-time via Socket.IO)');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

runTests();
