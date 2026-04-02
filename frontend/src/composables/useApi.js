// src/composables/useApi.js
import { useAuthStore } from '@/stores/auth.js'
import api from '@/utils/api.js'

export const useApi = () => {
  const authStore = useAuthStore()
  
  const orgUsers = async () => {
    return api.get('/users')
  }
  
  const getAdmins = async () => {
    // Fetch all organization admins with their org info
    return api.get('/users/admins/list')
  }
  
  const getUserById = async (userId) => {
    return api.get(`/users/${userId}`)
  }
  
  const orgDepartments = async () => {
    return api.get('/org/departments')
  }
  
  const addUser = async (userData) => {
    return api.post('/org/users', userData)
  }
  
  const updateUser = async (userId, userData) => {
    return api.put(`/users/${userId}`, userData)
  }
  
  const deleteUser = async (userId) => {
    return api.delete(`/users/${userId}`)
  }
  
  const addDepartment = async (deptData) => {
    return api.post('/org/departments', deptData)
  }

  const inviteEmployee = async (inviteData) => {
    return api.post('/auth/invite', inviteData)
  }
  
  const activateInvitation = async (activationData) => {
    return api.post('/auth/activate-invitation', activationData)
  }
  
  const checkin = async (locationData) => {
    return api.post('/attendance/checkin', locationData)
  }
  
  return {
    orgUsers,
    getAdmins,
    getUserById,
    orgDepartments,
    addUser,
    updateUser,
    deleteUser,
    addDepartment,
    inviteEmployee,
    activateInvitation,
    checkin
  }
}
