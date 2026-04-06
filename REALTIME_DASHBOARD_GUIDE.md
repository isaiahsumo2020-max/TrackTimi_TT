# Real-Time Dashboard Implementation Guide

## 🎯 Overview

A comprehensive real-time data synchronization system has been implemented for both Employee and Organization dashboards using WebSocket (Socket.IO). Metrics update automatically as data changes in the system, providing live visibility into attendance, schedules, and work analytics.

---

## 📊 Dashboards Enhanced

### 1. **Employee Dashboard** (`/dashboard`)
Real-time metrics for individual employees:
- ✅ Hours worked today
- ✅ Current check-in status
- ✅ Weekly/monthly hours tracking
- ✅ Attendance rate this month
- ✅ On-time rate
- ✅ Upcoming shift information

**Real-time Events:**
- `dashboard:employeeMetrics` - Overall employee statistics
- `dashboard:hoursTracking` - Hours worked updates
- `dashboard:checkinStatus` - Check-in/out status changes
- `dashboard:scheduleUpdate` - Shift schedule changes

### 2. **Organization Dashboard (Future)**
Real-time metrics for organization admins:
- Total active employees
- Employees checked in today
- Daily attendance rate
- Average hours worked
- Department count
- Active shifts count
- Pending approvals

**Real-time Events:**
- `dashboard:orgMetrics` - Organization metrics
- `dashboard:employeeStatus` - Individual employee status
- `dashboard:attendanceUpdate` - Daily attendance changes
- `dashboard:departmentMetrics` - Department-level data

### 3. **SuperAdmin Dashboard** (`/superadmin/dashboard`)
System-wide metrics for platform administrators:
- ✅ Total organizations
- ✅ Total users across all organizations
- ✅ Check-ins today (global)
- ✅ System uptime
- ✅ Database load

**Real-time Events:**
- `dashboard:systemMetrics` - System-wide statistics
- `dashboard:systemAlert` - Critical system alerts

---

## 🔧 Technical Architecture

### Frontend Structure

#### **New Composable: `useDashboardMetrics.js`**

```javascript
import { useDashboardMetrics } from '@/composables/useDashboardMetrics'

// In component setup
const { 
  employeeMetrics,    // Employee metrics state
  orgMetrics,         // Organization metrics state
  superadminMetrics,  // System metrics state
  isConnected,        // WebSocket connection status
  alerts,             // Real-time alerts queue
  
  // Methods
  requestEmployeeMetrics,   // Request employee data refresh
  requestOrgMetrics,        // Request org data refresh
  requestSystemMetrics,     // Request system data refresh
  requestMetricsRefresh,    // Refresh any metric type
  clearAlerts,              // Clear alert queue
  emit                      // Custom socket event
} = useDashboardMetrics({ 
  dashboardType: 'employee|organization|superadmin'
})
```

#### **Usage Examples:**

**Sync Metrics to Component State**
```javascript
// Watch for changes and sync to local state
const syncMetrics = () => {
  if (employeeMetrics.value) {
    hoursWorked.value = employeeMetrics.value.hoursWorkedToday
    attendanceRate.value = employeeMetrics.value.attendanceRate
    // ... more syncs
  }
}

// Call in interval or watch
setInterval(syncMetrics, 1000)
```

**Request Metric Refresh**
```javascript
// Request refresh from server
const refreshData = async () => {
  requestMetricsRefresh('all') // Refresh all metrics
  // or
  requestEmployeeMetrics()      // Employee only
  requestOrgMetrics()           // Org only
  requestSystemMetrics()        // System only
}
```

**Handle Alerts**
```javascript
// Alerts auto-appear and dismiss after 5 seconds
const unreadAlerts = computed(() => alerts.value)

// Or manually clear
clearAlerts()
```

### Backend Structure

#### **New Module: `dashboardEmitter.js`**

Handles all dashboard metric calculations and broadcasts:

```javascript
const dashboardEmitter = require('./utils/dashboardEmitter')

// Emit metrics for specific org
dashboardEmitter.emitOrgMetrics(io, orgId)

// Broadcast attendance update
dashboardEmitter.broadcastAttendanceUpdate(io, orgId)

// System alert to all
dashboardEmitter.broadcastSystemAlert(io, {
  type: 'critical',
  message: 'Database connection lost',
  severity: 'error'
})
```

