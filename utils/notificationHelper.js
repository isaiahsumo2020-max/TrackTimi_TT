const db = require('../config/db');

/**
 * Create a notification for a specific event
 * @param {Object} notificationData - { userId, orgId, title, message, type, category, actionUrl }
 */
const createNotification = (notificationData, callback) => {
  console.log('📢 Creating notification:', {
    userId: notificationData.userId,
    orgId: notificationData.orgId,
    title: notificationData.title,
    category: notificationData.category
  });
  
  const sql = `
    INSERT INTO Notification (User_ID, Org_ID, Title, Message, Type, Category, Action_URL, Is_Read, Created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
  `;

  const params = [
    notificationData.userId,
    notificationData.orgId || null,
    notificationData.title,
    notificationData.message,
    notificationData.type || 'info',
    notificationData.category || 'general',
    notificationData.actionUrl || null,
    0  // Is_Read = 0 (unread by default)
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('❌ Notification creation error:', err.message);
      console.error('❌ Full error:', err);
      if (callback) return callback(err);
    }
    
    const notifyId = this.lastID;
    console.log('✅ Notification created successfully. Notify_ID:', notifyId);
    
    // Broadcast real-time notification via Socket.IO
    try {
      const { getIo } = require('./socket');
      const io = getIo();
      
      // Send to specific user if notification is for them
      io.to(`user:${notificationData.userId}`).emit('notification:new', {
        Notify_ID: notifyId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        category: notificationData.category || 'general',
        timestamp: new Date().toISOString(),
        actionUrl: notificationData.actionUrl || null
      });
      
      console.log(`📡 Real-time notification broadcast to user:${notificationData.userId}`);
    } catch (socketErr) {
      console.warn('⚠️ Socket.IO broadcast failed (user may be offline):', socketErr.message);
    }
    
    if (callback) callback(null, { Notify_ID: notifyId, ...notificationData });
  });
};

/**
 * Notify SuperAdmin about new organization
 */
const notifyNewOrganization = (orgData, callback) => {
  // Notify the main superadmin (User_ID = 1)
  console.log('\n📌 [ORG CREATION] Starting notification trigger...');
  console.log('📌 [ORG CREATION] Org Data:', orgData);
  console.log('📢 Notifying superadmin about new organization:', orgData.Org_Name);
  
  createNotification({
    userId: 1, // SuperAdmin ID
    orgId: orgData.Org_ID,
    title: '🏢 New Organization Created',
    message: `${orgData.Org_Name} has been registered to the platform`,
    type: 'success',
    category: 'organization',
    actionUrl: `/superadmin/organizations/${orgData.Org_ID}`
  }, (err) => {
    if (err) {
      console.error('❌ [ORG CREATION] Failed to create notification:', err);
      if (callback) callback(err);
    } else {
      console.log('✅ [ORG CREATION] Notification trigger completed successfully');
      if (callback) callback(null);
    }
  });
};

/**
 * Notify SuperAdmin and Organization Admin about new user
 */
const notifyNewUser = (userData, orgData, callback) => {
  // Notify the superadmin (User_ID = 1)
  console.log('📢 Notifying superadmin about new user:', userData.First_Name, userData.SurName);
  
  createNotification({
    userId: 1, // SuperAdmin ID
    orgId: orgData?.Org_ID,
    title: '👤 New User Registered',
    message: `${userData.First_Name} ${userData.SurName} (${userData.Email}) joined ${orgData?.Org_Name || 'the platform'}`,
    type: 'success',
    category: 'user',
    actionUrl: `/superadmin/users/${userData.User_ID}`
  });

  // Also notify org admin
  if (orgData?.Org_ID) {
    db.get(
      'SELECT User_ID FROM User WHERE Org_ID = ? AND User_Type_ID = 1 LIMIT 1',
      [orgData.Org_ID],
      (err, orgAdmin) => {
        if (orgAdmin) {
          console.log('📢 Notifying org admin (userId:', orgAdmin.User_ID, ') about new user');
          createNotification({
            userId: orgAdmin.User_ID,
            orgId: orgData.Org_ID,
            title: '👤 New Employee Added',
            message: `${userData.First_Name} ${userData.SurName} has been added to your organization`,
            type: 'success',
            category: 'user',
            actionUrl: `/admin/employees/${userData.User_ID}`
          });
        }
        if (callback) callback(null);
      }
    );
  } else {
    if (callback) callback(null);
  }
};

/**
 * Notify SuperAdmin and Organization Admin about new department
 */
const notifyNewDepartment = (deptData, orgData, callback) => {
  // Notify the superadmin (User_ID = 1)
  console.log('📢 Notifying superadmin about new department:', deptData.Depart_Name);
  
  createNotification({
    userId: 1, // SuperAdmin ID
    orgId: orgData?.Org_ID,
    title: '🏢 New Department Created',
    message: `${deptData.Depart_Name} department added to ${orgData?.Org_Name}`,
    type: 'info',
    category: 'department',
    actionUrl: `/superadmin/departments/${deptData.Dep_ID}`
  });

  // Also notify org admin
  if (orgData?.Org_ID) {
    db.get(
      'SELECT User_ID FROM User WHERE Org_ID = ? AND User_Type_ID = 1 LIMIT 1',
      [orgData.Org_ID],
      (err, orgAdmin) => {
        if (orgAdmin) {
          console.log('📢 Notifying org admin (userId:', orgAdmin.User_ID, ') about new department');
          createNotification({
            userId: orgAdmin.User_ID,
            orgId: orgData.Org_ID,
            title: '🏢 New Department Created',
            message: `${deptData.Depart_Name} department has been created in your organization`,
            type: 'success',
            category: 'department',
            actionUrl: `/admin/settings`
          });
        }
        if (callback) callback(null);
      }
    );
  } else {
    if (callback) callback(null);
  }
};

