# Settings Feature - Quick Reference Guide

## 🚀 Quick Start

### 1. Import and Use the Settings Modal
```vue
<template>
  <SettingsModal :isOpen="showSettings" @close="showSettings = false" />
  <button @click="showSettings = true">⚙️ Settings</button>
</template>

<script setup>
import { ref } from 'vue'
import SettingsModal from '@/components/dashboard/SettingsModal.vue'
const showSettings = ref(false)
</script>
```

### 2. Use Settings API in Components
```javascript
import { settingsApi } from '@/services/settingsApi'

// Get all settings
const settings = await settingsApi.getSettings()

// Update a category
await settingsApi.updateSettings('profile', { fullName: 'John Doe' })

// Change password
await settingsApi.changePassword('oldpass', 'newpass', 'newpass')
```

## 📋 Settings Categories

| Category | Subcategories | Use Case |
|----------|---------------|----------|
| **profile** | name, email, phone, address | User account info |
| **preferences** | theme, language, timezone, dateFormat | User UI preferences |
| **notifications** | emailAlerts, pushNotifications, digestFrequency | Alert configuration |
| **security** | sessionTimeout, passwordExpiry, 2FA, ipWhitelist | Account security |
| **dashboard** | defaultView, chartType, itemsPerPage | Dashboard customization |
| **integrations** | slack, googleAnalytics, sendgrid, stripe | Third-party services |

## 🔓 Password Management

### Password Requirements
- Minimum 8 characters
- Uppercase + Lowercase
- Numbers
- Special characters (recommended)

### Strength Levels
```
0% → 40%   = Weak (red)
40% → 60%  = Fair (orange)
60% → 80%  = Strong (green)
80% → 100% = Very Strong (dark green)
```

### Example: Change Password
```vue
<script setup>
import { settingsApi } from '@/services/settingsApi'

const changePassword = async () => {
  try {
    await settingsApi.changePassword(
      currentPassword,
      newPassword,
      confirmPassword
    )
    console.log('✅ Password changed')
  } catch (error) {
    console.error('❌ Error:', error.response.data.error)
  }
}
</script>
```

## 🎨 UI Components Structure

```
SettingsModal (Main Container)
├── Header (Close button)
├── Sidebar Navigation
│   ├── 👤 Profile
│   ├── 🔐 Password
│   ├── ⚙️ Preferences
│   ├── 🔔 Notifications
│   └── 🔒 Security
├── Tab Content Area
│   └── [Active Tab Content]
└── Footer (Close button)
```

## 🎯 Common Patterns

### Pattern 1: Permission-Based Settings Display
```vue
<SettingsModal
  :isOpen="hasAdminRole"
  :category="allowedCategories"
  @close="closeSettings"
/>
```

### Pattern 2: Settings Change Listener
```javascript
const settingsStore = useSettingsStore()

watch(() => settingsStore.preferences.theme, (newTheme) => {
  applyTheme(newTheme)
})
```

### Pattern 3: Batch Settings Update
```javascript
const updateMultiple = async () => {
  await Promise.all([
    settingsApi.updateSettings('profile', profileData),
    settingsApi.updateSettings('preferences', prefsData),
    settingsApi.updateSettings('notifications', notifData)
  ])
}
```

