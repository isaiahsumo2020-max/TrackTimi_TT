/**
 * Composable: useNotifications
 * Handles real-time notifications from Socket.IO + API polling
 * Supports role-based real-time channels: superadmin, org_admin, employee
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/utils/api'
import { io } from 'socket.io-client'

export function useNotifications() {
  const notifications = ref([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const socket = ref(null)
  const categories = ref([])
  let pollingInterval = null

  // Get unread count only
  const getUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread/count')
      unreadCount.value = res.data.unreadCount || 0
    } catch (err) {
      console.error('❌ Failed to fetch unread count:', err)
    }
  }

  // Fetch all notifications
  const fetchNotifications = async (options = {}) => {
    try {
      isLoading.value = true
      const { limit = 50, category = null, type = null, isRead = null } = options
      
      let url = `/notifications?limit=${limit}`
      if (category) url += `&category=${category}`
      if (type) url += `&type=${type}`
      if (isRead !== null) url += `&isRead=${isRead}`

      const res = await api.get(url)
      notifications.value = res.data.notifications || []
      unreadCount.value = res.data.unreadCount || 0
    } catch (err) {
      console.error('❌ Failed to fetch notifications:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Fetch notification categories
  const fetchCategories = async () => {
    try {
      const res = await api.get('/notifications/categories')
      categories.value = res.data.categories || []
    } catch (err) {
      console.error('❌ Failed to fetch categories:', err)
    }
  }

  // Mark notification as read
  const markAsRead = async (notifyId) => {
    try {
      await api.put(`/notifications/${notifyId}/read`)
      const notif = notifications.value.find(n => n.Notify_ID === notifyId)
      if (notif) {
        notif.Is_Read = 1
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err) {
      console.error('❌ Failed to mark as read:', err)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      notifications.value.forEach(n => { n.Is_Read = 1 })
      unreadCount.value = 0
    } catch (err) {
      console.error('❌ Failed to mark all as read:', err)
    }
  }

  // Delete notification
  const deleteNotification = async (notifyId) => {
    try {
      await api.delete(`/notifications/${notifyId}`)
      const notif = notifications.value.find(n => n.Notify_ID === notifyId)
      if (notif && !notif.Is_Read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value = notifications.value.filter(n => n.Notify_ID !== notifyId)
    } catch (err) {
      console.error('❌ Failed to delete notification:', err)
    }
  }

  // Delete multiple notifications
  const deleteMultiple = async (notifyIds) => {
    try {
      await api.delete('/notifications', { data: { notifyIds } })
      notifyIds.forEach(id => {
        const notif = notifications.value.find(n => n.Notify_ID === id)
        if (notif && !notif.Is_Read) {
          unreadCount.value--
        }
      })
      notifications.value = notifications.value.filter(n => !notifyIds.includes(n.Notify_ID))
    } catch (err) {
      console.error('❌ Failed to delete notifications:', err)
    }
  }

  // Initialize Socket.IO for real-time notifications with role-based channels
  const initSocket = async () => {
    try {
      const userStr = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (!userStr || !token) {
        console.warn('⚠️ No user or token found')
        return
      }

      const user = JSON.parse(userStr)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

      socket.value = io(apiUrl, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      })

      socket.value.on('connect', () => {
        console.log('✅ Socket connected:', socket.value.id)
        
        // Authenticate and join role-based channels
        socket.value.emit('userLogin', {
          userId: user.User_ID || user.userId,
          orgId: user.Org_ID || user.orgId,
          userTypeId: user.User_Type_ID || user.userTypeId,
          role: user.role || (user.User_Type_ID === 1 ? 'superadmin' : 'admin')
        })
      })

      // Listen for new real-time notifications
      socket.value.on('notification:new', (notification) => {
        console.log('📬 Real-time notification received:', notification)
        
        const newNotif = {
          Notify_ID: notification.Notify_ID || Date.now(),
          Title: notification.title,
          Message: notification.message,
          Type: notification.type,
          Category: notification.category,
          Is_Read: 0,
          Created_at: notification.timestamp || new Date().toISOString(),
          Action_URL: notification.actionUrl
        }
        
        notifications.value.unshift(newNotif)
        unreadCount.value++

        // Show toast if available
        if (window.__showToast) {
          window.__showToast(notification.message, notification.type || 'info')
        }
      })

      // Handle reconnection
      socket.value.on('reconnect', () => {
        console.log('✅ Socket reconnected, re-authenticating...')
        socket.value.emit('userLogin', {
          userId: user.User_ID || user.userId,
          orgId: user.Org_ID || user.orgId,
          userTypeId: user.User_Type_ID || user.userTypeId,
          role: user.role || (user.User_Type_ID === 1 ? 'superadmin' : 'admin')
        })
      })

      socket.value.on('disconnect', () => {
        console.log('📴 Socket disconnected')
      })

      socket.value.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error)
      })

      console.log('✅ Socket.IO initialized with role-based channels')
    } catch (err) {
      console.error('❌ Failed to initialize Socket.IO:', err)
    }
  }

  // Clean up
  const cleanup = () => {
    if (pollingInterval) clearInterval(pollingInterval)
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
  }

  // Computed
  const totalNotifications = computed(() => notifications.value.length)
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.Is_Read)
  )

  // Setup
  onMounted(() => {
    fetchNotifications()
    fetchCategories()
    initSocket()
    // Poll every 30 seconds for unread count (backup to Socket.IO)
    pollingInterval = setInterval(getUnreadCount, 30000)
  })

  onUnmounted(cleanup)

  return {
    notifications,
    unreadCount,
    isLoading,
    categories,
    totalNotifications,
    unreadNotifications,
    fetchNotifications,
    fetchCategories,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMultiple,
    initSocket,
    cleanup
  }
}
