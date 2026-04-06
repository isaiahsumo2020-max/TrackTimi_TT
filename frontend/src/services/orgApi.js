import axios from 'axios'

const API_BASE_URL = 'http://localhost:4000/api/admin'

const orgApi = axios.create({
  baseURL: API_BASE_URL
})

// Interceptor to add auth token to requests
orgApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor to handle auth errors
orgApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Admin Dashboard
export const getStats = () => orgApi.get('/stats')

// Invitations
export const inviteEmployee = (data) => orgApi.post('/invite-employee', data)
export const getInvitations = () => orgApi.get('/invitations')
export const resendInvitation = (invitationId) => orgApi.post(`/resend-invitation/${invitationId}`)

// Admin Notifications
export const getNotifications = (limit = 50) => orgApi.get(`/notifications?limit=${limit}`)
export const getUnreadNotificationCount = () => orgApi.get('/notifications/unread/count')
export const markNotificationAsRead = (notifyId) => orgApi.put(`/notifications/${notifyId}/read`)
export const markAllNotificationsAsRead = () => orgApi.put('/notifications/mark-all-read')
export const deleteNotification = (notifyId) => orgApi.delete(`/notifications/${notifyId}`)

// Organization Logo Management
export const uploadOrgLogo = (logoData, mimeType) => 
  orgApi.put('/logo', { logoData, mimeType })
export const deleteOrgLogo = () => 
  orgApi.delete('/logo')

export default orgApi
