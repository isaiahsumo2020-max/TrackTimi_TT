# Feedback Feature - Complete Documentation

## Overview

The Feedback feature allows organization members to submit feedback, suggestions, bug reports, and feature requests. Organization admins can view, respond to, and manage all feedback. SuperAdmins can monitor feedback across organizations and track system improvement insights.

## Database Schema

### Feedback Table
```sql
CREATE TABLE Feedback (
  Feedback_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  User_ID INTEGER,
  Org_ID INTEGER,
  Title TEXT NOT NULL,
  Message TEXT NOT NULL,
  Category TEXT,
  Rating INTEGER DEFAULT 5,
  Status TEXT DEFAULT 'pending',
  Response TEXT,
  Responded_By INTEGER,
  Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  Responded_at DATETIME,
  FOREIGN KEY (User_ID) REFERENCES User(User_ID),
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
  FOREIGN KEY (Responded_By) REFERENCES Super_Admin(Admin_ID)
)
```

### Fields
- **Feedback_ID**: Unique identifier (Primary Key)
- **User_ID**: Who submitted the feedback (Foreign Key)
- **Org_ID**: Which organization (Foreign Key)
- **Title**: Short feedback title/subject
- **Message**: Detailed feedback message (up to 500 characters)
- **Category**: Type of feedback (feature, bug, improvement, performance, usability, other)
- **Rating**: User satisfaction rating (1-5 stars)
- **Status**: Current state (pending, responded, acknowledged, closed)
- **Response**: Admin's response to the feedback
- **Responded_By**: SuperAdmin who responded (Foreign Key)
- **Created_at**: Timestamp when feedback was submitted
- **Responded_at**: Timestamp when response was added

---

## API Endpoints

### Base Path: `/api/feedback`

All endpoints require JWT authentication.

#### 1. Submit Feedback
**POST** `/api/feedback`

Submit new feedback to the system.

**Request Body:**
```json
{
  "title": "Attendance Sync Issue",
  "message": "Sometimes the attendance data doesn't sync properly when network is weak",
  "category": "bug",
  "rating": 3
}
```

