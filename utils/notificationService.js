const db = require('../config/db');
const {
  notifySuperAdmin,
  notifyOrgAdmin,
  notifyEmployee,
  notifyOrg,
  notifyUser,
  getIo
} = require('./socket');

/**
 * Create a notification and broadcast via Socket.io
 * @param {Object} data - Notification data
 * @returns {Promise} Resolves when notification is created and broadcast
 */
const createNotification = async (data) => {
  return new Promise((resolve, reject) => {
    const {
      userId,
      orgId,
      title,
      message,
      type = 'info',
      category = 'general',
      actionUrl = null,
      broadcastToRole = null, // 'superadmin', 'org_admin', 'employee', 'org'
    } = data;

    const sql = `
      INSERT INTO Notification (User_ID, Org_ID, Title, Message, Type, Category, Action_URL, Is_Read, Created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `;

    const params = [userId, orgId || null, title, message, type, category, actionUrl];

    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Notification creation error:', err.message);
        return reject(err);
      }

      const notifyId = this.lastID;
      const notificationPayload = {
        Notify_ID: notifyId,
        title,
        message,
        type,
        category,
        actionUrl,
        timestamp: new Date().toISOString()
      };

      // Broadcast to specific channel if provided
      if (broadcastToRole === 'superadmin') {
        try {
          notifySuperAdmin(notificationPayload);
        } catch (e) {
          console.warn('⚠️ Socket broadcast failed:', e.message);
        }
      } else if (broadcastToRole === 'org_admin' && orgId) {
        try {
          notifyOrgAdmin(orgId, notificationPayload);
        } catch (e) {
          console.warn('⚠️ Socket broadcast failed:', e.message);
        }
      } else if (broadcastToRole === 'employee' && orgId) {
        try {
          notifyEmployee(orgId, notificationPayload);
        } catch (e) {
          console.warn('⚠️ Socket broadcast failed:', e.message);
        }
      } else if (broadcastToRole === 'org' && orgId) {
        try {
          notifyOrg(orgId, notificationPayload);
        } catch (e) {
          console.warn('⚠️ Socket broadcast failed:', e.message);
        }
      } else if (userId) {
        // Default to user-specific notification
        try {
          notifyUser(userId, notificationPayload);
        } catch (e) {
          console.warn('⚠️ Socket broadcast failed:', e.message);
        }
      }

      console.log(`✅ Notification created: ${title} (ID: ${notifyId})`);
      resolve({ Notify_ID: notifyId, ...data });
    });
  });
};

/**
 * SUPERADMIN NOTIFICATIONS
 */

// 1. New Organization Registered
const notifyNewOrganization = async (orgData) => {
  console.log(`📢 [ORG_REGISTERED] New org: ${orgData.Org_Name}`);

  // Get SuperAdmin user
  return new Promise((resolve) => {
    db.get('SELECT User_ID FROM User WHERE User_Type_ID = 1 LIMIT 1', async (err, superAdmin) => {
      if (!superAdmin) {
        console.warn('⚠️ No SuperAdmin found');
        return resolve(null);
      }

      try {
        await createNotification({
          userId: superAdmin.User_ID,
          orgId: orgData.Org_ID,
          title: '🏢 New Organization Registered',
          message: `${orgData.Org_Name} has registered and is awaiting verification.`,
          type: 'success',
          category: 'organization',
          actionUrl: `/superadmin/organizations/${orgData.Org_ID}`,
          broadcastToRole: 'superadmin'
        });
        resolve(true);
      } catch (e) {
        console.error('❌ Failed to notify org registration:', e);
        resolve(null);
      }
    });
  });
};

// 2. Organization Verified
const notifyOrgVerified = async (orgId, orgName) => {
  console.log(`📢 [ORG_VERIFIED] Org verified: ${orgName}`);

  return new Promise((resolve) => {
    // Find org admin
    db.get(
      'SELECT User_ID FROM User WHERE Org_ID = ? AND User_Type_ID = 1 LIMIT 1',
      [orgId],
      async (err, orgAdmin) => {
        if (!orgAdmin) return resolve(null);

        try {
          await createNotification({
            userId: orgAdmin.User_ID,
            orgId,
            title: '✅ Organization Verified',
            message: `Your organization "${orgName}" has been verified successfully! You can now start using the platform.`,
            type: 'success',
            category: 'organization',
            actionUrl: '/admin/dashboard',
            broadcastToRole: 'org_admin'
          });
          resolve(true);
        } catch (e) {
          console.error('❌ Failed to notify org verification:', e);
          resolve(null);
        }
      }
    );
  });
};

