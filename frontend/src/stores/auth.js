// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  function parseUserData(userData) {
    if (!userData) return null
    try {
      return JSON.parse(userData)
    } catch (e) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('superAdminToken')
      localStorage.removeItem('superAdminUser')
      return null
    }
  }

  const token = ref(localStorage.getItem('token') || '')
  const user = ref(parseUserData(localStorage.getItem('user')))
  const orgSlug = ref(user.value?.orgSlug || '')
  const isAdmin = ref(['OrgAdmin', 'Admin'].includes(user.value?.role || ''))

  const superAdminToken = ref(localStorage.getItem('superAdminToken') || '')
  const superAdminUser = ref(parseUserData(localStorage.getItem('superAdminUser')))
  const isSuperAdmin = ref(!!superAdminUser.value)

  const isAuthenticated = computed(() => !!token.value || !!superAdminToken.value)
  const currentUser = computed(() => user.value || superAdminUser.value)
  const authRole = computed(() => {
    if (superAdminUser.value) return 'SuperAdmin'
    if (user.value?.role) return user.value.role
    return null
  })
  const org_id = computed(() => user.value?.orgId || null)

  const api = axios.create({
    baseURL: 'http://localhost:4000/api',
    headers: { 'Content-Type': 'application/json' }
  })

  const orgApi = axios.create({
    baseURL: 'http://localhost:4000/api',
    headers: { 'Content-Type': 'application/json' }
  })

  const superAdminApi = axios.create({
    baseURL: 'http://localhost:4000/api/superadmin',
    headers: { 'Content-Type': 'application/json' }
  })

  // Add authorization interceptor to api
  api.interceptors.request.use((config) => {
    const t = localStorage.getItem('token')
    if (t) config.headers.Authorization = `Bearer ${t}`
    return config
  })

  orgApi.interceptors.request.use((config) => {
    const t = localStorage.getItem('token')
    if (t) config.headers.Authorization = `Bearer ${t}`
    return config
  })

  superAdminApi.interceptors.request.use((config) => {
    const t = localStorage.getItem('superAdminToken')
    if (t) config.headers.Authorization = `Bearer ${t}`
    return config
  })

  const setOrgSession = (newToken, newUser) => {
    token.value = newToken
    user.value = newUser
    orgSlug.value = newUser?.orgSlug || ''
    isAdmin.value = ['OrgAdmin', 'Admin'].includes(newUser?.role || '')
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const setSuperAdminSession = (newToken, newUser) => {
    superAdminToken.value = newToken
    superAdminUser.value = newUser
    isSuperAdmin.value = true
    localStorage.setItem('superAdminToken', newToken)
    localStorage.setItem('superAdminUser', JSON.stringify(newUser))
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      setOrgSession(response.data.token, response.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' }
    }
  }

  const registerOrg = async (payload) => {
    try {
      const response = await api.post('/auth/register-org', payload)
      // Do NOT set session yet - user needs to verify email first
      if (response.data?.email) {
        localStorage.setItem('pendingVerificationEmail', response.data.email)
      }
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Organization creation failed' }
    }
  }

  const domainLogin = async (credentials) => {
    try {
      const response = await api.post('/auth/domain-login', credentials)
      setOrgSession(response.data.token, response.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Domain login failed' }
    }
  }

  const superAdminLogin = async (credentials) => {
    try {
      const response = await superAdminApi.post('/login', credentials)
      if (response.data?.token) {
        setSuperAdminSession(response.data.token, response.data.user)
        return { success: true, ...response.data }
      }
      return { success: false, error: 'No token returned from server' }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' }
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    orgSlug.value = ''
    isAdmin.value = false
    superAdminToken.value = ''
    superAdminUser.value = null
    isSuperAdmin.value = false

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('superAdminToken')
    localStorage.removeItem('superAdminUser')
  }

  const updateUserAvatar = (avatarData, avatarMimeType) => {
    if (user.value) {
      user.value.avatar = avatarData
      user.value.avatarMimeType = avatarMimeType
      localStorage.setItem('user', JSON.stringify(user.value))
      console.log('✅ Auth store updated with new avatar')
    }
  }

  return {
    token,
    user,
    orgSlug,
    org_id,
    isAdmin,
    superAdminToken,
    superAdminUser,
    isSuperAdmin,
    isAuthenticated,
    currentUser,
    authRole,
    login,
    registerOrg,
    domainLogin,
    superAdminLogin,
    logout,
    updateUserAvatar,
    api,
    orgApi,
    superAdminApi
  }
})
