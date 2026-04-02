import axios from 'axios'

const API_BASE_URL = 'http://localhost:4000/api/superadmin'

const superadminApi = axios.create({
  baseURL: API_BASE_URL
})

superadminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('superAdminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

superadminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('superAdminToken')
      localStorage.removeItem('superAdminUser')
      // Trigger logout - redirect to login
      window.location.href = '/superadmin/login'
    }
    return Promise.reject(error)
  }
)

// Export the api instance
export { superadminApi }

// Dashboard
export const getDashboard = () => superadminApi.get('/dashboard')
export const getOrganizations = () => superadminApi.get('/organizations')
export const getOrgDetails = (orgId) => superadminApi.get(`/organizations/${orgId}/details`)
export const getAuditLogs = () => superadminApi.get('/audit-logs')
export const getUsers = () => superadminApi.get('/users')

// Organization Management (CRUD)
export const createOrganization = (data) => superadminApi.post('/organizations', data)
export const updateOrganization = (orgId, data) => superadminApi.put(`/organizations/${orgId}`, data)
export const updateOrgSettings = (orgId, settings) => superadminApi.put(`/organizations/${orgId}/settings`, settings)
export const toggleOrgStatus = (orgId, isActive) => superadminApi.put(`/organizations/${orgId}/status`, { isActive })
export const deleteOrganization = (orgId) => superadminApi.delete(`/organizations/${orgId}`)

// Organization User Management
export const assignUserToOrg = (orgId, userId) => superadminApi.post(`/organizations/${orgId}/users`, { userId })
export const removeUserFromOrg = (orgId, userId) => superadminApi.delete(`/organizations/${orgId}/users/${userId}`)

// System Health
export const getSystemHealth = () => superadminApi.get('/system/health')

// Analytics
export const getAttendanceAnalytics = (days = 30, orgId = null) => {
  const params = new URLSearchParams()
  params.append('days', days)
  if (orgId) params.append('orgId', orgId)
  return superadminApi.get('/analytics/attendance?' + params.toString())
}

export const getEmployeeAnalytics = (days = 7, orgId = null) => {
  const params = new URLSearchParams()
  params.append('days', days)
  if (orgId) params.append('orgId', orgId)
  return superadminApi.get('/analytics/employees?' + params.toString())
}

// Geofences
export const getGeofences = () => superadminApi.get('/geofences')
export const getGeofenceViolations = (geofenceId) => superadminApi.get(`/geofences/${geofenceId}/violations`)

// Departments & Shifts
export const getDepartments = (orgId = null) => {
  const params = orgId ? `?orgId=${orgId}` : ''
  return superadminApi.get(`/departments${params}`)
}
export const getShifts = () => superadminApi.get('/shifts')

// Revenue & Activity
export const getRevenueSummary = () => superadminApi.get('/revenue/summary')
export const getUserLogins = (days = 7) => superadminApi.get(`/activity/user-logins?days=${days}`)

// Alerts
export const getAlerts = () => superadminApi.get('/alerts')

export default superadminApi
