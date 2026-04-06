import axios from 'axios'

// Use relative path for development (Vite will proxy to backend)
// Or use full URL if needed
const API_URL = import.meta.env.VITE_API_URL || '/api'

// Get token from various possible keys
const getToken = () => {
  let token = localStorage.getItem('superAdminToken')  // Correct key with capital A
  if (!token) token = localStorage.getItem('superadminToken')
  if (!token) token = localStorage.getItem('token')
  if (!token) token = localStorage.getItem('authToken')
  if (!token) token = sessionStorage.getItem('superAdminToken')
  if (!token) token = sessionStorage.getItem('token')
  console.log('🔑 Token found:', !!token)
  return token
}

// Create axios instance with auth token
const createClient = () => {
  const token = getToken()
  
  const baseURL = API_URL.startsWith('http') ? `${API_URL}/superadmin` : `${API_URL}/superadmin`
  
  console.log('🔐 Creating API client with:', {
    apiUrl: baseURL,
    hasToken: !!token,
    tokenLength: token ? token.length : 0
  })
  
  return axios.create({
    baseURL: baseURL,
    headers: {
      Authorization: token ? `Bearer ${token}` : 'Bearer undefined',
      'Content-Type': 'application/json'
    }
  })
}

export const settingsApi = {
  // Fetch all settings
  getSettings: () => createClient().get('/settings'),

  // Update specific settings category
  updateSettings: (category, settings) =>
    createClient().put('/settings', { category, settings }),

  // Change password
  changePassword: (currentPassword, newPassword, confirmPassword) =>
    createClient().put('/settings/password', {
      currentPassword,
      newPassword,
      confirmPassword
    }),

  // Get profile settings only
  getProfileSettings: () => createClient().get('/settings'),

  // Get preferences settings only
  getPreferences: () => createClient().get('/settings'),

  // Get notification settings only
  getNotificationSettings: () => createClient().get('/settings'),

  // Get security settings only
  getSecuritySettings: () => createClient().get('/settings'),

  // Validate current password
  validatePassword: (password) =>
    createClient().post('/settings/validate-password', { password }),

  // Enable two-factor authentication
  enableTwoFA: () => createClient().post('/settings/2fa/enable'),

  // Disable two-factor authentication
  disableTwoFA: () => createClient().post('/settings/2fa/disable'),

  // Get two-factor authentication status
  getTwoFAStatus: () => createClient().get('/settings/2fa/status'),

  // Add IP to whitelist
  addIPToWhitelist: (ip) =>
    createClient().post('/settings/security/ip-whitelist', { ip }),

  // Remove IP from whitelist
  removeIPFromWhitelist: (ip) =>
    createClient().delete(`/settings/security/ip-whitelist/${ip}`),

  // Get IP whitelist
  getIPWhitelist: () => createClient().get('/settings/security/ip-whitelist'),

  // Submit security question answers for password recovery
  submitSecurityAnswers: (answers) =>
    createClient().post('/settings/security/answers', { answers }),

  // Get security questions
  getSecurityQuestions: () => createClient().get('/settings/security/questions'),

  // Export settings as JSON
  exportSettings: () => createClient().get('/settings/export'),

  // Import settings from JSON
  importSettings: (settingsData) =>
    createClient().post('/settings/import', { settings: settingsData }),

  // Reset settings to defaults
  resetToDefaults: () =>
    createClient().post('/settings/reset-defaults')
}