#### **Socket Events Handled**
```javascript
socket.on('dashboard:requestMetrics', async (data) => {
  // Client requested metrics refresh
  // Server responds with emitted events
})
```

---

## 📡 Real-Time Event Flow

### Client → Server
1. Client connects and joins organization room: `socket.emit('joinOrg', orgId)`
2. Client requests metrics: `socket.emit('dashboard:requestMetrics', { type: 'all' })`
3. Server responds with event emissions

### Server → Client
1. Server queries database
2. Server emits event: `io.to('org:123').emit('dashboard:orgMetrics', data)`
3. Frontend composable receives event
4. Component state updates automatically

---

## 🚀 Implementation Steps Completed

### ✅ Frontend
1. Created `useDashboardMetrics.js` composable
   - Socket.IO connection management
   - Event listeners for all dashboard types
   - Metric state (orgMetrics, employeeMetrics, superadminMetrics)
   - Alert queue system
   - Manual refresh methods

2. Enhanced `UserDashboard.vue`
   - Imported useDashboardMetrics
   - Added syncEmployeeMetrics() function
   - Integrated with existing useRealtimeUpdates
   - Added metric refresh on mount and intervals

3. Enhanced `SuperAdminDashboard.vue`
   - Imported useDashboardMetrics
   - Updated stats computed property
   - Added system metric requests
   - 30-second auto-refresh

### ✅ Backend
1. Created `dashboardEmitter.js`
   - emitOrgMetrics() with 6+ database queries
   - emitEmployeeMetrics() with 8 database queries
   - emitSystemMetrics() with system-wide data
   - Broadcast functions for alerts and notifications

2. Updated `socket.js`
   - Initialize dashboard handlers
   - Accept 'joinOrg' and 'leaveOrg' events
   - Auto-reconnect on disconnect
   - CORS support

---

## 🔌 WebSocket Connection Details

### Connection Setup
```javascript
// Automatic in composable
const socket = io(API_URL, {
  auth: { 
    token: localStorage.getItem('token') 
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
  transports: ['websocket', 'polling']  // Fallback for blocked WebSockets
})
```

### Room Structure
- **org:123** - Organization-specific room (employees of org 123)
- **superadmin** - SuperAdmin-only room (future implementation)

### Connection States
- `isConnected` - Current connection status (true/false)
- Auto-reconnect with exponential backoff
- Fallback to polling if WebSocket blocked

---

## 📈 Metric Calculation Examples

### Employee Metrics
**Hours Worked Today:**
```sql
SELECT ROUND(TIMESTAMPDIFF(HOUR, MIN(Check_In_Time), 
  COALESCE(MAX(Check_Out_Time), NOW())), 2) as hours
FROM Attendance
WHERE User_ID = ? AND DATE(Check_In_Time) = CURDATE()
```

**Attendance Rate:**
```sql
SELECT ROUND(COUNT(Distinct DATE(Check_In_Time)) / 
  COUNT(Distinct DATE(Shift_Date)) * 100, 2) as rate
FROM Shift s
LEFT JOIN Attendance a ON s.Shift_ID = a.Shift_ID
WHERE s.User_ID = ? AND MONTH(Shift_Date) = MONTH(CURDATE())
```

### Organization Metrics
**Total Check-ins Today:**
```sql
SELECT COUNT(DISTINCT User_ID) as count 
FROM Attendance a
WHERE User_ID IN (
  SELECT User_ID FROM User WHERE Org_ID = ?
)
AND DATE(Check_In_Time) = CURDATE()
```

**Attendance Rate:**
```sql
SELECT ROUND(COUNT(DISTINCT a.User_ID) / 
  COUNT(DISTINCT u.User_ID) * 100, 2) as rate
FROM User u
LEFT JOIN Attendance a ON u.User_ID = a.User_ID 
  AND DATE(a.Check_In_Time) = CURDATE()
WHERE u.Org_ID = ? AND u.Is_Active = 1
```

---

## 🧪 Testing the Real-Time System

### Manual Testing Checklist
- [ ] Navigate to Employee Dashboard
  - [ ] Page loads and initial data displays
  - [ ] WebSocket connects (check browser DevTools)
  - [ ] Metrics update every second via sync
  - [ ] Manual refresh works
  - [ ] Data matches API endpoints

