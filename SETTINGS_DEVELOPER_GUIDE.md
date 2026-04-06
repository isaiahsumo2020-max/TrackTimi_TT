# Settings Feature - Developer Implementation Guide

## Overview

This guide explains how to work with the Settings feature, extend it, and integrate it into other parts of the application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SuperAdmin Dashboard                      │
├─────────────────────────────────────────────────────────────┤
│  HeaderBar (Contains Settings Button)                        │
│  └─ @open-settings → showSettings = true                    │
├─────────────────────────────────────────────────────────────┤
│  SettingsModal (Modal Component)                             │
│  ├─ 👤 Profile Tab                                          │
│  ├─ 🔐 Password Tab                                         │
│  ├─ ⚙️  Preferences Tab                                     │
│  ├─ 🔔 Notifications Tab                                    │
│  └─ 🔒 Security Tab                                         │
│     └─ Emits @close event → showSettings = false            │
├─────────────────────────────────────────────────────────────┤
│  settingsApi.js (API Client)                                │
│  ├─ GET /superadmin/settings                                │
│  ├─ PUT /superadmin/settings                                │
│  └─ PUT /superadmin/settings/password                       │
├─────────────────────────────────────────────────────────────┤
│  Backend (Node.js/Express)                                  │
│  ├─ superadmin.routes.js                                    │
│  ├─ Super_Admin Table                                       │
│  ├─ SuperAdmin_Settings Table                               │
│  └─ Audit_Log Table                                         │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
TrackTimi_TT/
├── frontend/
│   └── src/
│       ├── components/
│       │   └── dashboard/
│       │       └── SettingsModal.vue         ← Main Component
│       ├── services/
│       │   └── settingsApi.js                ← API Client
│       └── views/
│           └── admin/
│               └── SuperAdminDashboard.vue   ← Integration
├── backend/
│   ├── routes/
│   │   └── superadmin.routes.js              ← API Endpoints
│   ├── models/
│   └── config/
│       └── db.js
├── SETTINGS_FEATURE.md                       ← Full Documentation
├── SETTINGS_QUICK_REFERENCE.md               ← Quick Guide
├── SETTINGS_IMPLEMENTATION_CHECKLIST.md      ← Testing Guide
└── SETTINGS_DEVELOPER_GUIDE.md               ← This File
```

## Step-by-Step Implementation

### Step 1: Verify Backend API Endpoints

The backend endpoints should already be in place in [superadmin.routes.js](backend/routes/superadmin.routes.js).

**Verify GET endpoint:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/superadmin/settings
```

**Verify PUT endpoint:**
```bash
curl -X PUT -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"category":"profile","settings":{"fullName":"New Name"}}' \
  http://localhost:5000/api/superadmin/settings
```

### Step 2: Install Dependencies

Ensure all required packages are installed:

```bash
cd frontend
npm install axios                    # HTTP client
npm install tailwindcss             # Styling
npm install lucide-vue-next         # Icons
npm install vue@3                   # Vue 3
```

### Step 3: Integrate Frontend Components

The components are already created. Just verify they exist:

- ✅ `/frontend/src/components/dashboard/SettingsModal.vue`
- ✅ `/frontend/src/services/settingsApi.js`

### Step 4: Add to Dashboard

The integration is already done in SuperAdminDashboard.vue:

```vue
<!-- In template -->
<SettingsModal :isOpen="showSettings" @close="showSettings = false" />

<!-- In script imports -->
import SettingsModal from '@/components/dashboard/SettingsModal.vue'

<!-- In reactive state -->
const showSettings = ref(false)
```

### Step 5: Test the Feature

1. Start the backend server
2. Start the frontend development server
3. Navigate to SuperAdmin Dashboard
4. Click Settings button in header
5. Test each tab and functionality

## Extending the Settings Feature

### Adding a New Settings Category

#### 1. Update Backend (Create new category handling)

In `backend/routes/superadmin.routes.js`:

```javascript
// 1. Add to validCategories array
const validCategories = [
  'profile', 
  'preferences', 
  'notifications', 
  'dashboard', 
  'security', 
  'integrations',
  'YOUR_NEW_CATEGORY'  // ← Add here
];

// 2. Add default values in GET endpoint
router.get('/settings', (req, res) => {
  res.json({
    success: true,
    settings: {
      // ... existing settings ...
      yourNewCategory: {
        option1: 'default_value',
        option2: true,
        option3: 'another_value'
      }
    }
  });
});
```

