# TrackTimi API Spec — Employee & Attendance (Geofence) Overview

Purpose: define stable, production-ready endpoints to register employees, invite/activate accounts, authenticate, record geofence check-ins/outs, and emit live events for dashboards.

Auth
- All protected endpoints require `Authorization: Bearer <JWT>` header.
- JWT must include: `userId`, `orgId`, `orgSlug`, `role`.

Endpoints

1) Invite employee (OrgAdmin)
- POST /api/auth/invite
- Auth: OrgAdmin
- Body:
  - `email` (string, required)
  - `firstName` (string)
  - `surName` (string)
  - `departId` (integer, optional)
  - `roleId` (integer, optional)
- Response (201): `{ invitationToken, inviteExpiresAt, message }`
- Behavior: creates an `Invitation` record with unique token, sends email (or returns token in dev). Token TTL: 7 days.

2) Activate invitation (employee sets password)
- POST /api/auth/activate-invitation
- Auth: PUBLIC (token-based)
- Body:
  - `token` (string)
  - `password` (string)
  - `firstName`, `surName` (optional overrides)
- Response (200): `{ token: JWT, user: { userId, orgId, orgSlug, name, email } }`
- Behavior: validate token, create User if needed or set password, mark invitation used.

3) Create user directly (OrgAdmin)
- POST /api/org/users
- Auth: OrgAdmin
- Body:
  - `firstName`, `surName`, `email` (required)
  - `departId`, `userTypeId`, `roleId`, `jobTitle`, `phone`
- Response (201): `{ User_ID, Employee_ID, message }`
- Behavior: generates unique `Employee_ID` and sends activation/invite email.

4) Login
- POST /api/auth/login
- Body: `{ email, password }`
- Response (200): `{ token, user }`

5) Attendance check-in (GPS)
- POST /api/attendance/checkin
- Auth: Bearer
- Body:
  - `latitude` (number)
  - `longitude` (number)
  - `deviceUUID` (string, optional)
  - `method` (string; default `GPS`)
- Response (200): `{ success: true, attendId, timestamp, withinGeofence: boolean, message }`
- Behavior (server-side):
  1. Lookup org geofences: `SELECT * FROM Geofence WHERE Org_ID = ? AND Is_Active = 1`.
  2. For each geofence, compute distance using Haversine (use meters). If any distance <= Radius → withinGeofence=true.
  3. If withinGeofence: insert Attendance record with Method_ID referencing `Attendance_Method` (GPS), Status_ID default Present. Otherwise reject with 403 or allow but mark `Outside Geofence` and Status_ID accordingly.
  4. Save device info to `Device` table optionally and bind Device_UUID to user if configured.
  5. Emit realtime event (see below).

6) Attendance check-out
- POST /api/attendance/checkout
- Similar fields to `checkin`; updates existing open attendance record for user.

Realtime (Live) Events
- Use Socket.IO (namespaces/rooms per org): connect client with JWT, join room `org:<orgId>`.
- Events emitted by server after successful check-in/out:
  - `attendance:created` payload: `{ attendId, userId, orgId, latitude, longitude, timestamp, withinGeofence }`
  - `attendance:updated` payload for checkout.
- Clients subscribe to `org:<orgId>` to receive live updates.

Validation & Security
- Rate-limit checkin endpoints (e.g., max 5/min per user).
- Validate coordinates and reject obviously invalid values.
- Enforce device binding option: allow admin to enable "1 user = 1 device" which requires `deviceUUID` on checkin and rejects mismatched devices.
- Use HTTPS in production and set secure `JWT_SECRET` in env (do not rely on defaults).

Database notes
- Tables used: `Organization`, `Geofence`, `User`, `Device`, `Attendance`, `Attendance_Method`, `Attendance_Status`, `Invitation` (new table to add), `OrganizationSubscription`.
- Add `Invitation` table schema:
  - `Invitation_ID INTEGER PRIMARY KEY AUTOINCREMENT`, `Org_ID INTEGER`, `Email TEXT`, `Token TEXT UNIQUE`, `Expires_at DATETIME`, `Used BOOLEAN DEFAULT 0`, `Role_ID INTEGER`, `Created_at DATETIME`.

Haversine (meters)
- distance = 6371000 * 2 * ASIN( SQRT( SIN((lat2-lat1)/2)^2 + COS(lat1)*COS(lat2)*SIN((lon2-lon1)/2)^2 ) )

Error handling
- Use consistent error structure: `{ error: 'message', code: 'ERR_CODE' }`.
- 400 for validation, 401/403 for auth/authorization, 409 for duplicates, 500 for server errors.

Operational
- Add `SOCKET_IO_ENABLED` env flag; use `REDIS` adapter for horizontal scaling (recommended for prod).
- Backfill geofence data for existing orgs or provide Admin UI to create geofence per org.

Deliverables for next implementation phase
1. Add `Invitation` DB migration and controller.
2. Implement `POST /api/auth/invite` + email token generation.
3. Implement `POST /api/auth/activate-invitation`.
4. Implement `POST /api/attendance/checkin` with Haversine validation and Socket.IO emit.
5. Frontend employee dashboard (geolocation + check-in/out) and Socket.IO client.