- [ ] Navigate to SuperAdmin Dashboard
  - [ ] System metrics load
  - [ ] Stats cards show real-time data
  - [ ] Check-ins update as employees clock in
  - [ ] Attendance rate recalculates

- [ ] WebSocket Reliability
  - [ ] Reload page - reconnects automatically
  - [ ] Throttle network - still functions
  - [ ] Go offline/online - auto-reconnects
  - [ ] Multiple tabs - separate connections
  - [ ] Alerts appear and disappear after 5s

### Browser DevTools Testing
```javascript
// In Console:

// Check connection
socket.connected

// Track events
socket.onAny(console.log)

// Emit test event
socket.emit('dashboard:requestMetrics', { type: 'all' })

// Check received data
// Watch Network > WS for "dashboard:*" messages
```

---

## 📝 API Endpoints (Not Changed)

Real-time system works alongside existing REST APIs:
- `GET /attendance/analytics` - Employee analytics
- `GET /attendance/status` - Current check-in status
- `GET /org/my-current-shift` - Employee's current shift
- `GET /org/my-schedule` - Employee's schedule
- `GET /attendance/breaks` - Break history
- `GET /org/geofences` - Organization geofences

WebSocket complements (not replaces) these endpoints.

---

## 🚨 Alert System

### Alert Types
```javascript
// Alerts auto-disappear after 5 seconds
alerts.value = [
  {
    id: 'alert-1712345678',
    type: 'employee-status | notification | error | system',
    message: 'String message',
    severity: 'info | warning | error',
    timestamp: Date object
  }
]
```

### Displaying Alerts
```vue
<div v-for="alert in alerts" :key="alert.id" class="alert">
  <span :class="`text-${alert.severity}`">{{ alert.message }}</span>
</div>
```

---

## 🔐 Security Considerations

1. **Authentication**: Token passed in Socket.IO auth
2. **Room-Based Access**: Users only see their org's data
3. **Rate Limiting**: (Can be added to dashboardEmitter)
4. **CORS**: Configured in socket.js
5. **Data Validation**: All queries parameterized to prevent SQL injection

---

## 📚 File References

### New Files Created
- `frontend/src/composables/useDashboardMetrics.js` - NEW
- `backend/utils/dashboardEmitter.js` - NEW

### Modified Files
- `frontend/src/views/tenant/UserDashboard.vue` - Enhanced
- `frontend/src/views/admin/SuperAdminDashboard.vue` - Enhanced
- `backend/utils/socket.js` - Updated initialization

---

## ⚡ Performance Notes

### Optimization Strategies
1. **Event Batching**: Dashboard events batch multiple updates
2. **Lazy Loading**: Metrics only queried when needed
3. **Client-Side Caching**: Metric updates stored locally
4. **Debounced Updates**: Prevents rapid re-renders
5. **WebSocket Fallback**: Polling for restrictive networks

### Metric Update Frequency
- **Employee Metrics**: Every second (sync check)
- **Org Metrics**: On-demand + periodic refresh
- **System Metrics**: Every 30 seconds (SuperAdmin)

---

## 🔄 Future Enhancements

1. **Organization Dashboard**: Build OrgDashboard.vue with org metrics
2. **Department Analytics**: Per-department real-time metrics
3. **Performance Monitoring**: Track system load and optimize queries
4. **Custom Alerts**: Admin-configurable alert thresholds
5. **Metric History**: Store metric snapshots for trend analysis
6. **Export**: Download metrics as CSV/PDF
7. **Mobile Optimization**: Push notifications for alerts

---

## 📞 Support & Debugging

### Common Issues

**WebSocket Won't Connect**
- Check VITE_API_URL environment variable
- Verify backend Socket.IO is running
- Check browser DevTools > Network > WS tab
- Try fallback transport: check transports array

**Metrics Not Updating**
- Verify joinOrg event sent: `socket.emit('joinOrg', orgId)`
- Check browser console for connection errors
- Verify token in localStorage
- Check server logs for socket events

**Slow Metrics Updates**
- Check database query performance
- Verify network latency (DevTools Throttling)
- Check server CPU/memory usage
- Increase refresh interval if needed

---

## 📖 Summary

The real-time dashboard system provides live data synchronization for employee and organization dashboards. Using Socket.IO WebSockets, metrics update automatically as data changes, improving visibility into operations and providing immediate feedback to users. The system is built for scalability with fallback transports, auto-reconnection, and efficient database queries.
