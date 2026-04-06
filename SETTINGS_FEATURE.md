# Settings Feature Documentation

## Overview
The Settings feature provides SuperAdmins with a comprehensive interface to manage their profile, preferences, security, notifications, and integrations.

## Architecture

### Frontend Components
- **SettingsModal.vue** - Main settings interface with tabbed navigation
- **settingsApi.js** - API client for settings operations

### Backend Routes
- **superadmin.routes.js** - Settings endpoints

## Features

### 1. Profile Settings
**Endpoint:** `GET/PUT /superadmin/settings`

Allows SuperAdmins to manage:
- Full Name
- Email Address
- Phone Number
- Physical Address
- Role (Read-only)
- Joined Date (Read-only)

**API Response:**
```json
{
  "profile": {
    "email": "superadmin@tracktimi.com",
    "fullName": "TrackTimi System Admin",
    "role": "Super Administrator",
    "joinedDate": "2024-01-01",
    "avatar": null,
    "phone": "",
    "address": ""
  }
}
```

### 2. Password Management
**Endpoint:** `PUT /superadmin/settings/password`

Features:
- Current password verification
- New password must be at least 8 characters
- Password confirmation
- Real-time password strength indicator
- Secure hashing with bcryptjs

**Request:**
```json
{
  "currentPassword": "existing_password",
  "newPassword": "new_secure_password",
  "confirmPassword": "new_secure_password"
}
```

**Password Strength Levels:**
- **Weak** (0-40%): Less than 2 criteria met
- **Fair** (40-60%): 2-3 criteria met
- **Strong** (60-80%): 4 criteria met
- **Very Strong** (80-100%): All 5 criteria met

**Criteria:**
1. At least 8 characters
2. At least 12 characters
3. Mix of uppercase and lowercase
4. Contains numbers
5. Contains special characters

### 3. User Preferences
**Endpoint:** `GET/PUT /superadmin/settings`

Configurable Options:
- **Theme**: Light, Dark, Auto
- **Language**: English, Spanish, French, German
- **Timezone**: Multiple timezone options
- **Date Format**: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY
- **Sidebar Collapsed**: Boolean toggle
- **Compact View**: Boolean toggle

**Default Preferences:**
```json
{
  "preferences": {
    "theme": "light",
    "sidebarCollapsed": false,
    "compactView": false,
    "language": "en",
    "timezone": "Africa/Monrovia",
    "dateFormat": "YYYY-MM-DD"
  }
}
```

### 4. Notification Settings
**Endpoint:** `GET/PUT /superadmin/settings`

Email Alerts:
- **Email on Organization Creation** - New org signup alerts
- **Email on High Absence Rate** - Absence rate threshold alerts
- **Email on Subscription Expiry** - Renewal reminders
- **Email on Security Issues** - Critical security alerts

Other Options:
- **Email Digest Frequency**
  - Real-time
  - Daily
  - Weekly
  - Monthly
- **Push Notifications** - Browser notifications toggle
- **SMS Alerts** - SMS notification toggle

**Default Settings:**
```json
{
  "notifications": {
    "emailOnOrgCreation": true,
    "emailOnHighAbsence": true,
    "emailOnSubscriptionExpiry": true,
    "emailOnSecurityIssues": true,
    "emailDigestFrequency": "daily",
    "pushNotifications": true,
    "smsAlerts": false
  }
}
```

### 5. Security Settings
**Endpoint:** `GET/PUT /superadmin/settings`

Options:
- **Session Timeout** (10-480 minutes)
- **Password Expiry Days** (0 = never expires)
- **Two-Factor Authentication** (Enable/Disable)
- **IP Whitelist** (Restrict login IPs)
- **Allow Remote Login** (Enable/Disable)

**Default Settings:**
```json
{
  "security": {
    "twoFactorAuth": false,
    "sessionTimeout": 30,
    "ipWhitelist": false,
    "allowRemoteLogin": true,
    "requirePasswordChange": false,
    "passwordExpiryDays": 90
  }
}
```

