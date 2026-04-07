import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import io from 'socket.io-client'

/**
 * Composable for real-time dashboard metrics
 * Handles organization stats, employee status, attendance analytics, and more
 * Works seamlessly with both Employee and Organization dashboards
 */
export function useDashboardMetrics(options = {}) {
  const { 
    orgId = null, 
    userId = null, 
    dashboardType = 'employee' // 'employee' | 'organization' | 'superadmin'
  } = options

  // Connection state
  const socket = ref(null)
  const isConnected = ref(false)

  // Org Dashboard Metrics
  const orgMetrics = ref({
    totalEmployees: 0,
    checkedInToday: 0,
    attendanceRate: 0,
    avgHoursWorked: 0,
    departmentCount: 0,
    activeShifts: 0,
    pendingApprovals: 0,
    updatedAt: null
  })

  // Employee Dashboard Metrics
  const employeeMetrics = ref({
    hoursWorkedToday: 0,
    checkedIn: false,
    lastCheckInTime: null,
    upcomingShift: null,
    weeklyHours: 0,
    monthlyHours: 0,
    attendanceRate: 0,
    onTimeRate: 0,
    updatedAt: null
  })

  // Analytics Metrics (Real-time)
  const analyticsMetrics = ref({
    avgHoursPerDay: 8,
    totalMonthHours: 0,
    checkInRate: 95,
    onTimeRate: 98,
    weeklyActivity: [],
    targetMonthHours: 160,
    updatedAt: null
  })

  // SuperAdmin Dashboard Metrics
  const superadminMetrics = ref({
    totalOrganizations: 0,
    totalUsers: 0,
    todayCheckins: 0,
    activeOrganizations: 0,
    systemHealth: 100,
    dbLoad: 0,
    updatedAt: null
  })

  // Live updates stream
  const metricUpdates = ref([])
  const alerts = ref([])

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  /**
   * Initialize WebSocket connection with auto-reconnect
   */
  const connect = () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken')
      
      socket.value = io(API_URL, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        transports: ['websocket', 'polling']
      })

      // Join org room if provided
      if (orgId) {
        socket.value.on('connect', () => {
          socket.value.emit('joinOrg', orgId)
        })
      }

      // Connection events
      socket.value.on('connect', () => {
        isConnected.value = true
        console.log('✅ Dashboard metrics connected')
      })

      socket.value.on('disconnect', () => {
        isConnected.value = false
        console.log('❌ Dashboard metrics disconnected')
      })

      socket.value.on('connect_error', (error) => {
        console.error('📡 Connection error:', error)
      })

      // ===== ORGANIZATION DASHBOARD EVENTS =====
      socket.value.on('dashboard:orgMetrics', (data) => {
        orgMetrics.value = {
          ...orgMetrics.value,
          ...data,
          updatedAt: new Date().toISOString()
        }
        queueMetricUpdate('orgMetrics', data)
      })

      socket.value.on('dashboard:employeeStatus', (data) => {
        // Update org dashboard with employee status changes
        addAlert({
          type: 'employee-status',
          message: data.message,
          severity: 'info',
          timestamp: new Date()
        })
        queueMetricUpdate('employeeStatus', data)
      })

      socket.value.on('dashboard:attendanceUpdate', (data) => {
        // Real-time attendance updates
        orgMetrics.value.checkedInToday = data.checkedInCount
        orgMetrics.value.attendanceRate = data.attendanceRate
        queueMetricUpdate('attendance', data)
      })

      socket.value.on('dashboard:departmentMetrics', (data) => {
        // Department-level metrics
        queueMetricUpdate('departmentMetrics', data)
      })

      // ===== EMPLOYEE DASHBOARD EVENTS =====
      socket.value.on('dashboard:employeeMetrics', (data) => {
        employeeMetrics.value = {
          ...employeeMetrics.value,
          ...data,
          updatedAt: new Date().toISOString()
        }
        queueMetricUpdate('employeeMetrics', data)
      })

      socket.value.on('dashboard:hoursTracking', (data) => {
        employeeMetrics.value.hoursWorkedToday = data.todayHours
        employeeMetrics.value.weeklyHours = data.weeklyHours
        employeeMetrics.value.monthlyHours = data.monthlyHours
        queueMetricUpdate('hoursTracking', data)
      })

      socket.value.on('dashboard:analyticsUpdate', (data) => {
        analyticsMetrics.value = {
          ...analyticsMetrics.value,
          ...data,
          updatedAt: new Date().toISOString()
        }
        queueMetricUpdate('analyticsUpdate', data)
      })

      socket.value.on('dashboard:checkinStatus', (data) => {
        employeeMetrics.value.checkedIn = data.checkedIn
        employeeMetrics.value.lastCheckInTime = data.lastCheckInTime
        queueMetricUpdate('checkinStatus', data)
      })

      socket.value.on('dashboard:scheduleUpdate', (data) => {
        employeeMetrics.value.upcomingShift = data.shift
        queueMetricUpdate('scheduleUpdate', data)
      })

      // ===== SUPERADMIN DASHBOARD EVENTS =====
      socket.value.on('dashboard:systemMetrics', (data) => {
        superadminMetrics.value = {
          ...superadminMetrics.value,
          ...data,
          updatedAt: new Date().toISOString()
        }
        queueMetricUpdate('systemMetrics', data)
      })

      socket.value.on('dashboard:systemAlert', (data) => {
        addAlert({
          type: data.type || 'system',
          message: data.message,
          severity: data.severity || 'warning',
          timestamp: new Date()
        })
        queueMetricUpdate('systemAlert', data)
      })

      // ===== SHARED EVENTS =====
      socket.value.on('dashboard:notification', (data) => {
        addAlert({
          type: 'notification',
          message: data.message,
          severity: data.severity || 'info',
          timestamp: new Date()
        })
      })

      socket.value.on('dashboard:error', (data) => {
        addAlert({
          type: 'error',
          message: data.message,
          severity: 'error',
          timestamp: new Date()
        })
      })
    } catch (error) {
      console.error('Failed to connect dashboard metrics:', error)
    }
  }

  /**
   * Queue metric update for batch processing
   */
  const queueMetricUpdate = (type, data) => {
    metricUpdates.value.push({
      type,
      data,
      timestamp: new Date(),
      id: `${type}-${Date.now()}`
    })

    // Keep only last 50 updates
    if (metricUpdates.value.length > 50) {
      metricUpdates.value.shift()
    }
  }

  /**
   * Add alert to alerts queue
   */
  const addAlert = (alert) => {
    alerts.value.unshift({
      id: `alert-${Date.now()}`,
      ...alert
    })

    // Keep only last 20 alerts
    if (alerts.value.length > 20) {
      alerts.value.pop()
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
      alerts.value = alerts.value.filter(a => a.id !== alert.id)
    }, 5000)
  }

  /**
   * Request immediate metric refresh from server
   */
  const requestMetricsRefresh = (type = 'all') => {
    if (socket.value && isConnected.value) {
      socket.value.emit('dashboard:requestMetrics', { type })
    }
  }

  /**
   * Request specific metric update
   */
  const requestOrgMetrics = () => {
    requestMetricsRefresh('orgMetrics')
  }

  const requestEmployeeMetrics = () => {
    requestMetricsRefresh('employeeMetrics')
  }

  const requestSystemMetrics = () => {
    requestMetricsRefresh('systemMetrics')
  }

  const requestAnalyticsMetrics = () => {
    requestMetricsRefresh('analyticsMetrics')
  }

  /**
   * Disconnect from socket
   */
  const disconnect = () => {
    if (socket.value) {
      if (orgId) {
        socket.value.emit('leaveOrg', orgId)
      }
      socket.value.disconnect()
      isConnected.value = false
    }
  }

  /**
   * Emit custom event to server
   */
  const emit = (event, data) => {
    if (socket.value && isConnected.value) {
      socket.value.emit(event, data)
    }
  }

  /**
   * Computed: Get latest update by type
   */
  const getLatestUpdate = (type) => {
    return metricUpdates.value
      .reverse()
      .find(u => u.type === type)
  }

  /**
   * Computed: Get unread alerts
   */
  const unreadAlerts = computed(() => alerts.value)

  /**
   * Clear alerts
   */
  const clearAlerts = () => {
    alerts.value = []
  }

  /**
   * Lifecycle hooks
   */
  onMounted(() => {
    connect()
  })

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    // State
    isConnected,
    orgMetrics,
    employeeMetrics,
    analyticsMetrics,
    superadminMetrics,
    metricUpdates,
    alerts,
    unreadAlerts,

    // Methods
    connect,
    disconnect,
    requestMetricsRefresh,
    requestOrgMetrics,
    requestEmployeeMetrics,
    requestAnalyticsMetrics,
    requestSystemMetrics,
    emit,
    getLatestUpdate,
    clearAlerts,
    addAlert,
    queueMetricUpdate
  }
}
