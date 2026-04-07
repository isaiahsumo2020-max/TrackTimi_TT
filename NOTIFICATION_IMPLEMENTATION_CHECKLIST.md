# Notification System Implementation Checklist

## Phase 1: Core System ✅ COMPLETE
- [x] Socket.io setup with role-based channels
- [x] Notification service with 10+ notification functions
- [x] Enhanced notification API endpoints
- [x] Frontend composable with real-time support
- [x] NotificationBell component
- [x] Documentation

## Phase 2: Integration Into Existing Routes ⏳ TODO

### [CRITICAL] Replace Old Helper
- [ ] Replace imports in routes from old `notificationHelper.js` to new `notificationService.js`
- [ ] Update any existing notification calls to use new function signatures

### Organization Routes (auth.routes.js)

#### When New Organization Registers
```javascript
// File: backend/routes/auth.routes.js
// Location: After organization is created in registerOrganization endpoint

const { notifyNewOrganization } = require('../utils/notificationService')

// Add after org creation:
if (newOrg) {
  await notifyNewOrganization({
    Org_ID: newOrg.Org_ID,
    Org_Name: newOrg.Org_Name
  })
}

Status: ⏳ TODO
```

### SuperAdmin Routes (superadmin.routes.js)

#### When Organization is Verified
```javascript
// File: backend/routes/superadmin.routes.js
// Location: In verification endpoint

const { notifyOrgVerified } = require('../utils/notificationService')

// Add after org status update:
await notifyOrgVerified(orgId, orgData.Org_Name)

Status: ⏳ TODO
```

#### When Organization is Rejected
```javascript
// File: backend/routes/superadmin.routes.js
// Location: In rejection endpoint

const { notifyOrgRejected } = require('../utils/notificationService')

// Add when rejecting org:
await notifyOrgRejected(orgId, orgData.Org_Name, rejectionReason)

Status: ⏳ TODO
```

### Organization User Routes (org.users.routes.js or org.routes.js)

#### When Employee is Added
```javascript
// File: backend/routes/org.routes.js (or org.users.routes.js)
// Location: In user creation endpoint

const {
  notifyEmployeeAdded,
  notifyEmployeeOnboarding
} = require('../utils/notificationService')

// After user is created:
await notifyEmployeeAdded(
  userId,
  firstName,
  surName,
  orgId,
  orgName
)

// Also notify the employee
await notifyEmployeeOnboarding(
  userId,
  firstName,
  orgName
)

Status: ⏳ TODO
```

#### When Employee Assigned to Department
```javascript
// File: backend/routes/org.routes.js
// Location: In department assignment endpoint

const { notifyEmployeeDepartmentAssignment } = require('../utils/notificationService')

// After assignment:
await notifyEmployeeDepartmentAssignment(userId, departmentName)

Status: ⏳ TODO
```

#### When Employee Assigned to Location
```javascript
// File: backend/routes/org.routes.js
// Location: In location/geofence assignment endpoint

const { notifyEmployeeLocationAssignment } = require('../utils/notificationService')

// After assignment:
await notifyEmployeeLocationAssignment(userId, locationName)

Status: ⏳ TODO
```

### Organization Department Routes (org.routes.js)

#### When New Department is Created
```javascript
// File: backend/routes/org.routes.js
// Location: In department creation endpoint

const { notifyDepartmentCreated } = require('../utils/notificationService')

// After department created:
await notifyDepartmentCreated(
  departmentName,
  orgId,
  orgName,
  departmentId
)

Status: ⏳ TODO
```

### Organization Location Routes (org.routes.js)

#### When New Location/Geofence is Created
```javascript
// File: backend/routes/org.routes.js
// Location: In geofence/location creation endpoint

const { notifyLocationCreated } = require('../utils/notificationService')

// After location created:
await notifyLocationCreated(
  locationName,
  orgId,
  orgName,
  locationId
)

Status: ⏳ TODO
```

## Phase 3: Frontend Integration ⏳ TODO

### Add to Main Layout
- [ ] Import NotificationBell in main/default layout
- [ ] Add NotificationBell to header/navbar
- [ ] Test NotificationBell appears with correct unread count
- [ ] Test real-time notifications display
- [ ] Verify Socket.io connection initializes on login
- [ ] Test mark as read functionality
- [ ] Test delete functionality
- [ ] Test category filtering
- [ ] Test navigation on notification click

