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
    return api.post('/users', userData)
  }
  
  const addDepartment = async (deptData) => {
    return api.post('/org/departments', deptData)
  }
  
  const checkin = async (locationData) => {
    return api.post('/attendance/checkin', locationData)
  }
  
  return {
    orgUsers,
    orgDepartments,
    addUser,
    addDepartment,
    checkin
  }
}
