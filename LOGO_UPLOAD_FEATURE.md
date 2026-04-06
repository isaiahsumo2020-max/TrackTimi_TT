# Logo Upload Feature - Implementation Guide

## Overview
Organization logos can now be uploaded, displayed, and deleted directly from the Organization Details modal. Logos are stored as base64-encoded data in the database.

## Features

### 1. **Logo Upload**
- Click the **📤** button on the logo area to upload a new logo
- Supported formats: PNG, JPEG, GIF, WebP
- Max size: 500KB
- Stores as base64 in `Logo_Path` column with MIME type in `Logo_MIME_Type`

### 2. **Logo Display**
- If logo exists: Shows uploaded image in 24×24px box
- If no logo: Shows organization initial in gradient box

### 3. **Logo Delete**
- Click the **✕** button to remove logo (only visible if logo exists)
- Confirmation dialog prevents accidental deletions

---

## Backend Implementation

### New Endpoints

#### **PUT** `/api/superadmin/organizations/:id/logo`
Upload or update organization logo
```javascript
// Request body
{
  "logoData": "data:image/png;base64,...",
  "mimeType": "image/png"
}

// Response
{
  "success": true,
  "message": "Organization logo uploaded successfully",
  "orgId": 1,
  "logoUpdated": true
}
```

**Validations:**
- MIME type must be: png, jpeg, jpg, gif, webp
- Logo data required
- Size limit: 500KB
- Updates `Updated_at` timestamp

#### **DELETE** `/api/superadmin/organizations/:id/logo`
Remove organization logo
```javascript
// Response
{
  "success": true,
  "message": "Organization logo deleted successfully"
}
```

---

## Frontend Implementation

### Component: `Organizations.vue`

#### Added State
- File input for logo selection (hidden)
- Upload/delete handlers with validation

#### Upload Flow
1. User selects image from file input
2. Frontend validates: file type & size
3. Converts file to base64 using FileReader API
4. Sends to backend: `uploadOrgLogo(orgId, logoData, mimeType)`
5. Backend updates database
6. Modal refreshes to show new logo
7. User sees success message

#### Delete Flow
1. User clicks delete button (✕)
2. Confirmation dialog appears
3. Sends request: `deleteOrgLogo(orgId)`
4. Backend sets logo fields to NULL
5. Modal refreshes to show initial letter
6. User sees success message

---

## Database Schema

### Organization Table
**New Columns:**
```sql
Logo_Path TEXT,                                    -- Base64 logo data or file path
Logo_MIME_Type TEXT DEFAULT 'image/png',          -- Image MIME type
Address TEXT,                                      -- Organization address
Updated_at DATETIME                                -- Last update timestamp
```

### Migration
Automatic column addition for existing databases via `PRAGMA table_info()` checks.

---

## API Service

### New Methods (superadminApi.js)
```javascript
// Upload logo
uploadOrgLogo(orgId, logoData, mimeType)

// Delete logo
deleteOrgLogo(orgId)
```

---

## UI/UX Details

### Logo Area
```
┌─────────────┐
│  [LOGO]     │ ← User image or Initial
│  📤  ✕      │ ← Upload & Delete buttons
└─────────────┘
```

**Upload Button:**
- Blue circle with 📤 emoji
- Hover shows tooltip: "Upload logo"
- Hidden file input with accept="image/*"

**Delete Button:**
- Red circle with ✕ emoji  
- Only visible if logo exists
- Hover shows tooltip: "Delete logo"
- Click triggers confirmation dialog

---

## Error Handling

### Frontend Validation
- Invalid file type → Alert user
- File too large → Alert user
- Upload fails → Show error from backend

### Backend Validation
- Missing logoData → 400 Bad Request
- Invalid MIME type → 400 Bad Request
- Logo oversized → 400 Bad Request
- Organization not found → 404 Not Found
- Database error → 500 Server Error

---

## Testing Checklist

- [ ] Upload PNG logo (< 500KB)
- [ ] Upload JPEG logo
- [ ] Upload GIF logo
- [ ] Try uploading PDF (should fail)
- [ ] Try uploading > 500KB image (should fail)
- [ ] Verify logo displays in modal after upload
- [ ] Delete logo and verify initial shows
- [ ] Refresh page and verify logo persists
- [ ] Test with multiple organizations

---

## Files Modified

1. **Backend**
   - `backend/config/db.js` - Added Logo_Path, Logo_MIME_Type, Address, Updated_at columns
   - `backend/routes/superadmin.routes.js` - Added PUT/DELETE logo endpoints

2. **Frontend**
   - `frontend/src/services/superadminApi.js` - Added uploadOrgLogo, deleteOrgLogo functions
   - `frontend/src/components/dashboard/Organizations.vue`
     - Added logo upload/delete UI buttons
     - Added handleLogoUpload, handleLogoDelete handlers
     - Updated logo display section

---

## Next Steps (Optional)

1. **Avatar Upload for Users** - Implement similar feature for user avatars
2. **Logo Settings** - Allow organizations to customize logo size/position
3. **Bulk Logo Upload** - Import logos for multiple organizations at once
4. **Logo Gallery** - Show previously uploaded logos for quick reuse
