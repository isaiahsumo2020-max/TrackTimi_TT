import axios from 'axios'

const API_BASE_URL = 'http://localhost:4000/api/feedback'

const feedbackApi = axios.create({
  baseURL: API_BASE_URL
})

// Interceptor to add auth token to requests
feedbackApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor to handle auth errors
feedbackApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Submit feedback
export const submitFeedback = (data) => feedbackApi.post('/', data)

// Get feedback (for org admins viewing their own feedback)
export const getFeedback = () => feedbackApi.get('/')

export default feedbackApi
