# 🔍 Notification System - Debugging Guide

## 📋 What Was Added for Diagnosis

### Console Logging:

**Frontend (Browser DevTools F12):**
```javascript
🔔 Loading notifications...
📧 Notifications response: [...]
📊 Unread count response: {...}
✅ Unread count set to: 3
```

**Backend (Terminal/Console):**
```
✅ SuperAdmin authenticated with userId: 1
🔔 Backend: Fetching notifications for userId: 1
✅ Found 0 notifications for userId: 1
📊 Backend: Fetching unread count for userId: 1
✅ Unread count for userId 1 : 0
```

---

## 🧪 Step-by-Step Diagnosis

### **Step 1: Open Browser DevTools**
1. Log in to SuperAdmin Dashboard
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for logs starting with: 🔔, 📧, 📊, ✅, ❌

### **Step 2: Check Backend Logs**
1. Open terminal where backend is running (or start it)
2. Look for logs with: ✅, 🔔, 📊, ❌
3. Verify you see: `✅ SuperAdmin authenticated with userId: 1`

### **Step 3: Create a Test Notification**
1. **Create a new organization** as SuperAdmin
2. Watch both console logs (frontend + backend)
3. Check if notification appears in database:

```bash
# In your database terminal/tool:
SELECT * FROM Notification WHERE User_ID = 1;
```

### **Step 4: Verify Badge Updates**
1. After creating organization, wait 5 seconds
2. Notice if:
   - Red badge appears on bell icon with "1"
   - Console shows `✅ Unread count set to: 1`
   - Backend shows `✅ Unread count for userId 1 : 1`

---

## 🎯 Expected Console Output

### **Successful Scenario:**

**Frontend Console (F12):**
```
✅ Unread count set to: 0
🔔 Loading notifications...
📧 Notifications response: []
📊 Unread count response: {unreadCount: 0}

[Wait 5 seconds, create an organization]

🔔 Loading notifications...
📧 Notifications response: [{Notify_ID: 1, Title: "🏢 New Organization Created", ...}]
📊 Unread count response: {unreadCount: 1}
✅ Unread count set to: 1
```

**Backend Console:**
```
✅ SuperAdmin authenticated with userId: 1
🔔 Backend: Fetching notifications for userId: 1
✅ Found 0 notifications for userId: 1
📊 Backend: Fetching unread count for userId: 1
✅ Unread count for userId 1 : 0

[Organization created...]

🔔 Backend: Fetching notifications for userId: 1
✅ Found 1 notifications for userId: 1
📊 Backend: Fetching unread count for userId: 1
✅ Unread count for userId 1 : 1
```

---

## ❌ Common Issues & Solutions

| Issue | Console Shows | Solution |
|-------|--------------|----------|
| **Token missing** | `❌ No token provided` | Clear browser storage, log out and back in |
| **Invalid token** | `❌ Token verification error` | Token expired, log out and back in |
| **Wrong role** | `❌ Not a SuperAdmin token` | Using wrong user account |
| **No userId** | `❌ User ID not found in token` | Check JWT token includes `userId` |
| **0 notifications** | `✅ Found 0 notifications` | Haven't created any events yet |
| **Database error** | `❌ Database error fetching` | Check database connection in terminal |

---

## 🔧 Quick Fix Checklist

- [ ] Backend is running (check terminal for errors)
- [ ] Database is accessible (check `sqlite3` connectivity)
- [ ] Frontend token is valid (check `localStorage.getItem('superAdminToken')` in DevTools console)
- [ ] Network requests completing (check Network tab in DevTools)
- [ ] No CORS errors (check Console for red errors)
- [ ] Notifications table exists (run `SELECT * FROM Notification;`)

---

## 📝 To Test Manually

### **In Browser Console (F12):**

```javascript
// Check if token exists:
console.log('Token:', localStorage.getItem('superAdminToken'))

// Check frontend state:
// (This depends on Vue instance access - may not work in all setups)
```

### **In Backend Terminal:**

```bash
# View all notifications:
sqlite3 path/to/database.db "SELECT * FROM Notification LIMIT 10;"

# View unread notifications for user 1:
sqlite3 path/to/database.db "SELECT * FROM Notification WHERE User_ID = 1 AND Is_Read = 0;"

# Count notifications per user:
sqlite3 path/to/database.db "SELECT User_ID, COUNT(*) as count FROM Notification GROUP BY User_ID;"
```

---

## 🎯 Next Steps

**After testing:**
1. **Share the console logs** from both frontend and backend
2. **Provide the database query results** from above
3. **Check if badge updates** after creating an event
4. **Verify polling works** (check Request/Response in Network tab)

---

## 📞 Key Things to Check

1. **Is backend running?** → Check terminal for "Server running on port 4000" or similar
2. **Is database accessible?** → Try `sqlite3` command in terminal
3. **Is token valid?** → Check `localStorage.getItem('superAdminToken')` contains text
4. **Are notifications created?** → Check Notification table for recent entries
5. **Is polling working?** → Check Network tab for `/notifications` requests every 5 seconds

---

## 🚀 Once Debugging is Complete

The console logs will show exactly where the issue is:
- ✅ = Working properly
- ❌ = Error occurred
- 🔔, 📧, 📊 = Information logged

Use these logs to identify which step is failing, then we can fix that specific part!