### 6. Dashboard Preferences
**Endpoint:** `GET/PUT /superadmin/settings`

Customizable Dashboard Options:
- **Default View**: Overview, Analytics, Organizations
- **Chart Type**: Line, Bar, Area
- **Items Per Page**: 10, 25, 50, 100
- **Auto Refresh Interval**: 30s to 5 minutes
- **Show Hidden Organizations**: Boolean
- **Highlight Anomalies**: Boolean

**Default Settings:**
```json
{
  "dashboard": {
    "defaultView": "overview",
    "chartType": "line",
    "itemsPerPage": 25,
    "autoRefreshInterval": 300,
    "showHiddenOrgs": false,
    "highlightAnomalies": true
  }
}
```

### 7. Integrations
**Endpoint:** `GET/PUT /superadmin/settings`

Supported Integrations:
- **Slack** - Webhook for notifications
- **Google Analytics** - Tracking code
- **SendGrid** - Email service API key
- **Stripe** - Payment processing (Public key)

**Secure Storage:**
- API keys are hashed before storage
- Never returned in full via API
- Require re-authentication to modify

**Default Settings:**
```json
{
  "integrations": {
    "slackWebhook": "",
    "googleAnalytics": "",
    "sendgridApiKey": "",
    "stripePublicKey": ""
  }
}
```

## API Endpoints

### Get All Settings
```
GET /superadmin/settings
Authorization: Bearer <token>

Response:
{
  "success": true,
  "settings": { ... }
}
```

### Update Settings Category
```
PUT /superadmin/settings
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "category": "profile|preferences|notifications|dashboard|security|integrations",
  "settings": { ... }
}

Response:
{
  "success": true,
  "message": "Category settings updated successfully",
  "updated": {
    "category": "profile",
    "settings": { ... },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Change Password
```
PUT /superadmin/settings/password
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "currentPassword": "existing_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Validate Password
```
POST /superadmin/settings/validate-password
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "password": "password_to_validate"
}

Response:
{
  "valid": true,
  "message": "Password is correct"
}
```

## Frontend Usage

### Import and Use
```vue
<template>
  <SettingsModal
    :isOpen="showSettings"
    @close="showSettings = false"
  />
</template>

<script setup>
import { ref } from 'vue'
import SettingsModal from '@/components/dashboard/SettingsModal.vue'

const showSettings = ref(false)
</script>
```

### Use Settings API in Components
```vue
<script setup>
import { settingsApi } from '@/services/settingsApi'

// Fetch settings
const loadSettings = async () => {
  const response = await settingsApi.getSettings()
  console.log(response.data.settings)
}

// Update profile
const updateProfile = async () => {
  await settingsApi.updateSettings('profile', {
    fullName: 'New Name',
    email: 'new@email.com'
  })
}

// Change password
const updatePassword = async () => {
  await settingsApi.changePassword(
    'current_password',
    'new_password',
    'new_password'
  )
}
</script>
```

## Global State Management

Settings can be stored in Pinia store for app-wide access:

```javascript
// stores/settingsStore.js
import { defineStore } from 'pinia'
import { settingsApi } from '@/services/settingsApi'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    profile: {},
    preferences: {},
    notifications: {},
    security: {},
    dashboard: {},
    integrations: {},
    loading: false,
    error: null
  }),

  actions: {
    async loadSettings() {
      this.loading = true
      try {
        const response = await settingsApi.getSettings()
        const { settings } = response.data
        Object.assign(this, settings)
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async updateSettings(category, settings) {
      try {
        await settingsApi.updateSettings(category, settings)
        this[category] = settings
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})
```

## Security Considerations

