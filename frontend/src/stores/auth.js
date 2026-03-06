// src/stores/auth.js - COMPLETE SUPER ADMIN SUPPORT
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // ⭐ ORG USER STATE
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const orgSlug = ref('')
  const isAdmin = ref(false)

  // ⭐ SUPER ADMIN STATE
  const superAdminToken = ref(localStorage.getItem('superAdminToken') || '')
  const superAdminUser = ref(JSON.parse(localStorage.getItem('superAdminUser')) || null)
  const isSuperAdmin = ref(false)

  // ⭐ Computed: Single source of truth
  const isAuthenticated = computed(() => !!token.value || !!superAdminToken.value)
  const currentUser = computed(() => user.value || superAdminUser.value)
  const authRole = computed(() => {
    if (superAdminUser.value) return 'SuperAdmin'
    if (user.value?.role) return user.value.role
    return null
  })

  const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
  })

  // Update auth headers for org token
  const updateOrgAuthHeader = () => {
    if (token.value) {
      api.defaults.headers.common.Authorization = `Bearer ${token.value}`
    } else {
      delete api.defaults.headers.common.Authorization
    }
  }

  // Update auth headers for super admin token
  const updateSuperAdminAuthHeader = () => {
    if (superAdminToken.value) {
      api.defaults.headers.common['X-SuperAdmin-Token'] = `Bearer ${superAdminToken.value}`
    } else {
      delete api.defaults.headers.common['X-SuperAdmin-Token']
    }
  }

  // Initialize from localStorage
  const initializeAuth = () => {
    if (user.value) {
      orgSlug.value = user.value.orgSlug || ''
      isAdmin.value = ['OrgAdmin', 'Admin'].includes(user.value.role)
    }
    if (superAdminUser.value) {
      isSuperAdmin.value = true
    }
    updateOrgAuthHeader()
    updateSuperAdminAuthHeader()
  }

  initializeAuth()

  // ⭐ ORG USER METHODS
  const setOrgSession = (newToken, newUser) => {
    token.value = newToken
    user.value = newUser
    orgSlug.value = newUser?.orgSlug || ''
    isAdmin.value = ['OrgAdmin', 'Admin'].includes(newUser?.role || '')
    
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    updateOrgAuthHeader()
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      setOrgSession(response.data.token, response.data.user)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  const registerOrg = async (payload) => {
    try {
      const response = await api.post('/auth/register-org', payload)
      setOrgSession(response.data.token, response.data.user)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Organization creation failed' 
      }
    }
  }

  // ⭐ SUPER ADMIN METHODS
  const setSuperAdminSession = (newToken, newUser) => {
    superAdminToken.value = newToken
    superAdminUser.value = newUser
    isSuperAdmin.value = true
    
    localStorage.setItem('superAdminToken', newToken)
    localStorage.setItem('superAdminUser', JSON.stringify(newUser))
    updateSuperAdminAuthHeader()
  }

  const superAdminLogin = async (credentials) => {
    try {
      const response = await fetch('/api/superadmin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuperAdminSession(data.token, data.user)
      }
      
      return data
    } catch (error) {
      console.error('Super Admin login failed:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  // ⭐ LOGOUT (clears ALL sessions)
  const logout = () => {
    // Clear org session
    token.value = ''
    user.value = null
    orgSlug.value = ''
    isAdmin.value = false
    
    // Clear super admin session
    superAdminToken.value = ''
    superAdminUser.value = null
    isSuperAdmin.value = false
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('superAdminToken')
    localStorage.removeItem('superAdminUser')
    
    updateOrgAuthHeader()
    updateSuperAdminAuthHeader()
  }

  return {
    // Org state
    token, user, orgSlug, isAdmin,
    // Super admin state
    superAdminToken, superAdminUser, isSuperAdmin,
    // Computed
    isAuthenticated, currentUser, authRole,
    // Methods
    login, registerOrg, superAdminLogin, logout, api
  }
})
