# User Dashboard - Quick Reference Guide

## For Users: Your Dashboard Features

### 📱 Main Dashboard (`/dashboard`)

**What You Can See (Read-Only):**
- ✓ Your current status (Working / Off-Duty)
- ✓ Today's scheduled shift time
- ✓ When you can clock in (clock-in window)
- ✓ Your attendance records for today
- ✓ All your past attendance history
- ✓ Your profile information (Employee ID, Email, Job Title)
- ✓ Notifications and alerts from your organization
- ✓ Upcoming shifts (next 7 days)
- ✓ Work statistics (hours worked, on-time rate, etc.)

**What You Can Do:**
- ✓ Clock in (when at work location + within time window)
- ✓ Clock out (when at work location + shift time)
- ✓ Mark notifications as read
- ✓ View all your notifications

**What You CANNOT Do:**
- ✗ Edit your profile
- ✗ Edit your schedule
- ✗ Edit your attendance records
- ✗ Delete anything

---

## 🕐 Clock-In/Clock-Out Guide

### Clock-In Rules:
1. **Be at Work Location** - Must be within GPS geofence radius
2. **Clock-In Window** - Can only clock in up to X minutes after shift start (set by admin)
3. **GPS Required** - Must allow location access
4. **Single Session** - Can't clock in twice

**Example:**
- Shift starts: 9:00 AM
- Clock-in window: 30 minutes (set by admin)
- You can clock in from 9:00 AM to 9:30 AM
- If you clock in at 9:25 AM → On time ✓
- If you clock in at 9:35 AM → Too late ✗ (window closed)

### Clock-Out Rules:
1. **Be at Work Location** - Same GPS requirement
2. **Be Clocked In** - Can't clock out if not clocked in
3. **Get Alert** - System will remind you X minutes before shift ends

**Alert Example:**
- Shift ends: 5:00 PM
- Alert sent at: 4:45 PM (15 min before)
- Message: "Your shift ends at 5:00 PM. Please clock out."
- You have until 5:00 PM to manually clock out

---

## 🔔 Notifications

### Types of Notifications:
- 🔴 **Urgent** - Critical system messages
- 🟣️️ **Warning** - Clock-out reminders, late alerts
- 🔵 **Info** - General information
- ⚫ **Alert** - Shift-related updates

### Managing Notifications:
- All unread notifications appear as toasts (pop-ups)
- Click the X to dismiss
- Click "Mark as read" button to mark individual notifications
- Click "Mark all as read" to clear all notifications
- Scroll through notification history in Notifications section

---

## ⚙️ For Admins: Organization Settings

### Access Admin Settings:
1. Navigate to `/admin/settings`
2. Only admins can access this page
3. Changes apply organization-wide immediately

### Settings You Can Configure:

#### 1. 📋 Attendance Policies
- **Clock-in Window** (0-120 minutes)
  - How many minutes AFTER shift start employees can still clock in
  - Example: 30 = employees have 30-minute grace period
  - 0 = strict, on-time only
  
- **Clock-out Alert** (5-60 minutes)
  - When to remind employees to clock out before shift ends
  - Example: 15 = alert at 15 minutes before shift end
  - Recommended: 15 minutes

#### 2. 📍 Work Locations
- View all configured geofences
- Shows location name, radius, and coordinates
- Active/Inactive status
- Contact IT to add/modify locations

#### 3. 🔔 Notifications
- Enable/disable clock-in confirmations
- Enable/disable clock-out reminders
- Enable/disable late clock-in alerts
- Enable/disable organization announcements

#### 4. ℹ️ Dashboard Info
- View feature descriptions
- See access control rules
- Review current settings in effect

---

## 🎯 Common Scenarios

### Scenario 1: Employee Clocks In Late
```
Shift start: 9:00 AM
Clock-in window: 30 minutes
Employee arrives at 9:25 AM and clocks in
✓ ALLOWED - Within clock-in window (25 minutes late)
│
├─ Attendance record marked with: Is_Late_Clock_In = true, Minutes_Late = 25
├─ Employee sees notification
└─ Admin can see in reports
```

### Scenario 2: Employee Clocks In Too Late
```
Shift start: 9:00 AM
Clock-in window: 30 minutes (closes at 9:30 AM)
Employee arrives at 9:35 AM and tries to clock in
✗ DENIED - Outside clock-in window (35 minutes late)
│
├─ Error message: "Clock-in window closed. Window was 30 minutes after shift start."
└─ Employee must contact admin for manual adjustment
```