/**
 * Notify SuperAdmin and Organization Admin about new geofence/location
 */
const notifyNewGeofence = (geofenceData, orgData, callback) => {
  // Notify the superadmin (User_ID = 1)
  console.log('📢 Notifying superadmin about new geofence:', geofenceData.Location_Name);
  
  const geofenceId = geofenceData.Fence_ID || geofenceData.Geofence_ID;
  
  createNotification({
    userId: 1, // SuperAdmin ID
    orgId: orgData?.Org_ID,
    title: '📍 New Location Added',
    message: `${geofenceData.Location_Name} (${geofenceData.Latitude}, ${geofenceData.Longitude}) added to ${orgData?.Org_Name}. Radius: ${geofenceData.Radius}m`,
    type: 'info',
    category: 'location',
    actionUrl: `/superadmin/geofences/${geofenceId}`
  });

  // Also notify org admin
  if (orgData?.Org_ID) {
    db.get(
      'SELECT User_ID FROM User WHERE Org_ID = ? AND User_Type_ID = 1 LIMIT 1',
      [orgData.Org_ID],
      (err, orgAdmin) => {
        if (orgAdmin) {
          console.log('📢 Notifying org admin (userId:', orgAdmin.User_ID, ') about new geofence');
          createNotification({
            userId: orgAdmin.User_ID,
            orgId: orgData.Org_ID,
            title: '📍 New Location Added',
            message: `${geofenceData.Location_Name} has been added to your organization (Radius: ${geofenceData.Radius}m)`,
            type: 'success',
            category: 'location',
            actionUrl: `/admin/settings`
          });
        }
        if (callback) callback(null);
      }
    );
  } else {
    if (callback) callback(null);
  }
};

/**
 * Notify about attendance milestone
 */
const notifyAttendanceMilestone = (userId, milestone, callback) => {
  // Notify superadmin (User_ID = 1)
  createNotification({
    userId: 1,
    title: `📊 ${milestone.title}`,
    message: milestone.message,
    type: 'warning',
    category: 'attendance'
  });

  if (callback) callback(null);
};

/**
 * Notify about system alert
 */
const notifySystemAlert = (alertData, callback) => {
  // Notify superadmin (User_ID = 1)
  createNotification({
    userId: 1,
    title: alertData.title || '⚠️ System Alert',
    message: alertData.message,
    type: alertData.type || 'warning',
    category: 'system',
    actionUrl: alertData.actionUrl || null
  });

  if (callback) callback(null);
};

/**
 * Notify organization admin about their actions (user invitation, department creation, etc.)
 */
const notifyOrgAdminAction = (userId, orgId, title, message, category = 'general', actionUrl = null, callback) => {
  // Notify the organization admin (the user performing the action)
  console.log(`📢 Notifying org admin (userId: ${userId}) about action in org ${orgId}`);
  
  createNotification({
    userId,
    orgId,
    title,
    message,
    type: 'success',
    category,
    actionUrl
  }, (err) => {
    if (err) {
      console.error('❌ Failed to create org admin notification:', err);
    } else {
      console.log('✅ Org admin notification created successfully');
    }
    if (callback) callback(err);
  });

  // Also notify SuperAdmin about significant org admin actions
  // (Invitations, department creation, geofence creation)
  const significantActions = ['user', 'department', 'location'];
  if (significantActions.includes(category)) {
    console.log(`📢 Also notifying SuperAdmin about org admin action: ${category}`);
    
    // Get organization name for context
    db.get('SELECT Org_Name FROM Organization WHERE Org_ID = ?', [orgId], (err, org) => {
      const orgName = org?.Org_Name || 'Organization';
      
      createNotification({
        userId: 1, // SuperAdmin
        orgId,
        title: `📋 Org Admin Action: ${title}`,
        message: `[${orgName}] ${message}`,
        type: 'info',
        category: `org_${category}`,
        actionUrl
      }, (err) => {
        if (err) {
          console.error('❌ Failed to notify SuperAdmin about org action:', err);
        } else {
          console.log('✅ SuperAdmin notified about org admin action');
        }
      });
    });
  }
};

/**
 * Notify about subscription/billing event
 */
const notifySubscriptionEvent = (eventData, callback) => {
  // Notify superadmin (User_ID = 1)
  createNotification({
    userId: 1,
    orgId: eventData.orgId,
    title: eventData.title || '💳 Subscription Update',
    message: eventData.message,
    type: eventData.type || 'info',
    category: 'billing'
  });

  if (callback) callback(null);
};

module.exports = {
  createNotification,
  notifyNewOrganization,
  notifyNewUser,
  notifyNewDepartment,
  notifyNewGeofence,
  notifyAttendanceMilestone,
  notifySystemAlert,
  notifyOrgAdminAction,
  notifySubscriptionEvent
};
