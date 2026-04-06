/**
 * Composable: useNotifications
 * Handles real-time notifications from Socket.IO + API polling
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/utils/api'
import { useRoute } from 'vue-router'
import { io } from 'socket.io-client'

export function useNotifications() {
  const route = useRoute()
  const notifications = ref([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const socket = ref(null)
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
  const fetchNotifications = async () => {
    try {
      isLoading.value = true
      const res = await api.get('/notifications?limit=50')
      notifications.value = res.data.notifications || []
      unreadCount.value = res.data.unreadCount || 0
    } catch (err) {
      console.error('❌ Failed to fetch notifications:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Mark notification as read
  const markAsRead = async (notifyId) => {
    try {
      await api.put(`/notifications/${notifyId}/read`)
      // Update local state
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
      notifications.value = notifications.value.filter(n => n.Notify_ID !== notifyId)
    } catch (err) {
      console.error('❌ Failed to delete notification:', err)
    }
  }

  // Initialize Socket.IO for real-time notifications
  const initSocket = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const token = localStorage.getItem('token')
      
      if (!user || !token) return

      socket.value = io(process.env.VUE_APP_API_URL || 'http://localhost:3001', {
        auth: {
          token
        }
      })

      socket.value.emit('userLogin', {
        userId: user.User_ID || user.userId,
        orgId: user.Org_ID || user.orgId
      })

      // Listen for incoming notifications
      socket.value.on('notification', (notification) => {
        console.log('📬 Real-time notification received:', notification)
        
        // Add to notifications array
        const newNotif = {
          Notify_ID: Date.now(),
          Title: notification.title,
          Message: notification.message,
          Type: notification.type,
          Category: notification.category,
          Is_Read: 0,
          Created_at: notification.timestamp
        }
        
        notifications.value.unshift(newNotif)
        unreadCount.value += 1

        // Optional: Show toast for new notification
        if (window.__showToast) {
          window.__showToast(notification.message, notification.type)
        }
      })

      // Handle reconnection
      socket.value.on('reconnect', () => {
        console.log('✅ Socket reconnected')
        socket.value.emit('userLogin', {
          userId: user.User_ID || user.userId,
          orgId: user.Org_ID || user.orgId
        })
      })

      socket.value.on('disconnect', () => {
        console.log('📴 Socket disconnected')
      })

      console.log('✅ Socket.IO connected for real-time notifications')
    } catch (err) {
      console.error('❌ Failed to initialize Socket.IO:', err)
    }
  }

  // Clean up Socket.IO
  const cleanupSocket = () => {
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
    initSocket()
    // Poll every 10 seconds for unread count (backup to Socket.IO)
    pollingInterval = setInterval(getUnreadCount, 10000)
  })

  onUnmount(() => {
    if (pollingInterval) clearInterval(pollingInterval)
    cleanupSocket()
  })

  return {
    notifications,
    unreadCount,
    isLoading,
    totalNotifications,
    unreadNotifications,
    fetchNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }
}
