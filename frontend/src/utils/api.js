import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
})

// Add the token to every request automatically
api.interceptors.request.use((config) => {
  // Check for both regular token and superAdminToken
  const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api