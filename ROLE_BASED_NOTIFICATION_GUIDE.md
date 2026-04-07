# Role-Based Real-Time Notification System (UPDATED)

## Overview

A complete real-time notification system for TrackTimi with Socket.io support for three user roles:
- **SuperAdmin** - System-wide notifications about organizations
- **Organization Admin** - Organization-specific events and management notifications
- **Employee** - Personal and organization-wide announcements

---

## Architecture

### Backend Components

#### 1. **Socket.io Manager** (`backend/utils/socket.js`)
- Handles real-time connections with role-based channels
- Auto-joins users to appropriate channels on login
- Supports Redis adapter for multi-server deployments

**Channels:**
```
superadmin                 # All SuperAdmin notifications
org_admin:{orgId}         # Organization admin notifications
employee:{orgId}          # Employee notifications in organization
org:{orgId}               # Organization-wide announcements
user:{userId}             # Personal user notifications
```

#### 2. **Notification Service** (`backend/utils/notificationService.js`)
Async notification functions with automatic Socket.io broadcasting:

**SuperAdmin Notifications:**
- `notifyNewOrganization(orgData)` - New org registration
- `notifyOrgVerified(orgId, orgName)` - Organization verified
- `notifyOrgRejected(orgId, orgName, reason)` - Organization rejected

**Organization Admin Notifications:**
- `notifyEmployeeAdded(userId, firstName, surName, orgId, orgName)`
- `notifyDepartmentCreated(deptName, orgId, orgName, deptId)`
- `notifyLocationCreated(locationName, orgId, orgName, locationId)`

**Employee Notifications:**
- `notifyEmployeeOnboarding(userId, firstName, orgName)`
- `notifyEmployeeDepartmentAssignment(userId, deptName)`
-`notifyEmployeeLocationAssignment(userId, locationName)`

**Broadcast:**
- `notifyOrgAnnouncement(orgId, title, message, actionUrl)` - To all org members

#### 3. **Notification Routes** (`backend/routes/notification.routes.js`)

**Endpoints:**
```
GET    /api/notifications                 # Get all notifications (with filters)
GET    /api/notifications/unread/count    # Get unread count
GET    /api/notifications/categories      # Get categories with counts
GET    /api/notifications/category/:cat   # Get by category
PUT    /api/notifications/:id/read        # Mark as read
PUT    /api/notifications/mark-all-read   # Mark all as read
DELETE /api/notifications/:id             # Delete notification
DELETE /api/notifications                 # Delete multiple
POST   /api/notifications/test            # Test notification (admin only)
```

**Query Parameters:**
```
/api/notifications?limit=50&category=employee&type=success&isRead=false
```

#### 4. **Database Schema** (Notification table)
```sql
CREATE TABLE Notification (
  Notify_ID INTEGER PRIMARY KEY,
  User_ID INTEGER NOT NULL,
  Org_ID INTEGER,
  Title TEXT NOT NULL,
  Message TEXT NOT NULL,
  Type TEXT,              -- 'info', 'success', 'warning', 'error', 'announcement'
  Category TEXT,          -- 'organization', 'employee', 'department', 'location', etc.
  Is_Read BOOLEAN,
  Action_URL TEXT,        -- URL to navigate to
  Created_at DATETIME,
  Read_at DATETIME,
  FOREIGN KEY (User_ID) REFERENCES User(User_ID),
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID)
);
```

---

## Frontend Components

### 1. **useNotifications Composable** (`frontend/src/composables/useNotifications.js`)

Provides reactive notification state and methods:

