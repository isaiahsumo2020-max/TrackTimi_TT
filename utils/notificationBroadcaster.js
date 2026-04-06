/**
 * Notification Broadcaster Utility
 * Handles real-time notification broadcast to users via Socket.IO + Database
 */

const db = require('../config/db');
const { getIo } = require('./socket');

class NotificationBroadcaster {
  
  /**
   * Send notification to specific user(s)
   * @param {number|array} userId - Single user ID or array of user IDs
   * @param {object} notifData - { title, message, type, category, actionUrl, relatedRecordId }
   */
  static async notifyUser(userId, notifData) {
    try {
      const userIds = Array.isArray(userId) ? userId : [userId];
      
      for (const uid of userIds) {
        // Save to database
        const sql = `
          INSERT INTO Notification 
          (User_ID, Org_ID, Title, Message, Type, Category, Action_URL, Related_Record_ID)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
          uid,
          notifData.orgId || null,
          notifData.title,
          notifData.message,
          notifData.type || 'info',
          notifData.category || 'general',
          notifData.actionUrl || null,
          notifData.relatedRecordId || null
        ];
        
        db.run(sql, params, (err) => {
          if (err) {
            console.error('❌ Failed to save notification:', err.message);
            return;
          }
          
          // Broadcast real-time via Socket.IO
          try {
            const io = getIo();
            io.to(`user:${uid}`).emit('notification', {
              title: notifData.title,
              message: notifData.message,
              type: notifData.type,
              category: notifData.category,
              timestamp: new Date().toISOString()
            });
          } catch (socketErr) {
            console.warn('⚠️ Socket.IO broadcast failed (user may be offline):', socketErr.message);
          }
        });
      }
    } catch (err) {
      console.error('❌ notifyUser error:', err);
    }
  }

  /**
   * Broadcast to entire organization
   * @param {number} orgId - Organization ID
   * @param {object} notifData - Notification data
   * @param {array} excludeUserIds - User IDs to exclude
   */
  static async notifyOrganization(orgId, notifData, excludeUserIds = []) {
    try {
      // Get all users in organization
      const sql = `
        SELECT User_ID FROM User 
        WHERE Org_ID = ? AND Is_Active = 1
      `;
      
      db.all(sql, [orgId], (err, users) => {
        if (err) {
          console.error('❌ Failed to get org users:', err.message);
          return;
        }
        
        // Filter out excluded users
        const targetUsers = users
          .map(u => u.User_ID)
          .filter(uid => !excludeUserIds.includes(uid));
        
        // Notify all users in org
        this.notifyUser(targetUsers, { ...notifData, orgId });
      });
    } catch (err) {
      console.error('❌ notifyOrganization error:', err);
    }
  }

  /**
   * Broadcast to admins only
   */
  static async notifyAdmins(orgId, notifData) {
    try {
      const sql = `
        SELECT User_ID FROM User 
        WHERE Org_ID = ? AND User_Type_ID = 1 AND Is_Active = 1
      `;
      
      db.all(sql, [orgId], (err, admins) => {
        if (err) {
          console.error('❌ Failed to get admins:', err.message);
          return;
        }
        
        const adminIds = admins.map(a => a.User_ID);
        this.notifyUser(adminIds, { ...notifData, orgId });
      });
    } catch (err) {
      console.error('❌ notifyAdmins error:', err);
    }
  }

  /**
   * Broadcast to department members
   */
  static async notifyDepartment(departmentId, notifData) {
    try {
      const sql = `
        SELECT DISTINCT u.User_ID FROM User u
        JOIN Attendance a ON u.User_ID = a.User_ID
        WHERE a.Depart_ID = ? AND u.Is_Active = 1
        GROUP BY u.User_ID
      `;
      
      db.all(sql, [departmentId], (err, users) => {
        if (err) {
          console.error('❌ Failed to get dept users:', err.message);
          return;
        }
        
        const userIds = users.map(u => u.User_ID);
        this.notifyUser(userIds, notifData);
      });
    } catch (err) {
      console.error('❌ notifyDepartment error:', err);
    }
  }

  /**
   * Notification event: Employee Check-in
   */
  static async onEmployeeCheckin(empData) {
    return this.notifyAdmins(empData.orgId, {
      title: `✅ Employee Check-in`,
      message: `${empData.firstName} ${empData.lastName} checked in at ${new Date().toLocaleTimeString()}`,
      type: 'success',
      category: 'attendance',
      actionUrl: `/employees/${empData.userId}`,
      relatedRecordId: empData.userId
    });
  }

  /**
   * Notification event: Employee Status Change
   */
  static async onEmployeeStatusChange(empData, oldStatus, newStatus) {
    const statusText = newStatus ? 'Activated' : 'Deactivated';
    return this.notifyAdmins(empData.orgId, {
      title: `🔄 Employee Status Changed`,
      message: `${empData.firstName} ${empData.lastName} has been ${statusText}`,
      type: 'info',
      category: 'employee',
      actionUrl: `/employees/${empData.userId}`,
      relatedRecordId: empData.userId
    });
  }

  /**
   * Notification event: Employee Department Assignment
   */
  static async onEmployeeDepartmentAssign(empData, deptName) {
    return this.notifyAdmins(empData.orgId, {
      title: `🏢 Department Assignment`,
      message: `${empData.firstName} ${empData.lastName} assigned to ${deptName}`,
      type: 'info',
      category: 'employee',
      actionUrl: `/employees/${empData.userId}`,
      relatedRecordId: empData.userId
    });
  }

  /**
   * Notification event: Employee Deleted
   */
  static async onEmployeeDeleted(empData) {
    return this.notifyAdmins(empData.orgId, {
      title: `🗑️ Employee Removed`,
      message: `${empData.firstName} ${empData.lastName} has been deleted from the system`,
      type: 'warning',
      category: 'employee',
      relatedRecordId: empData.userId
    });
  }

  /**
   * Notification event: User Profile Update
   */
  static async onUserProfileUpdate(userData) {
    return this.notifyAdmins(userData.orgId, {
      title: `👤 Profile Updated`,
      message: `User ${userData.email} updated their profile`,
      type: 'info',
      category: 'user',
      actionUrl: `/users/${userData.userId}`,
      relatedRecordId: userData.userId
    });
  }

  /**
   * Notification event: User Invitation Sent
   */
  static async onInvitationSent(invitationData) {
    return this.notifyAdmins(invitationData.orgId, {
      title: `📧 Invitation Sent`,
      message: `Invitation sent to ${invitationData.email}`,
      type: 'info',
      category: 'invitation',
      actionUrl: `/invitations`,
      relatedRecordId: invitationData.inviteId
    });
  }

  /**
   * Notification event: User Accepted Invitation
   */
  static async onInvitationAccepted(userData) {
    return this.notifyAdmins(userData.orgId, {
      title: `✅ Invitation Accepted`,
      message: `${userData.email} has accepted the invitation and joined the organization`,
      type: 'success',
      category: 'invitation',
      actionUrl: `/employees/${userData.userId}`,
      relatedRecordId: userData.userId
    });
  }

  /**
   * Notification event: Shift Assignment
   */
  static async onShiftAssignment(empData, shiftName) {
    return this.notifyAdmins(empData.orgId, {
      title: `📅 Shift Assigned`,
      message: `${empData.firstName} ${empData.lastName} assigned to ${shiftName} shift`,
      type: 'info',
      category: 'shift',
      actionUrl: `/employees/${empData.userId}`,
      relatedRecordId: empData.userId
    });
  }

  /**
   * Notification event: Attendance Anomaly (Late arrival, Early departure, etc.)
   */
  static async onAttendanceAnomaly(empData, anomalyType, details) {
    const typeMap = {
      'late': '⏰ Late Arrival',
      'early-departure': '🚪 Early Departure',
      'no-show': '❌ No Show',
      'overtime': '⏱️ Overtime'
    };
    
    return this.notifyAdmins(empData.orgId, {
      title: typeMap[anomalyType] || '🚨 Attendance Anomaly',
      message: `${empData.firstName} ${empData.lastName}: ${details}`,
      type: 'warning',
      category: 'attendance',
      actionUrl: `/employees/${empData.userId}`,
      relatedRecordId: empData.userId
    });
  }

  /**
   * Notification event: System Alert
   */
  static async onSystemAlert(orgId, alertTitle, alertMessage) {
    return this.notifyAdmins(orgId, {
      title: alertTitle,
      message: alertMessage,
      type: 'error',
      category: 'system',
      relatedRecordId: null
    });
  }

  /**
   * SUPERADMIN NOTIFICATIONS - Actions on organizations
   */

  /**
   * Notification event: SuperAdmin Created Organization
   */
  static async onOrgCreated(orgData) {
    return this.notifyAdmins(orgData.orgId, {
      title: `🎉 Organization Created`,
      message: `Your organization "${orgData.orgName}" has been created by SuperAdmin`,
      type: 'success',
      category: 'organization',
      actionUrl: `/dashboard`,
      relatedRecordId: orgData.orgId
    });
  }

  /**
   * Notification event: SuperAdmin Updated Organization Settings
   */
  static async onOrgSettingsUpdated(orgData, changedFields) {
    const fieldsList = Object.keys(changedFields).join(', ');
    return this.notifyAdmins(orgData.orgId, {
      title: `⚙️ Organization Settings Updated`,
      message: `SuperAdmin updated: ${fieldsList}`,
      type: 'info',
      category: 'organization',
      actionUrl: `/settings`,
      relatedRecordId: orgData.orgId
    });
  }

  /**
   * Notification event: SuperAdmin Changed Subscription Plan
   */
  static async onSubscriptionChanged(orgData, oldPlan, newPlan) {
    return this.notifyAdmins(orgData.orgId, {
      title: `📊 Subscription Plan Changed`,
      message: `Plan upgraded from ${oldPlan} to ${newPlan}`,
      type: 'info',
      category: 'subscription',
      actionUrl: `/settings/billing`,
      relatedRecordId: orgData.orgId
    });
  }

  /**
   * Notification event: SuperAdmin Suspended Organization
   */
  static async onOrgSuspended(orgData, reason) {
    return this.notifyAdmins(orgData.orgId, {
      title: `⛔ Organization Suspended`,
      message: `Your organization has been suspended. Reason: ${reason}`,
      type: 'error',
      category: 'organization',
      relatedRecordId: orgData.orgId
    });
  }

  /**
   * Notification event: SuperAdmin Reactivated Organization
   */
  static async onOrgReactivated(orgData) {
    return this.notifyAdmins(orgData.orgId, {
      title: `✅ Organization Reactivated`,
      message: `Your organization has been reactivated by SuperAdmin`,
      type: 'success',
      category: 'organization',
      actionUrl: `/dashboard`,
      relatedRecordId: orgData.orgId
    });
  }

  /**
   * Notification event: SuperAdmin Sent Message to Organization
   */
  static async onOrgMessage(orgData, messageTitle, messageBody) {
    return this.notifyAdmins(orgData.orgId, {
      title: messageTitle,
      message: messageBody,
      type: 'info',
      category: 'announcement',
      relatedRecordId: orgData.orgId
    });
  }

  /**
   * Notification event: SuperAdmin Updated Organization Limits
   */
  static async onLimitsUpdated(orgData, limitType, oldLimit, newLimit) {
    return this.notifyAdmins(orgData.orgId, {
      title: `📈 Usage Limits Updated`,
      message: `${limitType} limit changed from ${oldLimit} to ${newLimit}`,
      type: 'info',
      category: 'organization',
      actionUrl: `/settings`,
      relatedRecordId: orgData.orgId
    });
  }

  /**
   * Notification event: SuperAdmin Added Feature to Organization
   */
  static async onFeatureAdded(orgData, featureName) {
    return this.notifyAdmins(orgData.orgId, {
      title: `⭐ New Feature Enabled`,
      message: `${featureName} feature has been enabled for your organization`,
      type: 'success',
      category: 'feature',
      relatedRecordId: orgData.orgId
    });
  }

  /**
   * Notification event: SuperAdmin Disabled Feature
   */
  static async onFeatureDisabled(orgData, featureName) {
    return this.notifyAdmins(orgData.orgId, {
      title: `🔒 Feature Disabled`,
      message: `${featureName} feature has been disabled`,
      type: 'warning',
      category: 'feature',
      relatedRecordId: orgData.orgId
    });
  }
}

module.exports = NotificationBroadcaster;