**Response:**
```json
{
  "success": true,
  "feedback": {
    "Feedback_ID": 1,
    "User_ID": 42,
    "Org_ID": 5,
    "Title": "Attendance Sync Issue",
    "Message": "Sometimes the attendance data doesn't sync properly...",
    "Category": "bug",
    "Rating": 3,
    "Status": "pending",
    "Created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 2. Get All Feedback (Organization)
**GET** `/api/feedback`

Retrieve all feedback for your organization with statistics.

**Query Parameters:**
- `limit` (optional): Maximum number of records (default: 50)

**Response:**
```json
{
  "feedback": [
    {
      "Feedback_ID": 1,
      "User_ID": 42,
      "Title": "Great Dashboard",
      "Message": "Love the new dashboard design!",
      "Category": "general",
      "Rating": 5,
      "Status": "responded",
      "First_Name": "John",
      "SurName": "Doe",
      "Email": "john@example.com",
      "Created_at": "2024-01-15T10:30:00Z",
      "Response": "Thank you for the feedback!",
      "Responded_at": "2024-01-15T14:00:00Z"
    }
  ],
  "stats": {
    "total": 15,
    "pending": 3,
    "responded": 12,
    "avg_rating": 4.2
  }
}
```

---

#### 3. Get Feedback by Category
**GET** `/api/feedback/category/:category`

Filter feedback by category.

**Categories:**
- `feature` - Feature requests
- `bug` - Bug reports
- `improvement` - Improvement suggestions
- `performance` - Performance issues
- `usability` - Usability concerns
- `other` - Other feedback

**Response:**
```json
{
  "feedback": [ /* filtered feedback array */ ]
}
```

---

#### 4. Get Feedback by Status
**GET** `/api/feedback/status/:status`

Filter feedback by status.

**Statuses:**
- `pending` - Not yet responded
- `responded` - Response added
- `acknowledged` - User acknowledged the response
- `closed` - Feedback resolved

**Response:**
```json
{
  "feedback": [ /* filtered feedback array */ ]
}
```

---

#### 5. Get Single Feedback
**GET** `/api/feedback/:feedbackId`

Get detailed information about a specific feedback.

**Response:**
```json
{
  "feedback": {
    "Feedback_ID": 1,
    "User_ID": 42,
    "Org_ID": 5,
    "Title": "Attendance Sync Issue",
    "Message": "Sometimes the attendance data doesn't sync...",
    "Category": "bug",
    "Rating": 3,
    "Status": "pending",
    "First_Name": "John",
    "SurName": "Doe",
    "Email": "john@example.com",
    "Created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 6. Respond to Feedback
**PUT** `/api/feedback/:feedbackId/respond`

Add a response/reply to feedback (admin only).

**Request Body:**
```json
{
  "response": "Thank you for reporting this. We've identified the issue and will fix it in the next release."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback response added"
}
```

---

#### 7. Update Feedback Status
**PUT** `/api/feedback/:feedbackId/status`

Change the status of feedback.

**Request Body:**
```json
{
  "status": "responded"
}
```

**Valid Statuses:**
- `pending`
- `responded`
- `acknowledged`
- `closed`

**Response:**
```json
{
  "success": true,
  "message": "Feedback status updated"
}
```

---

#### 8. Delete Feedback
**DELETE** `/api/feedback/:feedbackId`

Remove feedback from the system.

**Response:**
```json
{
  "success": true,
  "message": "Feedback deleted"
}
```

---

## Frontend Components

### 1. Feedback Form (`Feedback.vue`)
User-facing component for submitting feedback.

**Route:** `/:orgSlug/feedback`

**Features:**
- Form validation (title, message required)
- Star rating selector (1-5 stars)
- Category dropdown
- Character counter (500 max)
- Success toast notification
- Previous feedback history display
- Feedback status and response display

**Usage:**
```vue
<script setup>
import { ref } from 'vue'
import { useFeedback } from '@/composables/useFeedback'

const { submitFeedback } = useFeedback()

const handleSubmit = async (feedbackData) => {
  await submitFeedback(feedbackData)
  // Form cleared, success shown
}
</script>
```

---

### 2. Feedback Management (`FeedbackManagement.vue`)
Admin dashboard for viewing and responding to feedback.

**Route:** `/superadmin/feedback`

**Features:**
- Statistics cards (total, pending, responded, avg rating)
- Filter by status and category
- Search feedback by title, message, or submitter
- Click feedback to view details
- Respond to feedback inline
- Delete feedback
- Responsive design

**Data Display:**
```
┌─────────────────────────────────────┐
│  Total: 15 | Pending: 3 | Responded: 12 | Avg: 4.2 ⭐ │
├─────────────────────────────────────┤
│ [Filter: Status ▼] [Filter: Category ▼] [Search...] │
├─────────────────────────────────────┤
│ ✓ Bug Report - John Doe             │ PENDING  │
│ "Attendance sync issues..."         │          │
│         submitted 2 hours ago        │   3⭐    │
├─────────────────────────────────────┤
│ Similar feedback items...           │          │
└─────────────────────────────────────┘
```

---

### 3. Feedback Composable (`useFeedback.js`)
Reusable Vue composition for feedback operations.

**Methods:**
```javascript
const {
  feedback,              // Array of feedback items
  selectedFeedback,      // Currently selected feedback
  isLoading,             // Loading state
  isSubmitting,          // Submitting state
  stats,                 // Statistics object
  pendingFeedback,       // Computed pending feedback
  respondedFeedback,     // Computed responded feedback
  
  // Functions
  fetchFeedback,         // Get all feedback
  getFeedbackByCategory, // Filter by category
  getFeedbackByStatus,   // Filter by status
  getFeedback,          // Get single feedback
  submitFeedback,       // Submit new feedback
  respondToFeedback,    // Add response
  updateFeedbackStatus, // Change status
  deleteFeedback        // Remove feedback
} = useFeedback()
```

**Example Usage:**
```javascript
import { useFeedback } from '@/composables/useFeedback'

const { fetchFeedback, submitFeedback, stats } = useFeedback()

// Fetch all feedback
await fetchFeedback()

// Submit feedback
await submitFeedback({
  title: 'Feature request',
  message: 'Would love to have...',
  category: 'feature',
  rating: 4
})

// Check statistics
console.log(stats.value) // { total: 15, pending: 3, ... }
```

---

## Backend Models

### Feedback.js Model
```javascript
const Feedback = {
  create(feedbackData, callback),
  findByOrgId(orgId, limit, callback),
  findByStatus(orgId, status, callback),
  findByCategory(orgId, category, callback),
  findById(feedbackId, callback),
  respond(feedbackId, response, respondedBy, callback),
  updateStatus(feedbackId, status, callback),
  getStats(orgId, callback),
  delete(feedbackId, callback)
}
```

---

## Integration with Notifications

When feedback is submitted or responded to, notifications are automatically sent:

### Feedback Submitted
- Broadcasts to organization admins
- Notification type: `info`
- Category: `general`

### Feedback Response Added
- Notifies the feedback submitter
- Notification type: `success` (if helpful) or `info`
- Category: `feedback`

---

## SuperAdmin Actions & Notifications

The feedback system integrates with SuperAdmin action notifications:

### New Broadcaster Methods
```javascript
NotificationBroadcaster.onOrgMessage(
  orgData,
  messageTitle,
  messageBody
)
```

This allows SuperAdmins to send system announcements that appear as notifications.

---

## Usage Flow

### For Regular Users
1. Navigate to `/:orgSlug/feedback`
2. Fill in feedback form with title, message, category, and rating
3. Click "Submit Feedback"
4. View previous feedback and their statuses
5. See admin responses when they're added

### For Organization Admins
1. View feedback from team members in dashboard
2. Respond to pending feedback
3. Mark feedback as resolved
4. Track feedback statistics
5. Export feedback reports (future feature)

### For SuperAdmins
1. Access `/superadmin/feedback`
2. View feedback across all organizations
3. Filter by organization, category, status
4. Send system announcements via feedback
5. Monitor user satisfaction trends (avg rating)
6. Identify common issues for product improvements

---

## Best Practices

### Submitting Feedback
- ✅ Be specific and detailed
- ✅ Include steps to reproduce bugs
- ✅ Rate honestly
- ❌ Don't submit duplicate feedback
- ❌ Don't use for immediate support issues

### Responding to Feedback
- ✅ Acknowledge receipt within 24 hours
- ✅ Provide clear action items
- ✅ Keep tone professional and helpful
- ❌ Don't ignore feedback
- ❌ Don't use canned responses

### Monitoring
- ✅ Review pending feedback regularly
- ✅ Track feedback trends across organizations
- ✅ Use insights for product roadmap
- ✅ Report on user satisfaction metrics

---

## Database Initialization

The Feedback table is automatically created in `backend/config/db.js` during server startup:

```javascript
db.run(`CREATE TABLE IF NOT EXISTS Feedback (
  Feedback_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  User_ID INTEGER,
  Org_ID INTEGER,
  Title TEXT NOT NULL,
  Message TEXT NOT NULL,
  Category TEXT,
  Rating INTEGER DEFAULT 5,
  Status TEXT DEFAULT 'pending',
  Response TEXT,
  Responded_By INTEGER,
  Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  Responded_at DATETIME,
  FOREIGN KEY (User_ID) REFERENCES User(User_ID),
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
  FOREIGN KEY (Responded_By) REFERENCES Super_Admin(Admin_ID)
)`)
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│             FEEDBACK FEATURE FLOW                │
├─────────────────────────────────────────────────┤
│                                                  │
│  User Submits Feedback                         │
│  ↓                                              │
│  Feedback.vue (Form)                           │
│  ↓                                              │
│  useFeedback($feedback POST)                  │
│  ↓                                              │
│  /api/feedback (POST)                          │
│  ↓                                              │
│  Feedback Model → SQLite Feedback Table        │
│  ↓                                              │
│  BrandcasterNotificationBroadcaster            │
│  → Notify Org Admins                           │
│                                                  │
│  ─────────────────────────────────────────────  │
│                                                  │
│  Admin Views & Responds                        │
│  ↓                                              │
│  FeedbackManagement.vue (Admin Dashboard)      │
│  ↓                                              │
│  useFeedback (GET, PUT respond)               │
│  ↓                                              │
│  /api/feedback/[feedbackId]/respond (PUT)     │
│  ↓                                              │
│  Feedback Model → Update in SQLite             │
│  ↓                                              │
│  NotificationBroadcaster                       │
│  → Notify Original Submitter                   │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Error Handling

### Common Errors

#### 400 Bad Request
```json
{ "error": "Title and message are required" }
```
**Cause:** Missing required fields  
**Solution:** Fill in all required fields

#### 401 Unauthorized
```json
{ "error": "Unauthorized" }
```
**Cause:** No valid JWT token  
**Solution:** User must be logged in

#### 404 Not Found
```json
{ "error": "Feedback not found" }
```
**Cause:** Feedback ID doesn't exist  
**Solution:** Verify feedback ID is correct

#### 500 Server Error
```json
{ "error": "Failed to submit feedback" }
```
**Cause:** Server-side error  
**Solution:** Contact support or check server logs

---

## Future Enhancements

- [ ] Feedback export to CSV/PDF
- [ ] Email notifications for feedback responses
- [ ] Feedback attachments (images, files)
- [ ] Like/upvote on feedback (to show interest)
- [ ] Feedback trending dashboard
- [ ] Scheduled feedback surveys
- [ ] Integration with issue tracking (Jira, GitHub)
- [ ] AI-powered feedback categorization
- [ ] Sentiment analysis on feedback text
- [ ] Public feedback portal for organizations

---

## Testing Checklist

- [ ] Submit feedback with all fields
- [ ] Submit feedback with missing fields (should fail)
- [ ] View feedback history
- [ ] Filter feedback by status
- [ ] Filter feedback by category
- [ ] Search feedback
- [ ] View feedback details
- [ ] Respond to feedback
- [ ] Update feedback status
- [ ] Delete feedback
- [ ] Verify notifications are sent
- [ ] Check database entries
- [ ] Test on mobile view
- [ ] Test with long messages (near 500 char limit)
- [ ] Test concurrent submissions

---

## Support & Issues

For issues or questions about the feedback feature, contact the development team or check this documentation first.
