# Real-Time Dashboards - Quick Reference

## 🎯 Quick Start

### For Component Developers

**Add Real-Time Metrics to Any Component:**

```javascript
import { useDashboardMetrics } from '@/composables/useDashboardMetrics'

export default defineComponent({
  setup() {
    // Initialize with dashboard type
    const { employeeMetrics, isConnected, requestEmployeeMetrics } = 
      useDashboardMetrics({ dashboardType: 'employee' })
    
    // Use in component
    onMounted(() => {
      requestEmployeeMetrics()
    })
    
    return { employeeMetrics, isConnected }
  }
})
```

### Available Composable Properties

```javascript
// State
isConnected          // Boolean: WebSocket connected?
orgMetrics           // Object: Organization metrics
employeeMetrics      // Object: Employee metrics
superadminMetrics    // Object: System metrics
metricUpdates        // Array: History of updates
alerts               // Array: Active alerts

// Methods
requestMetricsRefresh(type)    // 'all'|'orgMetrics'|'employeeMetrics'|'systemMetrics'
requestOrgMetrics()            // Request org metrics
requestEmployeeMetrics()       // Request employee metrics
requestSystemMetrics()         // Request system metrics
clearAlerts()                  // Clear all alerts
emit(event, data)              // Custom socket event
getLatestUpdate(type)          // Get latest update by type
```

---

## 📊 Metric Properties

### Employee Metrics
```javascript
employeeMetrics.value = {
  hoursWorkedToday: 0,        // Hours worked today
  checkedIn: false,           // Currently checked in?
  lastCheckInTime: null,      // Last check-in timestamp
  upcomingShift: null,        // Next scheduled shift
  weeklyHours: 0,             // Hours this week
  monthlyHours: 0,            // Hours this month
  attendanceRate: 0,          // % attendance this month
  onTimeRate: 0,              // % on-time check-ins
  updatedAt: '2024-...'       // Update timestamp
}
```

### Organization Metrics
```javascript
orgMetrics.value = {
  totalEmployees: 0,          // Active employees
  checkedInToday: 0,          // Employees checked in
  attendanceRate: 0,          // % attendance today
  avgHoursWorked: 0,          // Average hours per day
  departmentCount: 0,         // Total departments
  activeShifts: 0,            // Active shifts today
  pendingApprovals: 0,        // Pending requests
  updatedAt: '2024-...'       // Update timestamp
}
```

### System Metrics (SuperAdmin)
```javascript
superadminMetrics.value = {
  totalOrganizations: 0,      // Total orgs
  totalUsers: 0,              // All users
  todayCheckins: 0,           // Global check-ins
  activeOrganizations: 0,     // Active orgs
  systemHealth: 100,          // System health %
  dbLoad: 0,                  // Database load %
  updatedAt: '2024-...'       // Update timestamp
}
```

---

## 🔄 Real-Time Event Handling

### Listen to Specific Events

```javascript
import socket from '@/utils/socket'

// Connection ready
socket.on('connect', () => {
  console.log('Connected!')
})

// Employee metrics updated
socket.on('dashboard:employeeMetrics', (data) => {
  console.log('Metrics:', data)
})

// Alert received
socket.on('dashboard:systemAlert', (alert) => {
  console.log('Alert:', alert.message)
})

// Organization metrics
socket.on('dashboard:orgMetrics', (metrics) => {
  console.log('Org updated:', metrics)
})

// Disconnection
socket.on('disconnect', () => {
  console.log('Disconnected')
})
```

---

## 📱 Common Patterns

### Pattern 1: Sync Metrics to Reactive State

```javascript
const metrics = ref({ hours: 0, rate: 0 })
const { employeeMetrics } = useDashboardMetrics()

// Sync every update
const syncMetrics = () => {
  metrics.value.hours = employeeMetrics.value.hoursWorkedToday
  metrics.value.rate = employeeMetrics.value.attendanceRate
}

// Option A: Watch (Vue 3)
watch(() => employeeMetrics.value, syncMetrics, { deep: true })

// Option B: Manual sync in interval
setInterval(syncMetrics, 1000)
```

### Pattern 2: Auto-Refresh on Mount

```javascript
onMounted(() => {
  // Request data on load
  requestEmployeeMetrics()
  
  // Refresh every 30 seconds
  setInterval(requestEmployeeMetrics, 30000)
})
```

### Pattern 3: Handle Alerts

```javascript
const { alerts, clearAlerts } = useDashboardMetrics()

// Auto-display alerts in toast/notification
watch(() => alerts.value, (newAlerts) => {
  newAlerts.forEach(alert => {
    showNotification(alert.message, alert.severity)
  })
})

// Clear on button click
const handleClearAlerts = () => {
  clearAlerts()
}
```

### Pattern 4: Conditional Rendering

