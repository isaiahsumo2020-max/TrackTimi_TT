import axios from 'axios'

const superadminApi = axios.create({
  baseURL: '/api/superadmin'
})

superadminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('superadmin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default superadminApi