#### 2. Update Frontend Modal

In `SettingsModal.vue`:

```vue
<!-- 1. Add tab to navigation -->
const tabs = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'password', label: 'Password', icon: '🔐' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'your_category', label: 'Your Label', icon: '🆕' }  // ← Add here
]

<!-- 2. Add tab content -->
<div v-else-if="activeTab === 'your_category'" class="space-y-6">
  <!-- Your form fields here -->
  <h3 class="text-xl font-black text-slate-900">Your Category Title</h3>
  <!-- Add your form fields -->
  <button @click="saveSettings('your_category')">Save</button>
</div>

<!-- 3. Initialize state -->
const editSettings = reactive({
  profile: {},
  preferences: {},
  notifications: {},
  security: {},
  your_category: {}  // ← Add here
})
```

#### 3. Update API Service

In `settingsApi.js`:

```javascript
export const settingsApi = {
  // ... existing methods ...
  
  // Add method for your category
  getYourCategorySettings: () => createClient().get('/settings'),
  
  updateYourCategory: (settings) =>
    createClient().put('/settings', { 
      category: 'your_category', 
      settings 
    })
}
```

### Adding a New Form Field

**Example: Adding a "Bio" field to Profile**

1. Update Backend Default Values:
```javascript
profile: {
  email: 'superadmin@tracktimi.com',
  // ... existing fields ...
  bio: ''  // ← Add here
}
```

2. Update Frontend Form:
```vue
<div>
  <label class="block text-sm font-bold text-slate-700 mb-2">Bio</label>
  <textarea
    v-model="editSettings.profile.bio"
    class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
    rows="3"
    placeholder="Tell us about yourself..."
  ></textarea>
</div>
```

3. Test the field by clicking Save Profile

### Using Settings in Other Components

#### Example 1: Access Settings in a Component

```vue
<script setup>
import { settingsApi } from '@/services/settingsApi'
import { ref } from 'vue'

const userPreferences = ref({})

const loadPreferences = async () => {
  try {
    const response = await settingsApi.getSettings()
    userPreferences.value = response.data.settings.preferences
    
    // Apply preferences
    applyTheme(userPreferences.value.theme)
    applyLanguage(userPreferences.value.language)
  } catch (error) {
    console.error('Failed to load preferences:', error)
  }
}

const applyTheme = (theme) => {
  // Apply theme logic
  document.documentElement.setAttribute('data-theme', theme)
}

const applyLanguage = (language) => {
  // Apply language logic
  i18n.locale = language
}
</script>
```

#### Example 2: React to Settings Changes

```vue
<script setup>
import { watch } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()

// Watch for preference changes
watch(
  () => settingsStore.preferences.theme,
  (newTheme) => {
    applyTheme(newTheme)
    console.log(`Theme changed to: ${newTheme}`)
  }
)

watch(
  () => settingsStore.preferences.compactView,
  (isCompact) => {
    toggleCompactView(isCompact)
    console.log(`Compact view: ${isCompact}`)
  }
)
</script>
```

