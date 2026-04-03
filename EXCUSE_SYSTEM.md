# 🎯 EXCUSE/LEAVE REQUEST SYSTEM WITH LIVE NOTIFICATIONS

## Overview
Users can submit excuses/leave requests for absences or late arrivals. Org-admins must approve them before they're recorded. All actions trigger **live notifications with Socket.IO**.

---

## 📋 SYSTEM WORKFLOW

```
1. USER SUBMITS EXCUSE
   ↓
2. NOTIFICATION SENT TO ADMINS (Real-time via Socket.IO)
   ↓
3. ADMIN REVIEWS EXCUSE
   ↓
4. ADMIN APPROVES/REJECTS (Real-time notification to user)
   ↓
5. USER ALERTED WITH RESULT (Including icon/status)
```

---

## 🔌 LIVE SOCKET.IO EVENTS

### **User Submitting Excuse**
**Event:** `excuse:submitted`
```javascript
// Emitted to: Admins of the organization
{
  excuseId: 123,
  userId: 45,
  userName: "Divine Fallah",
  excuseType: "LATE",           // LATE, ABSENT, EARLY_EXIT, LEAVE
  reason: "Traffic jam on way to office",
  dateAffected: "2026-04-03",
  timestamp: "2026-04-03T10:30:00Z"
}
```

### **Admin Approving Excuse**
**Event:** `excuse:approved`
```javascript
// Emitted to: The user
{
  excuseId: 123,
  excuseType: "LATE",
  dateAffected: "2026-04-03",
  approvalNotes: "Approved due to traffic",
  approvedBy: "Mimi Admin",
  timestamp: "2026-04-03T10:35:00Z"
}
```

### **Admin Rejecting Excuse**
**Event:** `excuse:rejected`
```javascript
// Emitted to: The user
{
  excuseId: 123,
  excuseType: "LATE",
  dateAffected: "2026-04-03",
  rejectionReason: "No documentation provided",
  rejectedBy: "Mimi Admin",
  timestamp: "2026-04-03T10:35:00Z"
}
```

---

## 📱 API ENDPOINTS

### **USER ENDPOINTS**

#### 1. **Submit Excuse**
```
POST /api/excuses
Content-Type: application/json

{
  "excuseType": "LATE",                    // Required: LATE, ABSENT, EARLY_EXIT, LEAVE
  "reason": "Traffic delay",               // Required: Explanation
  "dateAffected": "2026-04-03",           // Required: YYYY-MM-DD
  "attendId": 456                          // Optional: Link to attendance record
}
```

**Response (201):**
```json
{
  "success": true,
  "excuseId": 123,
  "message": "Excuse submitted for admin review. You will be notified when it is reviewed."
}
```

---

#### 2. **Get My Excuses**
```
GET /api/excuses/my
```

**Response:**
```json
{
  "success": true,
  "excuses": [
    {
      "Excuse_ID": 123,
      "Excuse_Type": "LATE",
      "Reason": "Traffic jam",
      "Status": "APPROVED",        // PENDING, APPROVED, REJECTED
      "Date_Affected": "2026-04-03",
      "Created_at": "2026-04-03T10:30:00Z",
      "Approved_At": "2026-04-03T10:35:00Z",
      "Approval_Notes": "Approved",
      "Attachment_Name": null
    }
  ],
  "summary": {
    "total": 1,
    "pending": 0,
    "approved": 1,
    "rejected": 0
  }
}
```

---

### **ADMIN ENDPOINTS**

#### 3. **Get Pending Excuses** (Admin Only)
```
GET /api/excuses/admin/pending?status=PENDING
```

**Response:**
```json
{
  "success": true,
  "excuses": [
    {
      "Excuse_ID": 123,
      "User_ID": 45,
      "First_Name": "Divine",
      "SurName": "Fallah",
      "Email": "divine@domain.com",
      "Employee_ID": "EMP001",
      "Excuse_Type": "LATE",
      "Reason": "Traffic delay on way to office",
      "Status": "PENDING",
      "Date_Affected": "2026-04-03",
      "Created_at": "2026-04-03T10:30:00Z",
      "Check_in_time": "2026-04-03T09:45:00Z",
      "Attachment_Name": null
    }
  ],
  "summary": {
    "total": 1,
    "bystatus": {
      "pending": 1,
      "approved": 0,
      "rejected": 0
    }
  }
}
```

