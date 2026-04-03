# User Dashboard Implementation Guide

## 📋 Overview

A comprehensive user dashboard has been implemented with the following features:

- **User Dashboard** - Read-only view of schedule, attendance, profile, and notifications
- **Clock-in/out System** - GPS-based with configurable time windows
- **Automatic Alerts** - Clock-out reminders 15 minutes before shift end
- **Notification System** - Real-time alerts for organization updates and system events
- **Organization Settings** - Admin control panel for configuring attendance policies

---

## ✅ What Was Implemented

### 1. Database Schema Updates
**File:** `backend/sql/migration_add_user_dashboard_features.sql`

#### New Columns Added to Organization Table:
- `Clock_In_Window_Minutes` (INTEGER, DEFAULT: 30)
  - Controls how many minutes after shift start employees can still clock in
  - Configurable by organization admin
  - Example: 30 minutes = employees can clock in up to 30 min late

- `Clock_Out_Alert_Minutes` (INTEGER, DEFAULT: 15)
  - Time before shift end when system sends clock-out alert
  - Configurable by organization admin
  - Example: 15 minutes = alert sent 15 min before shift end

#### New Tables Created:
1. **Notification Table**
   - Stores all user notifications and alerts
   - Fields: User_ID, Org_ID, Title, Message, Type, Category, Is_Read, Created_at
   - Used for system announcements, alerts, and updates

2. **Clock_Out_Alert Table**
   - Tracks when clock-out alerts have been sent
   - Prevents duplicate alerts for same attendance record
   - Links attendance, shifts, and notifications

#### Enhanced Columns in Attendance Table:
- `Is_Late_Clock_In` (BOOLEAN) - Flags if employee clocked in after shift start
- `Minutes_Late` (INTEGER) - How many minutes late the check-in was
- `Clock_In_Window_Used` (BOOLEAN) - Whether grace period was used

#### Created Views:
- `UserTodayShift` - Quick access to user's shift for today
- `UserAttendanceWithShift` - Attendance history with computed duration

---

### 2. Backend Models

#### New Models Created:

**`backend/models/Notification.js`**
```javascript
// Methods:
Notification.create()          // Create new notification
Notification.findByUserId()    // Get user's notifications
Notification.getUnreadCount()  // Count unread notifications
Notification.findByCategory()  // Filter by category (schedule, attendance, etc.)
Notification.markAsRead()      // Mark single notification
Notification.markAllAsRead()   // Mark all notifications as read
Notification.delete()          // Delete notification
Notification.deleteOlderThan() // Cleanup old notifications
```

**`backend/models/ClockOutAlert.js`**
```javascript
// Methods:
ClockOutAlert.create()         // Create alert record
ClockOutAlert.hasAlertBeenSent() // Check if alert already sent
ClockOutAlert.getRecentAlerts() // Get recent alerts for user
```

---

### 3. Backend Controllers

#### Enhanced `attendance.controller.js`

**Helper Functions:**
- `getOrgClockInSettings()` - Fetch org's clock-in window and alert settings
- `getUserTodayShift()` - Get user's shift for today
- `isClockInWithinWindow()` - Validate if clock-in time is within allowed window

**Clock-in Enhancement:**
- Validates clock-in against organization's configured window
- Tracks late clock-ins with minutes late
- Provides detailed error messages if outside window
- Response includes: `isLate`, `minutesLate`

**New Endpoints:**

1. **GET `/attendance/dashboard/summary`** - Read-only dashboard data
   - Returns: user profile, today's shift, current sessions, attendance history, upcoming shifts, notifications, clock-out alert info, org settings

2. **GET `/attendance/notifications`** - Fetch user notifications
   - Query param: `limit` (default 50)
   - Returns: unread first, ordered by creation date

3. **PUT `/attendance/notifications/:notifyId/read`** - Mark notification as read
   - Updates `Is_Read` and `Read_at` timestamp

4. **POST `/attendance/alerts/check-clock-out`** - Trigger clock-out alerts (admin)
   - Checks for active sessions with approaching shift end
   - Creates notifications 15 minutes before shift end
   - Prevents duplicate alerts
   - Emits real-time socket events

---

### 4. Backend Routes

#### Enhanced `attendance.routes.js`

```javascript
// Dashboard
router.get('/attendance/dashboard/summary', getU serDashboard);

// Notifications
router.get('/attendance/notifications', getNotifications);
router.put('/attendance/notifications/:notifyId/read', markNotificationAsRead);

// Clock-out alerts
router.post('/attendance/alerts/check-clock-out', checkAndSendClockOutAlerts);
```

