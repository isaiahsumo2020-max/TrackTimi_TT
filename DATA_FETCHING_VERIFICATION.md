# Organization Details - Data Fetching Verification ✅

## Summary
The SuperAdmin dashboard now fetches and displays comprehensive organization data directly from the database with proper relationships and foreign keys.

---

## Data Flow: Database → Backend → Frontend

### 1. **Workspace Capacity** 
**Database Path:** `OrganizationSubscription` → `SubscriptionPlan`

**Backend Query:**
```sql
SELECT 
  os.Sub_ID, os.Status, os.Start_Date, os.End_Date,
  sp.Plan_Name, sp.Max_Users, sp.Max_Devices, sp.Price_Monthly
FROM OrganizationSubscription os
LEFT JOIN SubscriptionPlan sp ON os.Plan_ID = sp.Plan_ID
WHERE os.Org_ID = ? AND os.Status = 'active'
ORDER BY os.Start_Date DESC LIMIT 1
```

**Frontend Display:**
```
💼 Workspace Capacity: Pro (200 Users)
```

**Tables:**
- `SubscriptionPlan` - Free (10), Starter (50), Pro (200), Enterprise (9999)
- `OrganizationSubscription` - Links organizations to plans
- Seeded on organization creation automatically

---

### 2. **Master Credentials**
**Database Path:** `User` → `Role` (filtered by 'OrgAdmin')

**Backend Query:**
```sql
SELECT 
  User_ID, First_Name, SurName, Email, Phone_Num, Created_at
FROM User
WHERE Org_ID = ? AND Role_ID = (
  SELECT Role_ID FROM Role WHERE Role_Name = 'OrgAdmin'
)
ORDER BY Created_at ASC LIMIT 1
```

**Frontend Display:**
```
🔐 Master Credentials:
   Name: John Doe
   Email: john@company.com
   Phone: +1-555-0123
```

**Tables:**
- `User` - Stores all organization users
- `Role` - Contains: SuperAdmin, OrgAdmin, Admin, Manager, Staff, Student

---

### 3. **Geofences**
**Database Path:** `Geofence`

**Backend Query:**
```sql
SELECT 
  Geo_ID, Name, Latitude, Longitude, Radius, Is_Active 
FROM Geofence 
WHERE Org_ID = ? 
ORDER BY Created_at DESC
```

**Frontend Display:**
```
Cyan Section - Geofences (3):
├── Main Office - Lat: 6.3155 | Lng: -10.8073 | R: 200m ✓
├── Branch Office - Lat: 6.3200 | Lng: -10.8100 | R: 150m ✓
└── Warehouse - Lat: 6.3100 | Lng: -10.8050 | R: 300m ✗
```

**Tables:**
- `Geofence` - Location-based tracking boundaries

---

### 4. **Logo Display & Management**
**Database Field:** `Organization.Logo_Path`, `Organization.Logo_MIME_Type`

**SuperAdmin Actions:**
- **View:** Logo displays in 24×24px box or organization initial
- **Upload:** 📤 Button (base64 data stored in database)
- **Delete:** ✕ Button (sets Logo_Path to NULL)

**Upload Endpoint:**
```
PUT /api/superadmin/organizations/:id/logo
{
  "logoData": "data:image/png;base64,...",
  "mimeType": "image/png"
}
```

---

## Backend Response Structure

```json
{
  "info": {
    "Org_ID": 1,
    "Org_Name": "Acme Corp",
    "Org_Domain": "acme",
    "Theme_Color": "#1B8B3C",
    "Address": "123 Main St",
    "Logo_Path": "data:image/png;base64,...",
    "Logo_MIME_Type": "image/png",
    "Org_Type_Name": "Company",
    "Region_Name": "Montserrado",
    "Workspace_Capacity": "Pro (200 Users)",
    "Plan_Details": {
      "Plan_Name": "Pro",
      "Max_Users": 200,
      "Max_Devices": 200,
      "Price_Monthly": 29.99
    },
    "Master_Credentials": {
      "name": "John Doe",
      "email": "john@acme.com",
      "phone": "+1-555-0123",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  },
  "departments": [...],
  "users": [...],
  "geofences": [...],
  "stats": { "checkinsToday": 42 }
}
```

---

## Frontend Components

### Organizations.vue (SuperAdmin Dashboard)

**Logo Section:**
- Display logo or initial (24×24px)
- 📤 Upload button
- ✕ Delete button (if logo exists)

**Header Section:**
- Organization Name
- Domain
- Status (Active/Inactive)
- **💼 Workspace Capacity** ← Fetched from database

**Registration Info Section:**
- **🔐 Master Credentials** ← Fetched from database
  - Admin name, email, phone
- Organization Type (Name)
- Region (Name)
- Theme Color

**Geofence Section (Cyan):**
- **List of all geofences** ← Fetched from database
- Coordinates (Latitude, Longitude)
- Radius in meters
- Active/Inactive status

---

## Database Tables Used

| Table | Purpose | Related To |
|-------|---------|-----------|
| `Organization` | Main org info, logo storage | Org_Type_ID, Region_ID |
| `OrganizationSubscription` | Plan assignment | Plan_ID, Org_ID |
| `SubscriptionPlan` | Plan details (capacity) | - |
| `User` | Admin users | Role_ID, Org_ID |
| `Role` | User roles (filter OrgAdmin) | - |
| `Geofence` | Location boundaries | Org_ID |
| `Organization_Type` | Org type names | Org_Type_ID |
| `Region` | Region names | Region_ID |

---

## Data Verification Logs

Backend logs when data is fetched:
```
✅ Organization 1 details fetched:
   - Workspace Capacity: Pro (200 Users)
   - Master Credentials: John Doe (john@acme.com)
   - Geofences: 3
   - Departments: 5
   - Users: 38
   - Check-ins Today: 42
```

---

## API Endpoints

### Organization Details
```
GET /api/superadmin/organizations/:id/details
Response: { info, departments, users, geofences, stats }
```

### Logo Upload (SuperAdmin Only)
```
PUT /api/superadmin/organizations/:id/logo
Body: { logoData: "base64...", mimeType: "image/png" }
```

### Logo Delete (SuperAdmin Only)
```
DELETE /api/superadmin/organizations/:id/logo
```

### Logo Upload (Organization Admin)
```
PUT /api/admin/logo
Body: { logoData: "base64...", mimeType: "image/png" }
```

### Logo Delete (Organization Admin)
```
DELETE /api/admin/logo
```

---

## Status

✅ **All Data Fetching Complete**
- Workspace Capacity: Fetching from OrganizationSubscription + SubscriptionPlan
- Master Credentials: Fetching from User table (OrgAdmin role)
- Geofences: Fetching from Geofence table
- Logo: Stored in Organization table (view/edit for superadmin)
- Departments: Fetching from Department table
- Users: Fetching from User table
- Statistics: Fetching from Attendance table

✅ **SuperAdmin Dashboard Features**
- View all organization data
- Upload/Delete organization logos
- View real-time workspace capacity
- See master admin credentials
- View geofence locations

✅ **Organization Admin Dashboard Features**
- Upload/Delete their own logo
- View organization settings
- Manage branding