---

#### 4. **Approve Excuse** (Admin Only)
```
POST /api/excuses/:excuseId/approve

{
  "approvalNotes": "Approved due to traffic"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Excuse approved successfully. User notified."
}
```

**LIVE NOTIFICATION SENT TO USER** via Socket.IO `excuse:approved` event

---

#### 5. **Reject Excuse** (Admin Only)
```
POST /api/excuses/:excuseId/reject

{
  "rejectionReason": "No documentation provided"  // Required
}
```

**Response:**
```json
{
  "success": true,
  "message": "Excuse rejected. User notified."
}
```

**LIVE NOTIFICATION SENT TO USER** via Socket.IO `excuse:rejected` event

---

## 🔔 NOTIFICATION TRIGGERS

### **When Notification is Sent**
| Action | Who Notified | Event | Status |
|--------|--------------|-------|--------|
| User submits excuse | Admins | `excuse:submitted` | ⚠️ Alert |
| Admin approves | User | `excuse:approved` | ✅ Success |
| Admin rejects | User | `excuse:rejected` | ❌ Warning |

### **Notification Categories**
- **excuse** - Used for all excuse-related notifications
- **schedule** - Used for schedule changes
- **policy** - Used for policy/setting updates

---

## 💾 DATABASE SCHEMA

### **Excuse Table**
| Column | Type | Description |
|--------|------|-------------|
| Excuse_ID | INTEGER PK | Unique excuse ID |
| User_ID | INTEGER FK | User who submitted |
| Org_ID | INTEGER FK | Organization |
| Attend_ID | INTEGER FK | Related attendance record |
| Excuse_Type | TEXT | LATE/ABSENT/EARLY_EXIT/LEAVE |
| Reason | TEXT | User's explanation |
| Status | TEXT | PENDING/APPROVED/REJECTED |
| Approved_By | INTEGER FK | Admin who reviewed |
| Approval_Notes | TEXT | Admin's notes on decision |
| Approved_At | DATETIME | When admin reviewed |
| Date_Affected | TEXT | Date of the absence |
| Created_at | DATETIME | When submitted |

---

## 🎨 FRONTEND ICON INDICATORS

### **Excuse Status Icons**
- ⏳ **PENDING** - Gray/neutral icon (waiting for review)
- ✅ **APPROVED** - Green checkmark (accepted)
- ❌ **REJECTED** - Red X (not approved)

### **Notification Icons in Real-time**
- 🔔 **New Excuse Submitted** - Alert icon (for admins)
- ✅ **Excuse Approved** - Success icon (for user)
- ❌ **Excuse Rejected** - Error icon (for user)

---

## 📌 IMPLEMENTATION NOTES

1. **Attachment Support**: System supports file attachments (documents, images) up to configured file size
2. **Real-time Updates**: Uses Socket.IO for instant notifications without page refresh
3. **Admin Approval Required**: No excuse is recorded until admin explicitly approves
4. **Audit Trail**: All approvals/rejections logged with admin info and timestamps
5. **User Privacy**: Only relevant admins and the user can see excuse details

---

## 🚀 NEXT STEPS

1. **Database Migration**: Run `/backend/run-excuse-migration.js` ✅ (Already done)
2. **Start Backend**: `npm start` to enable Socket.IO
3. **Frontend Implementation**:
   - Create ExcuseSubmission.vue component
   - Add notification listener in dashboard
   - Show excuse status in profile
   - Create AdminExcuseReview.vue for admins

---

## 📡 SOCKET.IO ROOMS

- `org:{orgId}` - All users in organization (receives schedule/admin updates)
- `user:{userId}` - Specific user (receives personal notifications)
- `admin:{adminId}` - Specific admin (receives new excuse alerts)

---
