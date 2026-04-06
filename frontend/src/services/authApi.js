import axios from 'axios'

const API_BASE_URL = 'http://localhost:4000/api/auth'

const authApi = axios.create({
  baseURL: API_BASE_URL
})

// Interceptor to add auth token to requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor to handle errors
authApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || 'An error occurred'
    return Promise.reject({
      message,
      status: error.response?.status,
      ...error.response?.data
    })
  }
)

// Auth Endpoints
export const registerOrg = (data) => authApi.post('/register-org', data)

export const login = (email, password) => authApi.post('/login', { email, password })

export const refreshToken = () => authApi.post('/refresh-token')

export const getProfile = () => authApi.get('/profile')

export const inviteEmployee = (data) => authApi.post('/invite', data)

export const activateInvitation = (data) => authApi.post('/activate-invitation', data)

// Email Verification Endpoints
export const verifyEmailByLink = (token) => {
  return fetch(`${API_BASE_URL}/verify-email?token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success && data.error) {
        throw { message: data.error, tokenExpired: data.tokenExpired }
      }
      return data
    })
}

export const verifyEmailByCode = (data) => authApi.post('/verify-code', data)

export const resendVerification = (data) => authApi.post('/resend-verification', data)

export default authApi