1. **Password Hashing**: All passwords are hashed with bcryptjs
2. **Token Validation**: All requests require valid SuperAdmin JWT token
3. **Audit Logging**: All settings changes are logged in Audit_Log table
4. **API Key Security**: Integration API keys are never returned in full
5. **Session Timeout**: Inactive sessions are automatically terminated
6. **2FA Support**: Two-factor authentication can be enabled
7. **IP Whitelist**: Optional IP-based access restrictions

## Database Schema

### Super_Admin Table
```sql
CREATE TABLE Super_Admin (
  ID INT PRIMARY KEY AUTO_INCREMENT,
  Email VARCHAR(255) UNIQUE,
  Password VARCHAR(255),
  Full_Name VARCHAR(255),
  Phone VARCHAR(20),
  Address TEXT,
  Is_Active BOOLEAN DEFAULT 1,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Settings Table
```sql
CREATE TABLE SuperAdmin_Settings (
  ID INT PRIMARY KEY AUTO_INCREMENT,
  SuperAdmin_ID INT,
  Category VARCHAR(50), -- profile, preferences, notifications, etc.
  Settings_Data JSON,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (SuperAdmin_ID) REFERENCES Super_Admin(ID)
);
```

### Audit_Log Table
```sql
CREATE TABLE Audit_Log (
  ID INT PRIMARY KEY AUTO_INCREMENT,
  Action VARCHAR(100),
  Table_Name VARCHAR(100),
  Old_Data JSON,
  New_Data JSON,
  User_ID INT,
  Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

### Common Error Responses

**Invalid Category:**
```json
{
  "error": "Invalid category",
  "validCategories": ["profile", "preferences", "notifications", "dashboard", "security", "integrations"]
}
```

**Password Mismatch:**
```json
{
  "error": "Passwords do not match"
}
```

**Weak Password:**
```json
{
  "error": "Password must be at least 8 characters"
}
```

**Authentication Failed:**
```json
{
  "error": "Super Admin token required"
}
```

## Future Enhancements

1. **Two-Factor Authentication**
   - SMS/Email OTP verification
   - Backup codes

2. **IP Whitelist Management**
   - Add/remove IPs
   - View login history by IP

3. **Security Questions**
   - Set custom security questions
   - Use for password recovery

4. **OAuth Integration**
   - Google SSO
   - Microsoft SSO

5. **API Key Management**
   - Generate personal API keys
   - Set key permissions
   - Revoke keys

6. **Session Management**
   - View active sessions
   - Logout specific sessions
   - Remote logout

7. **Settings Export/Import**
   - Export settings as JSON
   - Import settings from file
   - Reset to defaults

8. **Advanced Permissions**
   - Multi-admin system
   - Role-based access control
   - Delegation of duties

## Testing

### Unit Tests
```javascript
describe('Settings API', () => {
  it('fetches settings successfully', async () => {
    const response = await settingsApi.getSettings()
    expect(response.data.success).toBe(true)
  })

  it('updates settings category', async () => {
    const response = await settingsApi.updateSettings('profile', {
      fullName: 'Test Admin'
    })
    expect(response.data.success).toBe(true)
  })

  it('changes password successfully', async () => {
    const response = await settingsApi.changePassword(
      'oldpass123',
      'newpass123',
      'newpass123'
    )
    expect(response.data.success).toBe(true)
  })
})
```

### Integration Tests
1. Test all settings categories can be loaded
2. Test all settings can be updated
3. Test password change with validation
4. Test audit logging
5. Test notification delivery after settings change

## Troubleshooting

### Settings Not Loading
- Check network connection
- Verify token is valid
- Check browser console for errors
- Clear localStorage cache

### Password Change Fails
- Verify current password is correct
- Check password meets requirements
- Ensure new password and confirmation match
- Check for authentication token expiry

### Settings Not Saving
- Check network connection
- Verify all required fields are filled
- Check browser console for validation errors
- Verify user has SuperAdmin role

## Support

For issues or feature requests, contact the development team at support@tracktimi.com
