# User Dashboard API Reference

## Base URL
```
http://localhost:5000/api/attendance
```

## Authentication
All endpoints require valid JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Check-in Status
**GET** `/status`

Check if user is currently checked in.

**Response:**
```json
{
  "checkedIn": true,
  "session": {
    "Attend_ID": 1,
    "User_ID": 1,
    "Check_in_time": "2026-04-02T09:00:00",
    "Check_out_time": null,
    "Latitude": 6.5244,
    "Longitude": 3.3792
  }
}
```

---

### 2. Clock In
**POST** `/checkin`

Check in at work location with GPS coordinates.

**Request Body:**
```json
{
  "latitude": 6.5244,
  "longitude": 3.3792,
  "accuracy": 25
}
```

**Response:**
```json
{
  "success": true,
  "message": "Clock-in successful",
  "attendId": 1
}
```

**Error Responses:**
- 403: `"Denied: Nearest zone is 500m away."`
- 400: `"You are already clocked in."`

---

### 3. Clock Out
**POST** `/checkout`

Check out from work location.

**Request Body:**
```json
{
  "latitude": 6.5244,
  "longitude": 3.3792,
  "accuracy": 25
}
```

**Response:**
```json
{
  "success": true,
  "message": "Clock-out successful."
}
```

**Error Responses:**
- 403: `"Denied: You must be at the work zone to clock out. (Distance: 500m)"`
- 400: `"No active session found."`

---

### 4. Start Break
**POST** `/break-start`

Start a break session.

**Request Body:**
```json
{
  "latitude": 6.5244,
  "longitude": 3.3792
}
```

**Response:**
```json
{
  "success": true,
  "message": "Break started"
}
```

**Error Responses:**
- 400: `"You are already on a break"`

---

### 5. End Break
**POST** `/break-end`

End active break session.

**Request Body:**
```json
{
  "latitude": 6.5244,
  "longitude": 3.3792
}
```

**Response:**
```json
{
  "success": true,
  "message": "Break ended"
}
```

**Error Responses:**
- 400: `"No active break found"`

---

### 6. Get Breaks
**GET** `/breaks`

Get all breaks for today.

**Response:**
```json
[
  {
    "Break_ID": 1,
    "Start_Time": "2026-04-02T12:00:00",
    "End_Time": "2026-04-02T12:30:00",
    "duration": 30
  },
  {
    "Break_ID": 2,
    "Start_Time": "2026-04-02T14:30:00",
    "End_Time": "2026-04-02T14:45:00",
    "duration": 15
  }
]
```

---

### 7. Get Analytics
**GET** `/analytics`

Get employee analytics and statistics.

**Response:**
```json
{
  "avgHoursPerDay": 7.8,
  "totalMonthHours": 128.5,
  "checkInRate": 95,
  "onTimeRate": 98,
  "targetMonthHours": 160,
  "weeklyActivity": [
    {
      "day": "Mon",
      "hours": 8
    },
    {
      "day": "Tue",
      "hours": 7.5
    },
    {
      "day": "Wed",
      "hours": 8
    },
    {
      "day": "Thu",
      "hours": 8.5
    },
    {
      "day": "Fri",
      "hours": 8
    },
    {
      "day": "Sat",
      "hours": 0
    },
    {
      "day": "Sun",
      "hours": 0
    }
  ]
}
```

---

### 8. Get Current Shift
**GET** `/current-shift`

Get the next scheduled shift for the user.

**Response:**
```json
{
  "Schedule_ID": 1,
  "Start_Date": "2026-04-02",
  "Start_Time": "09:00",
  "End_Time": "17:00",
  "ShiftType_Name": "Standard",
  "Depart_Name": "Sales",
  "Color_Code": "#4F46E5"
}
```

**If no shift scheduled:**
```json
{
  "Shift_Date": null,
  "Shift_Start_Time": null
}
```

---

### 9. Get Attendance History
**GET** `/my-history`

Get personal attendance history.

**Query Parameters:**
- `limit` (optional): Number of records to return
- `offset` (optional): Pagination offset

**Response:**
```json
[
  {
    "Attend_ID": 1,
    "Check_in_time": "2026-04-02T09:00:00",
    "Check_out_time": "2026-04-02T17:30:00",
    "Status_Name": "Present",
    "Method_Name": "GPS",
    "duration": 8.5
  }
]
```

---

### 10. Get Recent Attendance (Admin)
**GET** `/recent`

Get recent attendance records for organization (admin only).

**Response:**
```json
[
  {
    "Attend_ID": 25,
    "User_ID": 5,
    "First_Name": "John",
    "SurName": "Doe",
    "Check_in_time": "2026-04-02T09:15:00",
    "Check_out_time": "2026-04-02T17:45:00",
    "Status_ID": 1,
    "Method_ID": 3
  }
]
```

---

## Real-time WebSocket Events

### Listening Events (Server → Client)

#### `status:updated`
Emitted when user's check-in status changes.
```json
{
  "checkedIn": true,
  "userId": 1,
  "timestamp": "2026-04-02T09:00:00Z"
}
```

#### `schedule:updated`
Emitted when schedule changes.
```json
{
  "schedule": {
    "Schedule_ID": 1,
    "Start_Date": "2026-04-02"
  }
}
```

#### `analytics:updated`
Emitted when analytics are recalculated.
```json
{
  "avgHoursPerDay": 7.8,
  "checkInRate": 95,
  "onTimeRate": 98
}
```

#### `notification:new`
General notification event.
```json
{
  "type": "info",
  "message": "Your check-in was recorded",
  "title": "Check-in Successful"
}
```

#### `break:reminder`
Emitted when it's time for a break.
```json
{
  "message": "Time for your break!"
}
```

#### `shift:reminder`
Emitted when shift is ending soon.
```json
{
  "message": "You have 30 minutes left in your shift"
}
```

### Emitting Events (Client → Server)

#### `status:request`
Request immediate status update.

#### `schedule:request`
Request immediate schedule update.

#### `analytics:request`
Request immediate analytics update.

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
Invalid request parameters.
```json
{
  "error": "Invalid coordinates provided"
}
```

#### 401 Unauthorized
Missing or invalid authentication token.
```json
{
  "error": "Unauthorized access"
}
```

#### 403 Forbidden
User outside geofence or insufficient permissions.
```json
{
  "error": "Denied: Nearest zone is 500m away.",
  "distance": 500
}
```

#### 404 Not Found
Resource not found.
```json
{
  "error": "No active session found"
}
```

#### 500 Internal Server Error
Server-side error.
```json
{
  "error": "Database error"
}
```

---

## Rate Limiting

Current rate limiting (if configured):
- 100 requests per 15 minutes per user
- Break requests: 10 per hour
- Check-in/out: 2 per hour per user

---

## Example Usage (Frontend)

### Check In
```javascript
await api.post('/attendance/checkin', {
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracy: position.coords.accuracy
})
```

### Get Analytics
```javascript
const response = await api.get('/attendance/analytics')
const { avgHoursPerDay, checkInRate, onTimeRate } = response.data
```

### Start Break
```javascript
await api.post('/attendance/break-start', {
  latitude: position.coords.latitude,
  longitude: position.coords.longitude
})
```

---

## Documentation Version
- **Last Updated**: April 2, 2026
- **API Version**: 1.0.0
- **Status**: Active ✅
