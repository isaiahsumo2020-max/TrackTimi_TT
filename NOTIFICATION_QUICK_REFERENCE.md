# Notification System - Quick Reference

## For Backend Developers

### Import the Notification Service
```javascript
const {
  createNotification,
  notifyNewOrganization,
  notifyOrgVerified,
  notifyOrgRejected,
  notifyEmployeeAdded,
  notifyDepartmentCreated,
  notifyLocationCreated,
  notifyEmployeeOnboarding,
  notifyEmployeeDepartmentAssignment,
  notifyEmployeeLocationAssignment,
  notifyOrgAnnouncement
} = require('../utils/notificationService')
```

### Common Notification Patterns

#### 1. New Organization Registration
```javascript
// In auth.routes.js - after org creation
const newOrg = { Org_ID: lastID, Org_Name: orgName }
await notifyNewOrganization(newOrg)
```

#### 2. Employee Added by Admin
```javascript
// In org.controller.js - after user creation
await notifyEmployeeAdded(
  userId,
  firstName,
  surName,
  orgId,
  orgName
)
await notifyEmployeeOnboarding(userId, firstName, orgName)
```

#### 3. Department Created
```javascript
// In org.controller.js
await notifyDepartmentCreated(
  departmentName,
  orgId,
  orgName,
  deptId
)
```

#### 4. Organization Verified (SuperAdmin)
```javascript
// In superadmin.routes.js
await notifyOrgVerified(orgId, orgName)
```

#### 5. Organization Announcement
```javascript
// Broadcast to all org members
await notifyOrgAnnouncement(
  orgId,
  'Important Announcement',
  'The system will be under maintenance...',
  '/announcements/123'
)
```

---

## For Frontend Developers

### Use Notification Composable
```javascript
import { useNotifications } from '@/composables/useNotifications'

export default {
  setup() {
    const {
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      fetchCategories,
      markAsRead,
      markAllAsRead,
      deleteNotification
    } = useNotifications()

    return {
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }
  }
}
```

### Add NotificationBell to Layout
```vue
<template>
  <nav class="header">
    <NotificationBell />
  </nav>
</template>

<script setup>
import NotificationBell from '@/components/NotificationBell.vue'
</script>
```

### Listen to Real-Time Notifications
```javascript
import { getNotificationsState } from '@/composables/useNotifications'

const state = getNotificationsState()

// State is reactive, updates as notifications arrive
watch(
  () => state.unreadCount,
  (newCount) => {
    console.log(`You have ${newCount} unread notifications`)
  }
)
```

---

## API Endpoints

### Get All Notifications
```
GET /api/notifications?limit=50&category=employee&isRead=false
```

### Get Unread Count
```
GET /api/notifications/unread/count
→ { unreadCount: 5 }
```

### Get Categories
```
GET /api/notifications/categories
→ { categories: [{ category: 'employee', count: 3, unread: 2 }, ...] }
```

### Mark as Read
```
PUT /api/notifications/:notifyId/read
→ { success: true }
```

### Mark All as Read
```
PUT /api/notifications/mark-all-read
→ { success: true, updated: 5 }
```

### Delete Notification
```
DELETE /api/notifications/:notifyId
→ { success: true }
```

### Delete Multiple
```
DELETE /api/notifications
Body: { notifyIds: [1, 2, 3] }
→ { success: true, message: "Deleted 3 notifications" }
```

---

## Socket.io Events

### On Client (Frontend)
```javascript
// Listen for new notification
socket.on('notification:new', (notification) => {
  console.log('Got new notification:', notification)
})

// Emit when marking as read
socket.emit('notification:read', notifyId)

// Login/authenticate
socket.emit('userLogin', {
  userId: 123,
  orgId: 456,
  userTypeId: 3,
  role: 'staff'
})
```

### On Server (Backend)
```javascript
// Notify specific user
notifyUser(userId, { title, message, type, category })

// Notify all SuperAdmins
notifySuperAdmin({ title, message })

// Notify org admins of specific org
notifyOrgAdmin(orgId, { title, message })

// Notify all employees in org
notifyEmployee(orgId, { title, message })

// Notify all org members (announcement)
notifyOrg(orgId, { title, message })
```

