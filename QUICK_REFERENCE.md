# SuperAdmin Dashboard - Quick Reference Guide

## 🚀 System Overview

### Architecture
```
Frontend Components
        ↓
API Service Layer (superadminApi.js)
        ↓
Backend Express Routes
        ↓
SQLite Database
```

## 💾 Components & Their Data

### System Health Dashboard
- **Component**: `SuperAdminHealth.vue`
- **Route**: `/superadmin/health`
- **API**: `getSystemHealth()`
- **Data**:
  - Server status
  - Database size
  - Active users today
  - Table statistics
  - Recent errors
- **Refresh**: Auto every 30s

### Global Users Directory
- **Component**: `SuperAdminUsers.vue`
- **Route**: `/superadmin/users`
- **API**: `getUsers()`
- **Features**:
  - Search by name/email/org
  - Filter by status
  - Statistics

### Geofence Management
- **Component**: `SuperAdminGeofences.vue`
- **Route**: `/superadmin/geofences`
- **API**: `getGeofences()`, `getGeofenceViolations(id)`
- **Features**:
  - View all geofences
  - Check violations
  - Realtime stats

### Attendance Analytics
- **Component**: `SuperAdminAnalytics.vue`
- **Route**: `/superadmin/analytics`
- **API**: `getAttendanceAnalytics(days)`
- **Features**:
  - Daily trends
  - Department breakdown
  - Configurable date range

### Department Management
- **Component**: `SuperAdminDepartments.vue`
- **Route**: `/superadmin/departments`
- **API**: `getDepartments()`
- **Displays**:
  - All departments
  - Staff counts
  - Daily checkins

### Shift Management
- **Component**: `SuperAdminShifts.vue`
- **Route**: `/superadmin/shifts`
- **API**: `getShifts()`
- **Shows**:
  - Shift schedules
  - Assignments
  - Organization stats

### Reports & Export
- **Component**: `SuperAdminReports.vue`
- **Route**: `/superadmin/reports`
- **APIs**: Multiple (attendance, users, departments, revenue)
- **Reports**:
  - Attendance
  - User Activity
  - Department Summary
  - Revenue Summary

### System Alerts
- **Component**: `SuperAdminAlerts.vue`
- **Route**: `/superadmin/alerts`
- **API**: `getAlerts()`
- **Alert Types**:
  - Critical
  - Warning
  - Info

### Main Dashboard
- **Component**: `SuperAdminDashboard.vue`
- **Route**: `/superadmin`
- **APIs**: `getDashboard()`, `getOrganizations()`
- **Overview**:
  - Key metrics
  - Recent organizations
  - Platform health

## 🔧 How to Use the API Service

### Import API Methods
```javascript
import { 
  getDashboard, 
  getUsers, 
  getSystemHealth 
} from '@/services/superadminApi'
```

### Basic Pattern
```vue
<script setup>
import { ref, onMounted } from 'vue'
import { getUsers } from '@/services/superadminApi'

const data = ref([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getUsers()
    data.value = res.data.users
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
```

## 📊 API Endpoints Reference

### Dashboard
- `GET /dashboard` - Overall stats
- `GET /organizations` - All orgs
- `GET /organizations/:id/details` - Org details
- `GET /audit-logs` - Audit logs
- `GET /users` - All users

### Monitoring
- `GET /system/health` - System health
- `GET /activity/user-logins` - User activity

### Analytics
- `GET /analytics/attendance` - Attendance trends
- `GET /revenue/summary` - Revenue stats

### Management
- `GET /geofences` - All geofences
- `GET /geofences/:id/violations` - Geofence violations
- `GET /departments` - All departments
- `GET /shifts` - All shifts

### Alerts
- `GET /alerts` - System alerts

## ⚙️ Configuration

### Token Storage
- **Key**: `superAdminToken`
- **Set**: After login
- **Retrieved**: Automatically by API service
- **Cleared**: On 401/403

### Base URL
- **Current**: `http://localhost:4000/api/superadmin`
- **Location**: `frontend/src/services/superadminApi.js`

## 🔄 Data Flow Example

### Loading Users with Search:
```javascript
// 1. API Service fetches data
const res = await getUsers()

// 2. Response format:
{
  success: true,
  users: [
    { User_ID, First_Name, Email, Org_Name, ... }
  ]
}

// 3. Component stores data
users.value = res.data.users

// 4. Filter in template
filteredUsers = users.filter(u => 
  u.First_Name.includes(searchQuery)
)

// 5. Display in table
for user in filteredUsers:
  show user row
```

## 🛠️ Common Tasks

### Add Auto-Refresh
```javascript
onMounted(() => {
  loadData()
  // Refresh every 30 seconds
  setInterval(loadData, 30000)
})
```

### Handle Errors Gracefully
```javascript
try {
  const res = await getUsers()
  users.value = res.data.users
} catch (error) {
  console.error('Failed:', error)
  // Show user notification
  alert('Failed to load users')
}
```

### Filter Data
```javascript
const filtered = computed(() => {
  return users.value.filter(u =>
    u.Email.includes(searchQuery.value)
  )
})
```

### Calculate Stats
```javascript
const activeCount = computed(() =>
  users.value.filter(u => u.Is_Active).length
)
```

## 🐛 Debugging

### Check Token
```javascript
console.log(localStorage.getItem('superAdminToken'))
```

### Test API
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/superadmin/users
```

### Browser DevTools
- Network tab: See API requests
- Console: Check error messages
- Application: Verify token storage

## ✅ Checklist for New Component

- [ ] Import needed API methods
- [ ] Create data ref
- [ ] Create loading ref
- [ ] Write load function
- [ ] Add error handling
- [ ] Call in onMounted
- [ ] Add refresh button
- [ ] Test with real data

## 📝 Notes

- All API calls automatically include token
- 401/403 errors auto-redirect to login
- Components use consistent patterns
- Error handling with try-catch throughout
- Fallback data where appropriate
- Real-time updates via auto-refresh

## 🎯 Next Steps (Future)

- Add real-time WebSocket updates
- Implement data caching
- Add offline support
- Move config to .env
- Add request logging
- Implement batch operations