### Layout Files to Update
```
frontend/src/layouts/AdminLayout.vue
frontend/src/layouts/SuperAdminLayout.vue
frontend/src/layouts/EmployeeLayout.vue
frontend/src/App.vue (main layout)
```

Example:
```vue
<template>
  <header>
    <div class="flex items-center justify-between">
      <h1>Dashboard</h1>
      <div class="flex items-center gap-4">
        <NotificationBell /> <!-- Add this -->
        <UserMenu />
      </div>
    </div>
  </header>
</template>

<script setup>
import NotificationBell from '@/components/NotificationBell.vue'
import UserMenu from '@/components/UserMenu.vue'
</script>
```

Status: ⏳ TODO

## Phase 4: Testing ⏳ TODO

### Backend Testing
- [ ] Test Socket.io connection with valid token
- [ ] Test user joins correct channels based on role
- [ ] Test SuperAdmin receives org registration notifications
- [ ] Test Org Admin receives employee added notifications
- [ ] Test Employee receives onboarding notification
- [ ] Test database notifications are created
- [ ] Test real-time broadcast via Socket.io
- [ ] Test API endpoints with various filters
- [ ] Test mark as read via API
- [ ] Test unread count accuracy

### Frontend Testing
- [ ] NotificationBell appears in layout
- [ ] Bell icon shows correct unread count
- [ ] Dropdown opens/closes
- [ ] Real-time notifications appear in dropdown
- [ ] Can mark notification as read
- [ ] Can delete notification
- [ ] Can mark all as read
- [ ] Categories show with correct colors
- [ ] Time formatting works (just now, 5m ago, etc)
- [ ] Clicking notification with actionUrl navigates

### Browser Console Testing
```javascript
// Check Socket.io connection
io.on('connect', () => console.log('Connected!'))
io.on('notification:new', (n) => console.log('New notif:', n))

// Test API
fetch('/api/notifications/unread/count', {
  headers: { Authorization: 'Bearer TOKEN' }
}).then(r => r.json()).then(console.log)
```

Status: ⏳ TODO

## Phase 5: Documentation ✅ COMPLETE
- [x] Role-Based Notification Guide created
- [x] Quick Reference created
- [x] Code examples provided
- [x] Troubleshooting section included
- [x] Architecture documented

## Issues Tracker

### Known Issues
- None yet

### Questions to Resolve
1. Should SuperAdmin receive notifications about all org activities or just registration/verification?
2. Should organization announcements create a separate notification record per user or broadcast only?
3. Should notification history be kept indefinitely or have auto-cleanup?

## Time Estimates

| Phase | Hours |
|-------|-------|
| Phase 1 (Core) | ✅ 2 hours |
| Phase 2 (Integration) | ⏳ 1-2 hours |
| Phase 3 (Frontend) | ⏳ 0.5-1 hour |
| Phase 4 (Testing) | ⏳ 1-2 hours |
| **Total** | **~6 hours** |

## Success Criteria

✅ Notifications are created when actions occur
✅ SuperAdmin sees organization-related notifications
✅ Org Admins see employee/department/location notifications
✅ Employees see their assignment notifications
✅ Real-time updates via Socket.io work
✅ API endpoints return correct data
✅ Frontend NotificationBell displays correctly
✅ Unread count is accurate
✅ Can mark notifications as read
✅ Can delete notifications

## Deployment Checklist

- [ ] All routes have notification triggers added
- [ ] Frontend layouts include NotificationBell
- [ ] Socket.io is initialized on user login
- [ ] Environment variables are set correctly
- [ ] Database schema includes Notification table
- [ ] All migrations have been run
- [ ] API endpoints are tested
- [ ] WebSocket connection is working
- [ ] Real-time notifications are flowing
- [ ] No JavaScript errors in console
- [ ] No SQL errors in backend logs

## Useful Commands

```bash
# Check if Socket.io is working
curl -i http://localhost:4000/socket.io/?EIO=4&transport=polling

# Test notification endpoint
curl -X POST http://localhost:4000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","message":"Test notif"}'

# View logs
npm run dev  # See socket and notification logs
```

## Contact & Support

For issues or questions about the notification system:
1. Check ROLE_BASED_NOTIFICATION_GUIDE.md
2. Check NOTIFICATION_QUICK_REFERENCE.md
3. Check browser console for Socket.io errors
4. Check backend logs for database errors

---

**Last Updated:** April 2026  
**Version:** 2.0  
**Status:** Ready for Phase 2 Integration