---

## Database Schema

```sql
-- Notification table
Notify_ID          | Auto-increment primary key
User_ID            | Target user (required)
Org_ID             | Organization (optional)
Title              | Notification title
Message            | Notification message
Type               | 'info', 'success', 'warning', 'error', 'announcement'
Category           | 'organization', 'employee', 'department', 'location', etc.
Is_Read            | 0 or 1
Action_URL         | Link to navigate to
Created_at         | Timestamp
Read_at            | When marked as read
```

---

## Notification Categories

| Category | Trigger | Example |
|----------|---------|---------|
| `organization` | Org registered, verified, rejected | "Your org was verified" |
| `employee` | Employee added, assigned | "You were added as employee" |
| `department` | Department created | "Finance dept created" |
| `location` | Geofence created | "Lagos office location created" |
| `announcement` | Org-wide announcement | "System maintenance notice" |
| `user` | User actions | "Profile updated" |
| `test` | Testing (admin only) | "This is a test" |

---

## Real-Time Notification Flow

```
Admin Action
    ↓
POST /api/org/users (or other action)
    ↓
Backend Controller
    ↓
Call notificationService function
    ↓
↙─────────────────────────────────────────────→
│                                               │
Database                                    Socket.io
Save Notification                           Broadcast
    ↓                                            ↓
Return response                         Clients receive via
                                         'notification:new'
                                         ↓
                                    Frontend updates state
                                         ↓
                                    NotificationBell
                                    shows new notification
```

---

## Common Workflows

### 1. New Employee Registration Flow
```javascript
// 1. Admin creates employee
router.post('/org/users', async (req, res) => {
  // Create user in DB
  const userId = createUser()
  
  // 2. Notify admin about new employee
  await notifyEmployeeAdded(userId, firstName, surName, orgId, orgName)
  
  // 3. Notify employee they've been added
  await notifyEmployeeOnboarding(userId, firstName, orgName)
  
  res.json({ success: true })
})
```

### 2. Department Creation Flow
```javascript
router.post('/org/departments', async (req, res) => {
  // Create department
  const deptId = createDept()
  
  // Notify org admin
  await notifyDepartmentCreated(name, orgId, orgName, deptId)
  
  res.json({ success: true })
})
```

### 3. Organization Verification (SuperAdmin)
```javascript
router.put('/superadmin/orgs/:id/verify', async (req, res) => {
  // Verify org in DB
  updateOrgStatus(orgId, 'verified')
  
  // Notify org admin
  await notifyOrgVerified(orgId, orgName)
  
  res.json({ success: true })
})
```

---

## Checking Notification Status

### In Browser Console
```javascript
// Get all notifications
fetch('/api/notifications', {
  headers: { Authorization: 'Bearer TOKEN' }
}).then(r => r.json()).then(console.log)

// Get unread count
fetch('/api/notifications/unread/count', {
  headers: { Authorization: 'Bearer TOKEN' }
}).then(r => r.json()).then(console.log)

// Watch Socket.io
io.on('notification:new', data => console.log('📬', data))
```

---

## Color Coding

| Category | Color | Hex |
|----------|-------|-----|
| organization | Blue | #3b82f6 |
| employee | Green | #10b981 |
| department | Purple | #8b5cf6 |
| location | Orange | #f97316 |
| announcement | Red | #ef4444 |
| user | Indigo | #6366f1 |
| test | Gray | #6b7280 |

---

## Performance Tips

✅ **DO:**
- Use categories to filter notifications
- Implement pagination (limit=50)
- Cache unread count client-side
- Use isRead filter to show only new
- Batch delete instead of one-by-one

❌ **DON'T:**
- Fetch all notifications without limit
- Create notifications for every action
- Forget to update local state after API calls
- Leave Socket.io connections open unnecessarily
- Store sensitive data in notification messages

---

**Last Updated:** April 2026  
**Version:** 2.0