// 3. Organization Rejected
const notifyOrgRejected = async (orgId, orgName, reason) => {
  console.log(`📢 [ORG_REJECTED] Org rejected: ${orgName}`);

  return new Promise((resolve) => {
    db.get(
      'SELECT User_ID FROM User WHERE Org_ID = ? AND User_Type_ID = 1 LIMIT 1',
      [orgId],
      async (err, orgAdmin) => {
        if (!orgAdmin) return resolve(null);

        try {
          await createNotification({
            userId: orgAdmin.User_ID,
            orgId,
            title: '❌ Organization Verification Rejected',
            message: `Your organization verification was rejected. ${reason ? 'Reason: ' + reason : ''}`,
            type: 'error',
            category: 'organization',
            actionUrl: '/admin/support',
            broadcastToRole: 'org_admin'
          });
          resolve(true);
        } catch (e) {
          console.error('❌ Failed to notify org rejection:', e);
          resolve(null);
        }
      }
    );
  });
};

/**
 * ORGANIZATION ADMIN NOTIFICATIONS
 */

// 4. Employee Added (notify admin)
const notifyEmployeeAdded = async (userId, firstName, surName, orgId, orgName) => {
  console.log(`📢 [EMPLOYEE_ADDED] New employee: ${firstName} ${surName}`);

  return new Promise((resolve) => {
    // Notify org admin
    db.get(
      'SELECT User_ID FROM User WHERE Org_ID = ? AND User_Type_ID = 1 LIMIT 1',
      [orgId],
      async (err, orgAdmin) => {
        if (!orgAdmin) return resolve(null);

        try {
          await createNotification({
            userId: orgAdmin.User_ID,
            orgId,
            title: '👤 New Employee Added',
            message: `${firstName} ${surName} has been added to your organization.`,
            type: 'info',
            category: 'employee',
            actionUrl: `/admin/employees/${userId}`,
            broadcastToRole: 'org_admin'
          });
          resolve(true);
        } catch (e) {
          console.error('❌ Failed to notify employee added:', e);
          resolve(null);
        }
      }
    );
  });
};

// 5. Department Created (notify admin)
const notifyDepartmentCreated = async (deptName, orgId, orgName, deptId) => {
  console.log(`📢 [DEPT_CREATED] New department: ${deptName}`);

  return new Promise((resolve) => {
    // Notify org admin
    db.get(
      'SELECT User_ID FROM User WHERE Org_ID = ? AND User_Type_ID = 1 LIMIT 1',
      [orgId],
      async (err, orgAdmin) => {
        if (!orgAdmin) return resolve(null);

        try {
          await createNotification({
            userId: orgAdmin.User_ID,
            orgId,
            title: '🏢 New Department Created',
            message: `${deptName} department has been created in your organization.`,
            type: 'info',
            category: 'department',
            actionUrl: `/admin/settings/departments/${deptId}`,
            broadcastToRole: 'org_admin'
          });
          resolve(true);
        } catch (e) {
          console.error('❌ Failed to notify dept created:', e);
          resolve(null);
        }
      }
    );
  });
};

// 6. Location Created (notify admin)
const notifyLocationCreated = async (locationName, orgId, orgName, locationId) => {
  console.log(`📢 [LOCATION_CREATED] New location: ${locationName}`);

  return new Promise((resolve) => {
    // Notify org admin
    db.get(
      'SELECT User_ID FROM User WHERE Org_ID = ? AND User_Type_ID = 1 LIMIT 1',
      [orgId],
      async (err, orgAdmin) => {
        if (!orgAdmin) return resolve(null);

        try {
          await createNotification({
            userId: orgAdmin.User_ID,
            orgId,
            title: '📍 New Location Created',
            message: `${locationName} location has been added to your organization.`,
            type: 'info',
            category: 'location',
            actionUrl: `/admin/settings/locations/${locationId}`,
            broadcastToRole: 'org_admin'
          });
          resolve(true);
        } catch (e) {
          console.error('❌ Failed to notify location created:', e);
          resolve(null);
        }
      }
    );
  });
};

