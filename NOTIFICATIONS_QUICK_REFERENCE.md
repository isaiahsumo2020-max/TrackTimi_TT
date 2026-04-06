# Real-Time Notifications - Quick Reference

## 🚀 Quick Start

### Creating a Notification Programmatically

**In any controller/route:**
```javascript
const { notifyNewOrganization } = require('../utils/notificationHelper');

// When creating an organization
const orgData = { Org_ID: 5, Org_Name: 'Tech Institute' };
notifyNewOrganization(orgData);
```

### API Response Format

**GET `/api/superadmin/notifications`**
```json
{
  "notifications": [
    {
      "Notify_ID": 1,
      "Title": "🏢 New Organization Created",
      "Message": "Tech Institute has been registered to the platform",
      "Type": "success",
      "Category": "organization",
      "Is_Read": 0,
      "Created_at": "2024-01-15 10:30:45",
      "Read_at": null,
      "Action_URL": "/superadmin/organizations/5"
    }
  ],
  "unreadCount": 3,
  "counts": {
    "all": 10,
    "unread": 3,
    "organization": 2,
    "user": 5,
    "department": 2,
    "location": 1,
    "attendance": 0,
    "system": 0
  }
}
```

---

## 📋 Available Categories

| Category | Icon | Color | Usage |
|----------|------|-------|-------|
| organization | 🏢 | Blue | New orgs, org updates |
| user | 👤 | Purple | New users, registration |
| department | 🏢 | Green | New depts, dept updates |
| location | 📍 | Orange | Geofences, locations |
| attendance | 📊 | Yellow | Check-ins, milestones |
| system | ⚙️ | Red | System alerts, errors |
| billing | 💳 | Pink | Payment events |
| general | 📢 | Gray | Miscellaneous |

---

## 🎨 Notification Types

```javascript
{
  type: 'success',    // Green - 📧 Success, approval
  type: 'error',      // Red   - ❌ Warnings, failures
  type: 'warning',    // Yellow - ⚠️  Caution items
  type: 'info',       // Blue  - ℹ️  General info
  type: 'break',      // Amber - ☕ Break time
  type: 'shift',      // Indigo - ⏰ Shift events
  type: 'analytics'   // Purple - 📊 Analytics
}
```

---

## 🔧 Common Tasks

### 1. Add Notification Handler for New Event

**Step 1: Create helper function** (`backend/utils/notificationHelper.js`)
```javascript
const notifyNewEvent = (eventData, callback) => {
  console.log('📢 Notifying about new event:', eventData.name);
  
  createNotification({
    userId: 1,
    orgId: eventData.orgId,
    title: '📅 New Event Created',
    message: `${eventData.name} scheduled for ${eventData.date}`,
    type: 'info',
    category: 'general',
    actionUrl: `/superadmin/events/${eventData.id}`
  });

  if (callback) callback(null);
};

module.exports = { notifyNewEvent };
```

**Step 2: Call in controller/route**
```javascript
const { notifyNewEvent } = require('../utils/notificationHelper');

// After creating event
notifyNewEvent(eventData, (err) => {
  if (err) console.error('Notification failed:', err);
});
```

---

### 2. Filter Notifications in Frontend

**In Vue component:**
```javascript
const organizationNotifications = computed(() => {
  return notifications.value.filter(n => n.Category === 'organization');
});

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.Is_Read);
});
```

---

### 3. Test Notification System

**Create test notification:**
```bash
# Get auth token first, then:
curl -X POST http://localhost:4000/api/superadmin/notifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Test Notification",
    "message": "This is a test",
    "category": "general",
    "type": "info"
  }'
```

---

## 📊 Database Operations

### Get All Notifications
```sql
SELECT * FROM Notification 
WHERE User_ID = 1 
ORDER BY Is_Read ASC, Created_at DESC;
```

### Count by Category
```sql
SELECT Category, COUNT(*) as count 
FROM Notification 
WHERE User_ID = 1 
GROUP BY Category;
```

### Cleanup Old Notifications
```sql
DELETE FROM Notification 
WHERE User_ID = 1 
AND Is_Read = 1 
AND Created_at < datetime('now', '-30 days');
```

### Mark All as Read
```sql
UPDATE Notification 
SET Is_Read = 1, Read_at = CURRENT_TIMESTAMP 
WHERE User_ID = 1 AND Is_Read = 0;
```

---

## 🎯 UI Components Reference