#### Enhanced `org.routes.js`

```javascript
// Organization Settings
router.get('/org/settings', getOrgSettings);           // Get attendance policies
router.put('/org/settings', updateOrgSettings);         // Update by admin

// Geofences
router.get('/org/geofences', getOrgGeofences);         // List work locations
```

---

### 5. Frontend Components

#### **`UserDashboard.vue`** - Main User Interface

**Sections:**
1. **Header** - Welcome message, quick actions (refresh, settings)
2. **Quick Status Grid** - Current status, today's shift, clock-in window, unread alerts
3. **Clock In/Out Card** - GPS validation, time window info, action button
4. **Today's Attendance** - List of check-ins/outs with late flags
5. **Notifications** - Real-time alerts and system announcements
6. **Upcoming Shifts** - Next 7 days scheduled shifts
7. **Work Statistics** - Attendance records, on-time %, hours worked
8. **Profile (Read-only)** - Employee ID, Email, Job Title, Hire Date

**Key Features:**
- Read-only profile, schedule, and attendance views
- Real-time location monitoring for clock-in/out
- Automatic refresh every 30 seconds
- Toast notifications for alerts
- Time window countdown
- Clock-out alert preview showing when alert will be sent

#### **`OrgSettings.vue`** - Admin Configuration Panel

**Settings Tabs:**
1. **Attendance Policies**
   - Clock-in Window slider (0-120 minutes)
   - Clock-out Alert slider (5-60 minutes)
   - Live preview of policy

2. **Work Locations**
   - List of geofences configured for org
   - Location name, radius, coordinates
   - Active/Inactive status

3. **Notifications**
   - Toggle clock-in confirmations
   - Toggle clock-out reminders
   - Toggle late clock-in alerts
   - Toggle org announcements

4. **Dashboard Info**
   - Feature overview
   - Access control explanation
   - Current settings display

---

## 🔧 How It Works

### Clock-in Workflow:
```
1. User arrives at work location (GPS validated)
2. System checks organization's Clock_In_Window_Minutes setting
3. If within window: Clock-in allowed, record time
4. If after shift start but within window: Clock-in allowed, mark as late
5. If after window closes: Clock-in denied with detailed error
6. System records: Check_in_time, Is_Late_Clock_In, Minutes_Late
```

### Clock-out Alert Workflow:
```
1. User is actively clocked in
2. Admin has set Clock_Out_Alert_Minutes to X minutes
3. When current time = (Shift_End_Time - X minutes):
   - Create notification
   - Record in Clock_Out_Alert table
   - Emit socket event to user's dashboard
   - Alert appears as toast notification
4. User has X minutes to manually clock out
5. Alert only sent once per shift (prevented by duplicate check)
```

### Notification System:
```
1. System event triggers (clock-out time, org update, etc.)
2. Notification.create() stores notification in DB
3. Socket event emitted to user in real-time
4. User sees toast notification
5. Notification marked as read when user clicks it
6. All notifications viewable in notifications section
```

---

## 📊 Key Settings

### Organization Admin Settings:

1. **Clock-in Window**
   - Default: 30 minutes
   - Min: 0 (on-time only)
   - Max: 120 (very lenient)
   - Example: 30 = employees can clock-in 30 min after shift start

2. **Clock-out Alert**
   - Default: 15 minutes
   - Min: 5 minutes
   - Max: 60 minutes
   - Example: 15 = alert sent 15 min before shift end

3. **Alert Categories:**
   - `'urgent'` - System critical alerts (red)
   - `'warning'` - Clock-out reminders, late alerts (yellow)
   - `'info'` - General information (blue)
   - `'alert'` - Shift-related alerts (gray)

---

## 🔒 Access Control

### User Dashboard - Read-Only Access:
- ✗ Users CANNOT edit profile
- ✗ Users CANNOT edit schedule
- ✗ Users CANNOT edit attendance
- ✓ Users can view all their data
- ✓ Users can clock in/out
- ✓ Users receive notifications
- ✓ Users can mark notifications as read

### Admin Settings - Admin-Only Access:
- ✓ Only organization admins can configure settings
- ✓ Settings apply organization-wide
- ✓ Changes take effect immediately
- ✓ Geofences are managed separately

---

## 📲 Frontend API Calls

