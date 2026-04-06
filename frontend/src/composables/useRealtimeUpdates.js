import { ref, onMounted, onBeforeUnmount } from 'vue'
import io from 'socket.io-client'

/**
 * Composable for real-time updates via WebSocket
 * Provides live status, schedule, and analytics updates
 */
export function useRealtimeUpdates() {
  const socket = ref(null)
  const isConnected = ref(false)
  const statusUpdate = ref(null)
  const scheduleUpdate = ref(null)
  const analyticsUpdate = ref(null)
  const notificationQueue = ref([])

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  const connect = () => {
    try {
      socket.value = io(API_URL, {
        auth: {
          token: localStorage.getItem('token'),
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      })

      // Connection events
      socket.value.on('connect', () => {
        isConnected.value = true
        console.log('✅ Real-time connection established')
      })

      socket.value.on('disconnect', () => {
        isConnected.value = false
        console.log('❌ Real-time connection lost')
      })

      socket.value.on('connect_error', (error) => {
        console.error('Connection error:', error)
      })

      // Status updates
      socket.value.on('status:updated', (data) => {
        statusUpdate.value = {
          ...data,
          timestamp: new Date(),
        }
      })

      // Schedule updates
      socket.value.on('schedule:updated', (data) => {
        scheduleUpdate.value = {
          ...data,
          timestamp: new Date(),
        }
      })

      // Analytics updates
      socket.value.on('analytics:updated', (data) => {
        analyticsUpdate.value = {
          ...data,
          timestamp: new Date(),
        }
      })

      // Notifications
      socket.value.on('notification:new', (data) => {
        notificationQueue.value.push({
          ...data,
          id: Date.now(),
          timestamp: new Date(),
        })

        // Auto-remove after 5 seconds
        setTimeout(() => {
          notificationQueue.value.shift()
        }, 5000)
      })

      // Break notifications
      socket.value.on('break:reminder', (data) => {
        notificationQueue.value.push({
          type: 'break',
          message: data.message,
          id: Date.now(),
        })
      })

      // Leave early reminders
      socket.value.on('shift:reminder', (data) => {
        notificationQueue.value.push({
          type: 'shift',
          message: data.message,
          id: Date.now(),
        })
      })
    } catch (error) {
      console.error('Failed to connect to real-time service:', error)
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      isConnected.value = false
    }
  }

  const emit = (event, data) => {
    if (socket.value && isConnected.value) {
      socket.value.emit(event, data)
    }
  }

  const requestStatusUpdate = () => {
    emit('status:request', {})
  }

  const requestScheduleUpdate = () => {
    emit('schedule:request', {})
  }

  const requestAnalyticsUpdate = () => {
    emit('analytics:request', {})
  }

  const dismissNotification = (id) => {
    notificationQueue.value = notificationQueue.value.filter((n) => n.id !== id)
  }

  onMounted(() => {
    connect()
  })

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    isConnected,
    statusUpdate,
    scheduleUpdate,
    analyticsUpdate,
    notificationQueue,
    connect,
    disconnect,
    emit,
    requestStatusUpdate,
    requestScheduleUpdate,
    requestAnalyticsUpdate,
    dismissNotification,
  }
}