## 🔌 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "profile settings updated successfully",
  "updated": {
    "category": "profile",
    "settings": { ... },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "error": "Invalid category",
  "validCategories": ["profile", "preferences", ...]
}
```

## 🛡️ Security Best Practices

1. **Always validate client-side** before API call
2. **Never store passwords in state** - use refs instead
3. **Clear sensitive data** after operations
4. **Use HTTPS** in production
5. **Validate tokens** before API calls
6. **Audit changes** - backend logs all updates

## 📝 Form Validation

### Field Requirements
```javascript
const validations = {
  profile: {
    email: 'required|email',
    fullName: 'required|min:2',
    phone: 'phone|optional',
    address: 'optional'
  },
  password: {
    currentPassword: 'required|min:8',
    newPassword: 'required|min:8|strong',
    confirmPassword: 'required|matches:newPassword'
  }
}
```

### Custom Validation Example
```javascript
const validatePassword = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[^a-zA-Z\d]/.test(password)
  }
  return Object.values(checks).filter(x => x).length
}
```

## 🧪 Testing Patterns

### Unit Test Template
```javascript
describe('Settings API', () => {
  it('should load settings', async () => {
    const response = await settingsApi.getSettings()
    expect(response.data.settings).toBeDefined()
  })

  it('should update profile', async () => {
    const response = await settingsApi.updateSettings('profile', {
      fullName: 'Test User'
    })
    expect(response.data.success).toBe(true)
  })

  it('should validate password requirements', () => {
    expect(validatePassword('weak')).toBeLessThan(4)
    expect(validatePassword('StrongP@ss1')).toBe(5)
  })
})
```

## 🐛 Debugging Tips

### Enable API Logging
```javascript
// In settingsApi.js
export const settingsApi = {
  getSettings: async () => {
    console.log('📡 Fetching settings...')
    try {
      const response = await createClient().get('/settings')
      console.log('✅ Settings loaded:', response.data)
      return response
    } catch (error) {
      console.error('❌ Failed:', error)
      throw error
    }
  }
  // ... other methods
}
```

### Check Network Tab
1. Open DevTools → Network tab
2. Click Settings
3. Monitor `/superadmin/settings` requests
4. Check headers and response body

### Validate Settings State
```javascript
// In Vue component
<script setup>
import { watch } from 'vue'
import { settingsApi } from '@/services/settingsApi'

watch(editSettings, (newVal) => {
  console.log('Settings changed:', newVal)
}, { deep: true })
</script>
```

## 📊 Settings Data Schema

### Profile
```javascript
{
  email: 'user@example.com',
  fullName: 'Full Name',
  role: 'Super Administrator',
  joinedDate: '2024-01-01',
  avatar: null,
  phone: '+1234567890',
  address: '123 Main St'
}
```

### Preferences
```javascript
{
  theme: 'light' | 'dark' | 'auto',
  sidebarCollapsed: false,
  compactView: false,
  language: 'en' | 'es' | 'fr' | 'de',
  timezone: 'Africa/Monrovia',
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'
}
```

### Notifications
```javascript
{
  emailOnOrgCreation: true,
  emailOnHighAbsence: true,
  emailOnSubscriptionExpiry: true,
  emailOnSecurityIssues: true,
  emailDigestFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly',
  pushNotifications: true,
  smsAlerts: false
}
```

### Security
```javascript
{
  twoFactorAuth: false,
  sessionTimeout: 30, // minutes
  ipWhitelist: false,
  allowRemoteLogin: true,
  requirePasswordChange: false,
  passwordExpiryDays: 90
}
```

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Settings not loading | Check auth token, verify API endpoint |
| Changes not saving | Check network, validate form data |
| Password validation fails | Ensure 8+ chars, mixed case, numbers |
| Modal won't close | Check `@close` event binding |
| Settings lost on refresh | Implement Pinia store persistence |

## 📚 Related Files

- `/frontend/src/components/dashboard/SettingsModal.vue` - Main component
- `/frontend/src/services/settingsApi.js` - API client
- `/backend/routes/superadmin.routes.js` - API endpoints
- `/SETTINGS_FEATURE.md` - Full documentation

## 🔗 Links

- [Vue 3 Documentation](https://vuejs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)
- [bcryptjs (password hashing)](https://www.npmjs.com/package/bcryptjs)

## 💡 Tips & Tricks

1. **Use toast notifications** for better feedback:
   ```javascript
   // After successful save
   useToast().success('Settings saved!')
   ```

2. **Implement auto-save** with debounce:
   ```javascript
   const debouncedSave = debounce(() => saveSettings('preferences'), 1000)
   ```

3. **Add loading states** to buttons:
   ```vue
   <button :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
   ```

4. **Persist temporary settings** in sessionStorage:
   ```javascript
   sessionStorage.setItem('pendingSettings', JSON.stringify(editSettings))
   ```

5. **Group related settings** with section headers
6. **Use icons** for visual clarity
7. **Provide help text** for complex options
8. **Test on mobile** devices

## 📞 Support

For additional help or questions, refer to:
- SETTINGS_FEATURE.md (full documentation)
- Backend API logs
- Frontend console errors
- Network inspector in DevTools