```vue
<template>
  <!-- Show when connected -->
  <div v-if="isConnected" class="status-online">
    Live data enabled ✓
  </div>
  
  <!-- Show metrics -->
  <div class="metrics">
    <p>Hours: {{ employeeMetrics.hoursWorkedToday }}h</p>
    <p>Attendance: {{ employeeMetrics.attendanceRate }}%</p>
  </div>
  
  <!-- Show alerts -->
  <div v-for="alert in alerts" :key="alert.id" class="alert">
    {{ alert.message }}
  </div>
</template>

<script setup>
import { useDashboardMetrics } from '@/composables/useDashboardMetrics'

const { employeeMetrics, isConnected, alerts } = 
  useDashboardMetrics({ dashboardType: 'employee' })
</script>
```

---

## 🛠️ Backend Integration

### Emit Metrics from Controller

```javascript
const { broadcastAttendanceUpdate } = require('../utils/dashboardEmitter')

// In attendance controller
router.post('/checkin', (req, res) => {
  // ... process check-in ...
  
  // Notify organization in real-time
  broadcastAttendanceUpdate(io, req.body.orgId)
  
  res.json({ ok: true })
})
```

### Emit System Alert

```javascript
const { broadcastSystemAlert } = require('../utils/dashboardEmitter')

// Critical system event
broadcastSystemAlert(io, {
  type: 'critical',
  message: 'Database connection lost',
  severity: 'error'
})
```

### Emit Notification

```javascript
const { broadcastNotification } = require('../utils/dashboardEmitter')

// Org-specific notification
broadcastNotification(io, orgId, {
  message: 'New announcement from admin',
  severity: 'info'
})
```

---

## 🧠 Best Practices

### ✅ Do's
- ✓ Use composable for centralized socket management
- ✓ Request metrics on component mount
- ✓ Set refresh intervals for less critical data
- ✓ Clear intervals in unmount hooks
- ✓ Handle connection state gracefully
- ✓ Display connection status to users

### ❌ Don'ts
- ✗ Don't create multiple socket connections
- ✗ Don't ignore connection errors
- ✗ Don't refresh every 100ms (too frequent)
- ✗ Don't forget to clean up intervals
- ✗ Don't assume metrics are always fresh
- ✗ Don't skip error handling

---

## 🔍 Debugging

### Check Connection
```javascript
// In browser console
socket.connected        // Is connected?
socket.id              // Socket ID
socket.io._readyState  // Connection state

// Trigger metrics request
socket.emit('dashboard:requestMetrics', { type: 'all' })
```

### View Network Traffic
1. Open DevTools → Network tab
2. Filter by "WS" for WebSocket connections
3. Click connection to see messages
4. Look for `dashboard:*` events

### Server-Side Logging
```javascript
// In dashboardEmitter.js, add logs
console.log('📊 Emitting org metrics for:', orgId)
console.log('📈 Metrics:', metrics)

// Check socket connections
io.of('/').sockets  // All connected sockets
```

### Connection Issues
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error)
})

socket.on('disconnect', (reason) => {
  console.warn('Disconnected:', reason)
  // 'io server disconnect' = server closed
  // 'io client disconnect' = client closed
  // 'transport close' = network lost
})
```

---

## 📋 Implementation Checklist

For each dashboard needing real-time updates:

- [ ] Import `useDashboardMetrics`
- [ ] Initialize in setup with correct dashboardType
- [ ] Call request method on mount
- [ ] Set refresh interval if needed
- [ ] Sync metrics to component state
- [ ] Display connection status UI
- [ ] Handle alerts/notifications
- [ ] Clean up intervals on unmount
- [ ] Test WebSocket connection
- [ ] Test network disconnect/reconnect

---

## 🚀 Performance Tips

1. **Reduce Refresh Frequency**
   - Don't request every second
   - Use 5-30 second intervals for non-critical data

2. **Batch Updates**
   - Group related metrics in one event
   - Reduce number of socket events

3. **Server-Side Optimization**
   - Cache query results
   - Run expensive queries less frequently
   - Use database indexes on filter columns

4. **Client-Side Optimization**
   - Debounce state updates
   - Use computed properties for derived data
   - Unsubscribe from unused events

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Metrics not updating | Check isConnected, verify joinOrg called |
| WebSocket won't connect | Check VITE_API_URL, verify backend running |
| High memory usage | Clear old metricUpdates, limit history size |
| Duplicate alerts | Use unique alert IDs, check for duplicate events |
| Slow dashboard | Reduce refresh rate, optimize DB queries |
| Alerts disappear too fast | Increase timeout (currently 5s) |

---

## 📚 Related Documentation

- [REALTIME_DASHBOARD_GUIDE.md](REALTIME_DASHBOARD_GUIDE.md) - Full implementation guide
- [USER_DASHBOARD_QUICK_GUIDE.md](USER_DASHBOARD_QUICK_GUIDE.md) - Employee dashboard features
- [DASHBOARD_ENHANCEMENTS.md](DASHBOARD_ENHANCEMENTS.md) - Enhanced features overview