```javascript
import { useNotifications } from '@/composables/useNotifications'

const {
  notifications,              // Array of notification objects
  unreadCount,               // Number of unread notifications
  isLoading,                 // Loading state
  categories,                // Available categories with counts
  totalNotifications,        // Computed total count
  unreadNotifications,       // Computed unread notifications
  
  // Methods
  fetchNotifications,        // Fetch with optional filters
  fetchCategories,          // Fetch category list
  getUnreadCount,          // Get unread count only
  markAsRead,              // Mark single as read
  markAllAsRead,           // Mark all as read
  deleteNotification,      // Delete single
  deleteMultiple,          // Delete multiple
  initSocket,              // Initialize real-time
  cleanup                  // Cleanup resources
} = useNotifications()
```

### 2. **NotificationBell Component** (`frontend/src/components/NotificationBell.vue`)

Notification bell icon with dropdown panel:

```vue
<template>
  <NotificationBell />
</template>

<script setup>
import NotificationBell from '@/components/NotificationBell.vue'
</script>
```

**Features:**
- 🔔 Bell icon with unread badge
- 📬 Real-time notifications via Socket.io
- 📋 Grouped by category with color coding
- ✅ Mark as read functionality
- 🗑️ Delete notifications
- 🔗 Navigation to related resources
- ⏱️ Time formatting (just now, 5m ago, etc)
- 🎯 Category badges with color coding

---

## Integration Guide

### 1. Initialize Socket.io on App Load

**`frontend/src/main.js`:**
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initSocket } from '@/composables/useNotifications'

const app = createApp(App)

router.afterEach((to, from) => {
  // Initialize socket when user data becomes available (after login)
  const userStr = sessionStorage.getItem('user') || localStorage.getItem('user')
  if (userStr && !window.__socketInitialized) {
    initSocket()
    window.__socketInitialized = true
  }
})

app.use(router)
app.mount('#app')
```

### 2. Add NotificationBell to Layout

**`frontend/src/layouts/AdminLayout.vue`:**
```vue
<template>
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <div class="flex items-center gap-4">
        <NotificationBell />
        <!-- Other header items -->
      </div>
    </div>
  </header>
</template>

<script setup>
import NotificationBell from '@/components/NotificationBell.vue'
</script>
```

### 3. Trigger Notifications from Backend

**Example: When creating a new employee**

```javascript
// backend/controllers/org.controller.js
const { notifyEmployeeAdded, notifyEmployeeOnboarding } = require('../utils/notificationService')

router.post('/users', requireAdmin, async (req, res) => {
  const { firstName, surName, email, orgId } = req.body
  const orgName = 'Your Org Name'
  
  // Create user...
  const userId = newUser.User_ID
  
  // Send notifications
  await notifyEmployeeAdded(userId, firstName, surName, orgId, orgName)
  await notifyEmployeeOnboarding(userId, firstName, orgName)
  
  res.json({ success: true, userId })
})
```

### 4. Server-Side Notification Triggers

**When Organization Registers:**
```javascript
// backend/routes/auth.routes.js
const { notifyNewOrganization } = require('../utils/notificationService')

// After org creation...
await notifyNewOrganization(orgData)
```

**When Organization is Verified (SuperAdmin):**
```javascript
// backend/routes/superadmin.routes.js
const { notifyOrgVerified } = require('../utils/notificationService')

router.put('/organizations/:id/verify', requireSuperAdmin, async (req, res) => {
  // Verify org...
  await notifyOrgVerified(orgId, orgName)
  res.json({ success: true })
})
```

**Organization Announcement:**
```javascript
const { notifyOrgAnnouncement } = require('../utils/notificationService')

