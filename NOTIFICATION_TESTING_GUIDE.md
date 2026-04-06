# 🔔 Complete Notification System - Testing Guide

## 📋 Overview

The TrackTimi notification system now provides **real-time updates** for all organization activities:

### Who Gets Notifications:
- **SuperAdmins**: Notified about platform-wide events (new orgs, users, departments, locations)
- **Organization Admins**: Notified about their own organization's events (new users, departments, locations)

### Features:
- ✅ Real-time toast notifications (5-second polling)
- ✅ Notification panel with categories & filtering
- ✅ Mark as read / Mark all as read
- ✅ Delete individual notifications
- ✅ Unread count badge
- ✅ Persistent storage in database

---

## 🚀 Testing Scenarios

### **SCENARIO 1: SuperAdmin Creates Organization**

**Steps:**
1. Log in as SuperAdmin (`superadmin@tracktimi.com` / `superpass123`)
2. Navigate to **Dashboard**
3. Click the notification bell icon (top right)
4. **Create a new organization** (use the organizations section)
5. **RESULT**: 
   - ✅ Bell icon shows red badge with "1" unread
   - ✅ Toast notification appears: "🏢 New Organization Created"
   - ✅ Click bell → See notification in panel with "Organization" category

**Expected Properties:**
```
Title: 🏢 New Organization Created
Message: [OrgName] has been registered to the platform
Category: organization
Type: success (green checkmark)
```

---

### **SCENARIO 2: Org Admin Adds New User**

**Steps:**
1. Log in as **Organization Admin** (an org admin user)
2. Navigate to **Employee Management**
3. Click notification bell (top right) - should be empty or show old notifications
4. Click **"Add Employee"** button
5. Fill form with user details and click **Create**
6. **RESULT IMMEDIATELY (within 1-5 seconds)**:
   - ✅ Toast notification appears: "👤 New Employee Added"
   - ✅ Bell icon badge shows unread count
   - ✅ Click bell → See notification in panel with "Users" category

**Expected Properties:**
```
Title: 👤 New Employee Added
Message: [FirstName] [LastName] has been added to your organization
Category: user
Type: success (green checkmark)
```

**ALSO CHECK - SuperAdmin should see:**
- Toast: "👤 New User Registered"
- Panel shows: "[FirstName] [LastName] ([Email]) joined [OrgName]"
- Category: user

---

### **SCENARIO 3: Org Admin Creates Department**

**Steps:**
1. Log in as **Organization Admin**
2. Navigate to **Organization Settings**
3. Click notification bell (top right)
4. Scroll to **Departments** section
5. **Create a new department** (fill name and click Create)
6. **RESULT IMMEDIATELY**:
   - ✅ Toast: "🏢 New Department Created"
   - ✅ Bell badge updates with count
   - ✅ Panel shows notification with "Departments" category

**Expected Properties:**
```
Title: 🏢 New Department Created
Message: [DepartmentName] has been created in your organization
Category: department
Type: success (green checkmark)
```

---

### **SCENARIO 4: Org Admin Adds Location/Geofence**

**Steps:**
1. Log in as **Organization Admin**
2. Navigate to **Organization Settings**
3. Click notification bell
4. Scroll to **Geofences/Locations** section
5. **Create a new location** with:
   - Location Name: "Office HQ"
   - Latitude/Longitude: Any coordinates
   - Radius: 200m
6. **RESULT IMMEDIATELY**:
   - ✅ Toast: "📍 New Location Added"
   - ✅ Bell shows unread count
   - ✅ Panel shows notification with "Locations" category

**Expected Properties:**
```
Title: 📍 New Location Added
Message: Office HQ has been added to your organization (Radius: 200m)
Category: location
Type: success (green checkmark)
```

---

## 🎯 Notification Panel Features Testing

### **Test 1: Filter by Category**

1. Click bell icon to open **Notification Panel**
2. See filter tabs at top:
   - **All** (shows all notifications)
   - **Unread** (only unread notifications)
   - **Organizations** (org creation only)
   - **Users** (user additions)
   - **Departments** (department creation)
   - **Locations** (geofence creation)
   - **Attendance** (not yet triggered)
   - **System** (not yet triggered)

3. **TEST**: Click each tab and verify correct notifications appear

### **Test 2: Mark as Read**

1. Click on an unread notification in the panel
2. **RESULT**: 
   - ✅ Notification background changes from blue to white
   - ✅ Unread badge disappears from that notification
   - ✅ Unread count decreases

### **Test 3: Mark All Read**

1. Open Notification Panel with multiple unread notifications
2. Click **"Mark All as Read"** button (bottom left)
3. **RESULT**:
   - ✅ All notifications change to white background
   - ✅ Bell badge disappears (unread count = 0)

### **Test 4: Delete Notification**

1. Hover over notification in panel
2. Click **X button** (top right of notification)
3. **RESULT**:
   - ✅ Notification disappears from list immediately
   - ✅ Displayed count updates
   - ✅ (Backend: Deleted from database)

### **Test 5: Close Panel**