```javascript
// Dashboard
GET  /api/attendance/dashboard/summary
// Returns: complete dashboard state

// Notifications
GET  /api/attendance/notifications?limit=50
PUT  /api/attendance/notifications/:notifyId/read

// Clock-in/out
POST /api/attendance/checkin  { latitude, longitude }
POST /api/attendance/checkout { latitude, longitude }

// Organization Settings
GET  /api/org/settings
PUT  /api/org/settings { Clock_In_Window_Minutes, Clock_Out_Alert_Minutes }
GET  /api/org/geofences
```

---

## 🚀 Deployment Steps

### 1. Run Database Migration
```bash
cd backend
# Execute migration file to add columns and tables
sqlite3 database.db < sql/migration_add_user_dashboard_features.sql
```

### 2. Ensure Backend Routes are Loaded
The attendance and org routes should already be registered in your main server.js:
```javascript
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/org', require('./routes/org.routes'));
```

### 3. Frontend Routes (if needed)
Add to your router configuration:
```javascript
{
  path: '/dashboard',
  component: () => import('@/views/tenant/UserDashboard.vue')
},
{
  path: '/admin/settings',
  component: () => import('@/views/admin/OrgSettings.vue'),
  meta: { requiresAdmin: true }
}
```

### 4. Socket Events (if using real-time)
Server should emit these events:
```javascript
socket.emit('clock_out_alert', { title, message, shiftEndTime, minutesBefore })
socket.emit('notification:new', { notifData })
socket.emit('attendance:created', { attendanceData })
socket.emit('attendance:updated', { attendanceData })
```

---

## 🧪 Testing the Features

### Test Clock-in Window:
1. Go to OrgSettings.vue
2. Set Clock_In_Window_Minutes to 5
3. Try clocking in 3 min after shift start (should work - late)
4. Try clocking in 7 min after shift start (should fail)
5. Change to 15, repeat (should work)

### Test Clock-out Alert:
1. Clock in
2. Set Clock_Out_Alert_Minutes to 1
3. Wait until 1 minute before shift end
4. Should see toast notification
5. Alert only appears once per shift

### Test Read-only Access:
1. User dashboard should show all data but no edit buttons
2. Notifications are read-only
3. Profile section is read-only
4. Only buttons: Clock in/out, Mark as read, Refresh

---

## 📝 Troubleshooting

### Clock-in says "No shift scheduled"
- Check that user has a Shift record for today
- Make sure shift is set to `Is_Active = 1`
- Verify shift date matches current date

### Clock-out alert not appearing
- Check that user has a Shift for today
- Verify if `Clock_Out_Alert_Minutes` is set correctly
- Make sure user is clocked in
- Check browser console for socket connection
- Alert only appears within X minutes of shift end

### Settings not saving
- Check browser console for API errors
- Verify user is admin (has Role_ID = 1)
- Check that Org_ID is correct
- Validate values are within range (Clock_In_Window: 0-120, Clock_Out_Alert: 5-60)

---

## 📚 Files Modified/Created

### Backend:
- ✅ `backend/sql/migration_add_user_dashboard_features.sql` (NEW)
- ✅ `backend/models/Notification.js` (NEW)
- ✅ `backend/models/ClockOutAlert.js` (NEW)
- ✅ `backend/controllers/attendance.controller.js` (MODIFIED)
- ✅ `backend/routes/attendance.routes.js` (MODIFIED)
- ✅ `backend/routes/org.routes.js` (MODIFIED)

### Frontend:
- ✅ `frontend/src/views/tenant/UserDashboard.vue` (ENHANCED)
- ✅ `frontend/src/views/admin/OrgSettings.vue` (NEW)

---

## 🎯 Next Steps (Optional Enhancements)

1. **Email Notifications** - Send email on clock-out alerts
2. **SMS Alerts** - SMS reminder for clock-out
3. **Mobile App** - Native mobile version of dashboard
4. **Advanced Analytics** - Charts, trends, reports
5. **Break Tracking** - Track break times
6. **Leave Management** - PTO and leave requests
7. **Shift Swapping** - Allow shift exchanges between employees
8. **Dashboard Widgets** - Customizable dashboard layout

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend console logs
3. Verify database tables were created with migration
4. Check API responses in browser Network tab
5. Ensure all required environment variables are set

---

**Implementation Date:** April 2026
**Version:** 1.0
**Status:** ✅ Complete and Ready for Testing