await notifyOrgAnnouncement(
  orgId,
  'System Maintenance',
  'System will be down for maintenance on Sunday. Please plan accordingly.',
  '/announcements/123'
)
```

---

## Notification Types

### Categories
- `organization` - Org verification, registration
- `employee` - Employee added, assignments
- `department` - Department created
- `location` - Location/geofence created
- `announcement` - Organization-wide announcements
- `user` - User actions
- `test` - Test notifications (admin only)

### Types
- `info` - Informational (blue)
- `success` - Success (green)
- `warning` - Warning (yellow)
- `error` - Error (red)
- `announcement` - Announcement (special)

---

## Real-Time Features

### Socket.io Channels Summary

**SuperAdmin receives:**
- New organization registrations
- Organization verification status changes
- System-wide alerts

**Org Admin receives:**
- Employee additions
- Department/location creations
- Organization verification status
- Organization-wide announcements

**Employees receive:**
- Onboarding notifications
- Department/location assignments
- Organization announcements
- Personal notifications

### Automatic Channel Joining

When user logs in, socket automatically joins:
```javascript
socket.emit('userLogin', {
  userId,
  orgId,
  userTypeId,    // 1 = Admin/SuperAdmin
  role
})
```

System automatically joins:
- ✅ `user:{userId}` - Personal notifications
- ✅ `superadmin` - If SuperAdmin (userTypeId === 1)
- ✅ `org_admin:{orgId}` - If Org Admin
- ✅ `employee:{orgId}` - If Employee
- ✅ `org:{orgId}` - Organization announcements

---

## Configuration

### Environment Variables

**.env (Backend)**
```
SOCKET_IO_ORIGIN=http://localhost:5173
SOCKET_IO_CREDENTIALS=true
```

**.env (Frontend)**
```
VITE_API_URL=http://localhost:4000
```

---

## Testing

### Manual Testing

**1. Create test notification (Admin endpoint):**
```bash
curl -X POST http://localhost:4000/api/notifications/test \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "message": "This is a test notification",
    "category": "test",
    "type": "info"
  }'
```

**2. Open browser DevTools:**
```javascript
// In console, watch Socket.io events
io.on('notification:new', (data) => {
  console.log('Received notification:', data)
})
```

**3. Fetch notifications:**
```javascript
// In console
fetch('/api/notifications', {
  headers: { 'Authorization': 'Bearer TOKEN' }
})
  .then(r => r.json())
  .then(data => console.log(data))
```

---

## Best Practices

### ✅ DO:
- Use appropriate categories for filtering
- Include actionUrl for navigating to related resources
- Batch notifications when appropriate
- Use notifications for important user actions
- Test Socket.io connection on user login

### ❌ DON'T:
- Send notifications for every minor action
- Create notifications without organizing events
- Use incorrect category assignments
- Forget to handle Socket.io disconnections
- Skip cleanup in components

---

## Troubleshooting

### Socket.io Not Connecting
```
Check:
- Is server running? (port 4000)
- Is Socket.io initialized in server.js?
- Are CORS settings correct?
- Is auth token valid?
```

### Notifications Not Appearing Realtime
```
1. Open DevTools → Network → WS (WebSocket)
2. Check if Socket.io handshake succeeds
3. Verify user is joined to correct channels:
   - socket.on('connection') should show user login
   - Check console logs: "✅ User X joined channel..."
```

### Database Notifications Not Showing
```
Check:
1. Are notifications being created? (Check DB)
2. Are filters applied correctly?
3. Check User_ID matches authenticated user
4. Verify JWT token is valid
```

---

## Future Enhancements

- [ ] Email notifications for critical alerts
- [ ] SMS notifications
- [ ] Notification preferences/settings
- [ ] Notification templates
- [ ] Scheduled notifications
- [ ] Notification analytics
- [ ] Multi-language support
- [ ] Notification history export

---

## Files Overview

| File | Purpose |
|------|---------|
| `backend/utils/socket.js` | Socket.io initialization & channels |
| `backend/utils/notificationService.js` | Notification creation & broadcasting |
| `backend/routes/notification.routes.js` | REST API endpoints |
| `backend/models/Notification.js` | Database model |
| `frontend/src/composables/useNotifications.js` | Vue composable with state |
| `frontend/src/components/NotificationBell.vue` | Bell icon component |

---

**Version:** 2.0 (Updated with role-based channels)  
**Last Updated:** April 2026  
**Status:** Production Ready ✅