### NotificationPanel Props
```vue
<NotificationPanel
  :isOpen="showNotificationPanel"
  :notifications="notifications"
  :unreadCount="unreadCount"
  @close="showNotificationPanel = false"
  @mark-as-read="markNotificationAsRead"
  @delete="deleteNotification"
  @mark-all-read="markAllAsRead"
/>
```

### HeaderBar Props
```vue
<HeaderBar
  :loading="loading"
  :unreadCount="unreadCount"
  @refresh="refreshData"
  @notifications="showNotificationPanel = true"
  @logout="handleLogout"
/>
```

### RealtimeNotifications Props
```vue
<RealtimeNotifications
  :notifications="displayNotifications"
  @dismiss="dismissNotification"
/>
```

---

## 🔐 Security Notes

1. **Authentication Required** - All endpoints require valid JWT
2. **User Isolation** - Users only see their own notifications
3. **Super Admin Only** - Notification endpoints for super admin route
4. **SQL Injection Prevention** - Parameterized queries used
5. **CORS Enabled** - API handles cross-origin requests

---

## ⚡ Performance Tips

1. **Polling Interval:** Default 2 seconds (adjustable)
2. **Debouncing:** 1 second minimum between checks
3. **Limit:** Fetch max 50 notifications per call
4. **Cleanup:** Delete old notifications regularly
   ```javascript
   // In scheduled task (weekly)
   Notification.deleteOlderThan(30, callback);
   ```

---

## 🐛 Debug Mode

### Enable Console Logging
The system logs all operations:
```javascript
// Backend logs:
console.log('🔔 Backend: Fetching notifications...');  // API calls
console.log('📢 Creating notification...');             // Creation
console.log('✅ Notification created successfully');    // Success

// Frontend logs:
console.log('🔔 Loading notifications...');             // Fetch
console.log('📧 Notifications response:', res.data);    // Response
console.log('✅ Unread count set to:', unreadCount);    // Update
```

### Check Network Requests
**DevTools → Network Tab:**
1. Filter: `notifications`
2. Should see requests every 2 seconds (with debouncing)
3. Response should match API format
4. Status should be 200

---

## 📱 Notification Schema

```sql
CREATE TABLE Notification (
  Notify_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  User_ID INTEGER NOT NULL,           -- Recipient
  Org_ID INTEGER,                     -- Related organization
  Title TEXT NOT NULL,                -- Short title (50 chars)
  Message TEXT NOT NULL,              -- Detailed message (500 chars)
  Type TEXT DEFAULT 'info',           -- success, error, warning, info
  Category TEXT DEFAULT 'general',    -- org, user, dept, location, etc
  Is_Read INTEGER DEFAULT 0,          -- 0 = unread, 1 = read
  Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  Read_at DATETIME,                   -- When marked as read
  Action_URL TEXT,                    -- Link to resource
  FOREIGN KEY (User_ID) REFERENCES User(User_ID),
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID)
);
```

---

## 🎬 Event Triggers

Currently implemented triggers:
- ✅ New Organization Created
- ✅ New User Registered
- ✅ New Department Created
- ✅ New Location/Geofence Added
- ✅ Attendance Milestones
- ⏳ System Alerts (to implement)
- ⏳ User Actions (to implement)

---

## 💡 Tips & Tricks

**Show notification count in sidebar:**
```vue
<span class="badge" v-if="unreadCount > 0">
  {{ unreadCount > 99 ? '99+' : unreadCount }}
</span>
```

**Format notification time:**
```javascript
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};
```

**Auto-dismiss notification after 5 seconds:**
```javascript
setTimeout(() => {
  showToast.value = false;
}, 5000);
```

---

## 📖 Files Modified

- ✅ `backend/routes/superadmin.routes.js` - Enhanced notifications endpoint
- ✅ `frontend/src/views/admin/SuperAdminDashboard.vue` - Real-time polling
- ✅ `frontend/src/components/dashboard/NotificationPanel.vue` - Category filtering
- ✅ `frontend/src/components/dashboard/HeaderBar.vue` - Badge display
- ✅ `backend/models/Notification.js` - Database operations
- ✅ `backend/utils/notificationHelper.js` - Event helpers

---

## 📞 Support

For issues or questions:
1. Check console logs (DevTools)
2. Verify database: `SELECT * FROM Notification;`
3. Test API directly with curl
4. Check network requests (2s interval)
5. Review error responses

---

**Last Updated:** January 2024
**Version:** 1.0 - Production Ready