1. Click **"Close"** button or click X icon (top right)
2. **RESULT**: Panel closes, toasts continue to appear

---

## 🔍 Detailed Verification Checklist

### SuperAdmin Dashboard:
- [ ] Bell icon visible (top right of header)
- [ ] Red badge shows when unread count > 0
- [ ] Click bell → Panel opens with proper styling
- [ ] Can create organization → Notification appears within 5 seconds
- [ ] Toast notification appears for new events
- [ ] Can filter notifications by category
- [ ] Can delete individual notifications
- [ ] Can mark all as read
- [ ] Unread count refreshes automatically

### Org Admin - Organization Settings:
- [ ] Bell icon visible (top right, next to header)
- [ ] Can create department → Notification appears
- [ ] Can create location → Notification appears
- [ ] Panel opens with proper styling
- [ ] All notification functions work
- [ ] Notifications persist when switching sections
- [ ] 5-second auto-refresh works

### Org Admin - Employee Management:
- [ ] Bell icon visible (top right, with unread count)
- [ ] Can add employee → Notification appears immediately
- [ ] Toast notification style matches design
- [ ] Panel shows full notifications with all details
- [ ] Can filter/mark/delete in panel
- [ ] Unread count updates correctly

---

## 📊 Expected Notification Activity Timeline

### User Adds New Employee:
```
0s  - Click "Create" button
1s  - Database INSERT into User table
1s  - Backend calls notifyNewUser()
2s  - Notification INSERT for superadmin(s)
2s  - Notification INSERT for org admin
3s  - Toast notification displays for org admin
5s  - Frontend polling fetches new notifications
5s  - Bell badge updates
10s - Superadmin's frontend polling fetches notification
10s - Superadmin sees toast notification
```

---

## 🐛 Troubleshooting

### **No notifications appearing:**
- Check browser console for errors (F12 → Console tab)
- Verify auth token is valid: `localStorage.getItem('authToken')`
- Check backend is running: Open `http://localhost:4000/api/admin/stats`
- Check database has User table with Notification table

### **Toast appears but panel is empty:**
- Wait 5 seconds for polling (or less, depending on timing)
- Refresh page (Cmd/Ctrl + R)
- Check that user ID matches in JWT token

### **Bell badge not updating:**
- Verify polling interval is 5 seconds (check console for fetch requests)
- Check `/notifications/unread/count` endpoint returns correct data
- Try logging out and back in

### **Notifications visible but not filtering correctly:**
- Verify Category field in database has correct values
- Expected categories: organization, user, department, location, attendance, system, billing, general

---

## 📝 Database Fields Reference

### Notification Table Schema:
```sql
CREATE TABLE Notification (
    Notify_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    User_ID INTEGER NOT NULL,           -- Who receives it
    Org_ID INTEGER,                     -- Organization context
    Title TEXT NOT NULL,                -- Display title
    Message TEXT NOT NULL,              -- Full message
    Type TEXT DEFAULT 'info',           -- info|warning|alert|urgent
    Category TEXT DEFAULT 'general',    -- Notification category
    Is_Read BOOLEAN DEFAULT 0,          -- Read status
    Action_URL TEXT,                    -- Link to related resource
    Related_Record_ID INTEGER,          -- ID of created resource
    Created_at DATETIME,                -- Timestamp
    Read_at DATETIME                    -- When marked as read
);
```

---

## 🎨 Notification Design Reference

### Icons by Type:
- ✅ Success: Green checkmark
- ❌ Error: Red X
- ⚠️ Warning: Yellow alert triangle
- ℹ️ Info: Blue information circle

### Colors by Category:
- 🏢 Organization: Blue border
- 👤 User: Purple border
- 🏢 Department: Green border
- 📍 Location: Orange border
- 📊 Attendance: Yellow border
- ⚙️ System: Red border
- 💳 Billing: Pink border
- 📢 General: Gray border

---

## 🚀 Next Steps (Optional Enhancements)

1. **WebSocket Integration** (Real-time push instead of polling)
   - Would eliminate 5-second delay
   - Better for production scenarios

2. **Email Notifications**
   - Send email when important events occur
   - Allow users to configure preferences

3. **SMS Alerts**
   - Critical events (geofence violations, late clock-ins)
   - Immediate notification outside of app

4. **Notification History/Archive**
   - Keep notifications for 30+ days
   - Search and filter historical notifications

5. **User Preferences**
   - Allow users to mute specific categories
   - Set notification frequency
   - Choose notification channels (app/email/sms)

---

## ✅ Sign-Off Checklist

Before considering the notification system complete:

- [ ] All 4 org admin activities trigger notifications
- [ ] Both superadmin AND org admin receive appropriate notifications
- [ ] Toast notifications appear within 5 seconds
- [ ] Notification panel opens and closes properly
- [ ] All categories filter correctly
- [ ] Mark/delete/mark-all-read all work
- [ ] Unread badges update in real-time
- [ ] Notifications persist after page refresh
- [ ] No console errors on any dashboard
- [ ] Tested on multiple users simultaneously (optional)
