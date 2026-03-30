// src/composables/useApi.js
import { useAuthStore } from '@/stores/auth.js'
import api from '@/utils/api.js'

export const useApi = () => {
  const authStore = useAuthStore()
  
  const orgUsers = async () => {
    return api.get('/org/users')
  }
  
  const orgDepartments = async () => {
    return api.get('/org/departments')
  }
  
  const addUser = async (userData) => {
    return api.post('/org/users', userData)
  }
  
  const addDepartment = async (deptData) => {
    return api.post('/org/departments', deptData)
  }

  const inviteEmployee = async (inviteData) => {
    return api.post('/org/invite', inviteData)
  }
  
  const activateInvitation = async (activationData) => {
    return api.post('/auth/activate', activationData)
  }
  
  const checkin = async (locationData) => {
    return api.post('/attendance/checkin', locationData)
  }
  
  return {
    orgUsers,
    orgDepartments,
    addUser,
    addDepartment,
    inviteEmployee,
    activateInvitation,
    checkin
  }
}