/**
 * EMPLOYEE NOTIFICATIONS
 */

// 7. Employee Added (notify employee)
const notifyEmployeeOnboarding = async (userId, firstName, orgName) => {
  console.log(`📢 [EMPLOYEE_ONBOARD] Employee onboarded: ${firstName}`);

  return new Promise((resolve) => {
    try {
      createNotification({
        userId,
        title: '👋 Welcome to TrackTimi',
        message: `You have been added as an employee at ${orgName}. Start checking in using the mobile app or web dashboard.`,
        type: 'success',
        category: 'employee',
        actionUrl: '/employee/dashboard',
        broadcastToRole: null // Personal notification
      }).then(resolve).catch(() => resolve(null));
    } catch (e) {
      console.error('❌ Failed to notify employee onboarding:', e);
      resolve(null);
    }
  });
};

// 8. Employee Assigned to Department
const notifyEmployeeDepartmentAssignment = async (userId, deptName) => {
  console.log(`📢 [DEPT_ASSIGNED] Employee assigned to dept: ${deptName}`);

  return new Promise((resolve) => {
    try {
      createNotification({
        userId,
        title: '🏢 Department Assignment',
        message: `You have been assigned to the ${deptName} department.`,
        type: 'info',
        category: 'department',
        actionUrl: '/employee/profile',
        broadcastToRole: null
      }).then(resolve).catch(() => resolve(null));
    } catch (e) {
      console.error('❌ Failed to notify dept assignment:', e);
      resolve(null);
    }
  });
};

// 9. Employee Assigned to Location
const notifyEmployeeLocationAssignment = async (userId, locationName) => {
  console.log(`📢 [LOCATION_ASSIGNED] Employee assigned to location: ${locationName}`);

  return new Promise((resolve) => {
    try {
      createNotification({
        userId,
        title: '📍 Location Assignment',
        message: `You have been assigned to ${locationName}. You must check in from this location.`,
        type: 'info',
        category: 'location',
        actionUrl: '/employee/profile',
        broadcastToRole: null
      }).then(resolve).catch(() => resolve(null));
    } catch (e) {
      console.error('❌ Failed to notify location assignment:', e);
      resolve(null);
    }
  });
};

// 10. Organization Announcement (broadcast to all employees)
const notifyOrgAnnouncement = async (orgId, title, message, actionUrl = null) => {
  console.log(`📢 [ORG_ANNOUNCEMENT] To org ${orgId}: ${title}`);

  return new Promise((resolve) => {
    // Find org admin to create the notification under
    db.get(
      'SELECT User_ID FROM User WHERE Org_ID = ? AND User_Type_ID = 1 LIMIT 1',
      [orgId],
      async (err, orgAdmin) => {
        if (!orgAdmin) {
          console.warn('⚠️ No org admin found for announcement');
          return resolve(null);
        }

        try {
          await createNotification({
            userId: orgAdmin.User_ID,
            orgId,
            title,
            message,
            type: 'announcement',
            category: 'announcement',
            actionUrl,
            broadcastToRole: 'org' // Broadcast to everyone in the org
          });
          resolve(true);
        } catch (e) {
          console.error('❌ Failed to send announcement:', e);
          resolve(null);
        }
      }
    );
  });
};

module.exports = {
  createNotification,
  // SuperAdmin
  notifyNewOrganization,
  notifyOrgVerified,
  notifyOrgRejected,
  // Org Admin
  notifyEmployeeAdded,
  notifyDepartmentCreated,
  notifyLocationCreated,
  // Employee
  notifyEmployeeOnboarding,
  notifyEmployeeDepartmentAssignment,
  notifyEmployeeLocationAssignment,
  // Broadcast
  notifyOrgAnnouncement
};