### Scenario 3: Clock-out Alert
```
Afternoon:
- Employee is clocked in
- Shift ends at 5:00 PM
- Alert is set to 15 minutes before

Timeline:
4:45 PM ← Alert notification sent to employee
4:50 PM ← Employee sees notification
4:55 PM ← Employee gets another reminder (if available)
5:00 PM ← Shift officially ends
         └─ If not clocked out: "Late clock-out" flag in system
```

### Scenario 4: Admin Changes Clock-in Window
```
Before: Clock-in window was 30 minutes
After admin changes to: 15 minutes

Effect on existing shifts:
├─ Takes effect immediately
├─ Only affects NEW clock-in attempts
└─ Past records are NOT changed (historical accuracy)

Next day:
└─ Employees have only 15 minutes after shift start to clock in
```

---

## ⏰ Time Window Examples

### Lenient Organization (Building A)
```
Clock-in Window: 60 minutes
Clock-out Alert: 15 minutes

Shift: 9:00 AM - 5:00 PM
├─ Clock-in available: 9:00 AM - 10:00 AM (60 min grace)
├─ Clock-out reminder sent: 4:45 PM (15 min before)
└─ Late clocks tracked but generally acceptable
```

### Strict Organization (Building B)
```
Clock-in Window: 0 minutes
Clock-out Alert: 10 minutes

Shift: 9:00 AM - 5:00 PM
├─ Clock-in available: 9:00 AM EXACTLY
├─ Any clock-in after 9:00 AM: marked as late
├─ Clock-out reminder sent: 4:50 PM (10 min before)
└─ On-time rates tracked closely
```

### Balanced Organization (Building C)
```
Clock-in Window: 15 minutes
Clock-out Alert: 15 minutes

Shift: 9:00 AM - 5:00 PM
├─ Clock-in available: 9:00 AM - 9:15 AM (15 min grace)
├─ Clock-out reminder sent: 4:45 PM (15 min before)
├─ Few minutes late is acceptable
└─ System tracks patterns for analysis
```

---

## 🔧 Troubleshooting

### "You are already clocked in"
**Problem:** Trying to clock in twice
**Solution:** Clock out first, then clock in again

### "Clock-in window closed"
**Problem:** Clocking in more than X minutes after shift start
**Solution:** Contact admin for manual adjustment or wait for next shift

### "You must be at the work zone to clock out"
**Problem:** GPS location outside geofence
**Solution:** Move to work location or contact admin

### "No shift scheduled for today"
**Problem:** No shift assigned for today's date
**Solution:** Ask admin to assign a shift

### "Clock-out alert not appearing"
**Problem:** No notification before shift end
**Solution:** 
- Check that you're clocked in
- Open Settings → Notifications to verify settings enabled
- Alert only shows within 5-15 minutes of shift end
- Try refreshing dashboard

---

## 📊 Understanding Your Dashboard

### Status Bar (Top)
- **Status:** Shows if you're currently clocked in
- **Daily Shift:** Your scheduled shift time
- **Clock-in Window:** How long you have to clock in
- **Unread Alerts:** Number of notifications awaiting

### Main Clock Card
- Shows prominent clock-in/out button
- Displays current GPS accuracy
- Shows distance to nearest work zone
- Button disabled if outside zone

### Attendance Section
- Today's clock-in/out records
- Shows if clocked in late (with minutes)
- Shows what time you clocked out

### Notifications Section
- All system messages to you
- Organization announcements
- Clock-out reminders
- Late clock-in alerts
- Any configuration changes

### Statistics Section
- Total days attended this month
- On-time percentage
- Hours worked (last 7 days)
- Shift completion rate

---

## 🛡️ Privacy & Security

**What's Protected:**
- Your profile data is read-only (others can't change it)
- Your location data used only for clock-in/out
- Notifications are personal to you
- Attendance records are confidential

**GPS Privacy:**
- GPS is only used when clock-in/out button is clicked
- Not tracked throughout the day
- Only transmits when you take action
- Location data encrypted in transit

---

## 📞 Getting Help

**For Employee Issues:**
1. Check this guide first
2. Try refreshing your dashboard
3. Contact your manager
4. Contact HR for attendance issues

**For Admin/Setup Questions:**
1. Review admin settings section
2. Contact IT support
3. Check system logs for errors

---

**Last Updated:** April 2026
**Version:** 1.0