#### Example 3: Store Settings in Pinia

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
    loading: false,
    error: null
  }),

  getters: {
    isDarkMode: (state) => state.preferences.theme === 'dark',
    isCompactView: (state) => state.preferences.compactView,
    getLanguage: (state) => state.preferences.language
  },

  actions: {
    async loadSettings() {
      this.loading = true
      try {
        const response = await settingsApi.getSettings()
        const { settings } = response.data
        this.profile = settings.profile
        this.preferences = settings.preferences
        this.notifications = settings.notifications
        this.security = settings.security
        this.dashboard = settings.dashboard
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async updateCategory(category, data) {
      try {
        await settingsApi.updateSettings(category, data)
        this[category] = data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    clearError() {
      this.error = null
    }
  }
})
```

## Data Persistence & State Management

### Option 1: localStorage (Simple)

```javascript
// Save to localStorage
const saveToStorage = (key, value) => {
  localStorage.setItem(`settings_${key}`, JSON.stringify(value))
}

// Load from localStorage
const loadFromStorage = (key, defaultValue) => {
  const stored = localStorage.getItem(`settings_${key}`)
  return stored ? JSON.parse(stored) : defaultValue
}

// Usage
const userPrefs = loadFromStorage('preferences', defaultPreferences)
```

### Option 2: Pinia Store (Recommended)

```javascript
// Initialize store on app startup
import { useSettingsStore } from '@/stores/settingsStore'

export const initializeApp = async () => {
  const settingsStore = useSettingsStore()
  await settingsStore.loadSettings()
  
  // Apply loaded settings
  applySettings(settingsStore)
}

// In main.js or app.js
import { createPinia } from 'pinia'
import { initializeApp } from '@/utils/appInit'

const app = createApp(App)
app.use(createPinia())

// Load settings before mounting
initializeApp().then(() => {
  app.mount('#app')
})
```

### Option 3: Session Storage (Temporary)

```javascript
// For temporarily storing form changes before saving
const savePendingChanges = (category, data) => {
  sessionStorage.setItem(`pending_${category}`, JSON.stringify(data))
}

const getPendingChanges = (category) => {
  const pending = sessionStorage.getItem(`pending_${category}`)
  return pending ? JSON.parse(pending) : null
}

const clearPendingChanges = (category) => {
  sessionStorage.removeItem(`pending_${category}`)
}
```

## Error Handling Best Practices

### Comprehensive Error Handling

```javascript
const saveSettings = async (category) => {
  try {
    const response = await settingsApi.updateSettings(category, editSettings[category])
    
    // Validate response
    if (!response.data.success) {
      throw new Error(response.data.message || 'Unknown error')
    }
    
    // Show success message
    showSuccessToast(`${category} saved successfully`)
    
  } catch (error) {
    // Handle different error types
    if (error.response?.status === 401) {
      showErrorToast('Your session expired. Please log in again.')
      redirectToLogin()
    } else if (error.response?.status === 403) {
      showErrorToast('You do not have permission to modify settings.')
    } else if (error.response?.data?.error) {
      showErrorToast(error.response.data.error)
    } else if (error.message) {
      showErrorToast(error.message)
    } else {
      showErrorToast('Failed to save settings. Please try again.')
    }
    
    // Log error for debugging
    console.error(`Error saving ${category}:`, error)
  }
}
```

## Testing Guide

### Unit Tests (Jest/Vitest)

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsModal from '@/components/dashboard/SettingsModal.vue'
import { settingsApi } from '@/services/settingsApi'

vi.mock('@/services/settingsApi')

describe('SettingsModal', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(SettingsModal, {
      props: { isOpen: true }
    })
  })

  it('renders all tabs', () => {
    expect(wrapper.text()).toContain('Profile')
    expect(wrapper.text()).toContain('Password')
    expect(wrapper.text()).toContain('Preferences')
    expect(wrapper.text()).toContain('Notifications')
    expect(wrapper.text()).toContain('Security')
  })

  it('switches between tabs', async () => {
    const passwordTab = wrapper.find('[data-tab="password"]')
    await passwordTab.trigger('click')
    expect(wrapper.vm.activeTab).toBe('password')
  })

  it('saves profile settings', async () => {
    settingsApi.updateSettings.mockResolvedValue({
      data: { success: true }
    })
    
    await wrapper.vm.saveSettings('profile')
    
    expect(settingsApi.updateSettings).toHaveBeenCalledWith(
      'profile',
      expect.any(Object)
    )
  })

  it('validates password strength', () => {
    wrapper.vm.passwordData.newPassword = 'weak'
    wrapper.vm.checkPasswordStrength()
    expect(wrapper.vm.passwordStrength.label).toBe('Weak')

    wrapper.vm.passwordData.newPassword = 'StrongP@ss123'
    wrapper.vm.checkPasswordStrength()
    expect(wrapper.vm.passwordStrength.label).toBe('Very Strong')
  })
})
```

### Integration Tests

```javascript
describe('Settings Integration', () => {
  it('loads and displays settings', async () => {
    const response = await settingsApi.getSettings()
    expect(response.data.settings).toBeDefined()
    expect(response.data.settings.profile).toBeDefined()
    expect(response.data.settings.preferences).toBeDefined()
  })

  it('updates settings and verifies changes', async () => {
    const newSettings = { fullName: 'Updated Name' }
    
    const updateResponse = await settingsApi.updateSettings('profile', newSettings)
    expect(updateResponse.data.success).toBe(true)
    
    const getResponse = await settingsApi.getSettings()
    expect(getResponse.data.settings.profile.fullName).toBe('Updated Name')
  })
})
```

## Performance Optimization

### Lazy Loading

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const SettingsModal = defineAsyncComponent(() =>
  import('@/components/dashboard/SettingsModal.vue')
)

// Only loads when needed
</script>
```

### Debounced Saves

```javascript
import { debounce } from 'lodash-es'

const debouncedSave = debounce((category) => {
  saveSettings(category)
}, 1000)

// Usage in form
const onPrefChange = () => {
  debouncedSave('preferences')
}
```

### Memoized API Calls

```javascript
const settingsCache = new Map()

export const getCachedSettings = async (cacheTime = 5 * 60 * 1000) => {
  const now = Date.now()
  
  if (settingsCache.has('settings')) {
    const { timestamp, data } = settingsCache.get('settings')
    if (now - timestamp < cacheTime) {
      return data
    }
  }
  
  const response = await settingsApi.getSettings()
  settingsCache.set('settings', {
    timestamp: now,
    data: response.data
  })
  
  return response.data
}
```

## Security Considerations

### Prevent XSS Attacks
```javascript
// Always use Vue's v-text or text interpolation, not v-html
<p v-text="userInput"></p>  // Safe
<p>{{ userInput }}</p>       // Safe
<p v-html="userInput"></p>  // Unsafe!
```

### Prevent CSRF Attacks
```javascript
// Ensure CSRF tokens are sent with state-changing requests
// Already handled by Axios in settingsApi.js with token headers
```

### Validate Input
```javascript
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validatePhone = (phone) => {
  const re = /^[0-9+\-\s()]+$/
  return re.test(phone)
}

const validatePassword = (password) => {
  return password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
}
```

### Never Store Sensitive Data in Frontend
```javascript
// Don't do this:
// localStorage.setItem('password', password)  // NEVER!
// sessionStorage.setItem('apiKey', apiKey)    // NEVER!

// Instead, keep sensitive data server-side only
// Send new data in API requests
```

## Deployment Considerations

### Environment Variables

```javascript
// .env.development
VITE_API_URL=http://localhost:5000/api

// .env.production
VITE_API_URL=https://api.tracktimi.com/api
```

### Build Optimization

```bash
# Check bundle size
npm run build
npm run analyze

# Tree-shake unused code
npm run build --mode production

# Minify assets
```

### Database Migrations

```bash
# If database schema changes are needed
node backend/migrate.js

# Verify migration
node backend/verify-migration.js
```

## Troubleshooting Guide

### Problem: Settings Not Loading

**Solution:**
```javascript
// Check token validity
const token = localStorage.getItem('superadminToken')
console.log('Token exists:', !!token)

// Verify API URL
console.log('API URL:', import.meta.env.VITE_API_URL)

// Check network tab for API response
```

### Problem: Password Change Fails

**Solution:**
```javascript
// Validate all requirements
const password = 'NewPassword123!'
console.log('Length >= 8:', password.length >= 8)
console.log('Has uppercase:', /[A-Z]/.test(password))
console.log('Has lowercase:', /[a-z]/.test(password))
console.log('Has numbers:', /\d/.test(password))
console.log('Has special:', /[^a-zA-Z\d]/.test(password))
```

### Problem: Settings Not Persisting

**Solution:**
```javascript
// Clear cache and reload
localStorage.clear()
sessionStorage.clear()
location.reload()

// Verify database updates
SELECT * FROM Audit_Log ORDER BY Timestamp DESC LIMIT 10;
```

## Resources & References

- [Vue 3 Documentation](https://vuejs.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)
- [Node.js Express Documentation](https://expressjs.com)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [JWT Documentation](https://jwt.io)

## Support & Feedback

Have questions or suggestions? Please:
1. Check the documentation files
2. Review existing code examples
3. Check the console for errors
4. Contact the development team

---

**Last Updated:** January 2024
**Version:** 1.0.0
**Status:** Production Ready
