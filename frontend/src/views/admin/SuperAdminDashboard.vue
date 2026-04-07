<template>
  <div class="flex h-screen bg-slate-50 font-sans overflow-hidden">
    <!-- Settings Modal -->
    <SettingsModal
      :isOpen="showSettings"
      @close="showSettings = false"
    />

    <!-- Real-time Notifications (Toast) -->
    <RealtimeNotifications 
      :notifications="displayNotifications"
      @dismiss="dismissNotification"
    />

    <!-- Notification Panel (Modal) -->
    <NotificationPanel
      :isOpen="showNotificationPanel"
      :notifications="notifications"
      :unreadCount="unreadCount"
      @close="showNotificationPanel = false"
      @mark-as-read="markNotificationAsRead"
      @delete="deleteNotification"
      @mark-all-read="markAllAsRead"
    />

    <!-- Sidebar -->
    <Sidebar 
      :open="sidebarOpen" 
      :activeSection="activeSection"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @select-section="activeSection = $event"
    />

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <HeaderBar 
        :loading="loading"
        :unreadCount="unreadCount"
        @refresh="refreshData"
        @logout="handleLogout"
        @notifications="showNotificationPanel = true"
        @open-settings="showSettings = true"
      />

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="p-10 space-y-10">
          
          <!-- OVERVIEW SECTION -->
          <div v-show="activeSection === 'dashboard'" class="animate-in space-y-10">
            <h2 class="text-3xl font-black text-primary-600">Dashboard</h2>
            
            <!-- Metric Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                v-for="stat in stats"
                :key="stat.label"
                :icon="stat.icon"
                :label="stat.label"
                :value="stat.value"
                :color="stat.color"
                :trend="stat.trend"
              />
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2">
                <RecentOrganizations :organizations="organizationsList" />
              </div>
              <SystemStatus 
                :checkInRate="densityScore"
                :serverStatus="99.9"
                :dbLoad="dbLoad"
                :connections="`${organizationsList.length}K+`"
              />
            </div>

            <!-- Secondary Analytics row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
                <h3 class="text-xs font-black text-primary-600 uppercase tracking-widest mb-8 flex items-center">
                  <UsersIcon class="w-4 h-4 mr-2" /> Active Users
                </h3>
                <p class="text-4xl font-black text-slate-900 mb-3">{{ metrics.totalUsers }}</p>
                <div class="flex items-center space-x-2 text-[9px] font-black text-primary-600 uppercase tracking-widest">
                  <TrendingUpIcon class="w-3 h-3" />
                  <span>+12% from last week</span>
                </div>
              </div>

              <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
                <h3 class="text-xs font-black text-accent-600 uppercase tracking-widest mb-8 flex items-center">
                  <CheckCircleIcon class="w-4 h-4 mr-2" /> Today's Check-ins
                </h3>
                <p class="text-4xl font-black text-slate-900 mb-3">{{ metrics.todayCheckins }}</p>
                <div class="flex items-center space-x-2 text-[9px] font-black text-accent-600 uppercase tracking-widest">
                  <TrendingUpIcon class="w-3 h-3" />
                  <span>{{ densityScore }}% attendance rate</span>
                </div>
              </div>

              <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
                <h3 class="text-xs font-black text-primary-600 uppercase tracking-widest mb-8 flex items-center">
                  <ActivityIcon class="w-4 h-4 mr-2" /> System Uptime
                </h3>
                <p class="text-4xl font-black text-slate-900 mb-3">99.9%</p>
                <div class="flex items-center space-x-2 text-[9px] font-black text-primary-600 uppercase tracking-widest">
                  <CheckCircleIcon class="w-3 h-3" />
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ANALYTICS SECTION -->
          <div v-if="activeSection === 'analytics'" class="animate-in">
            <Analytics />
          </div>

          <!-- SYSTEM STATUS SECTION -->
          <div v-if="activeSection === 'system-status'" class="animate-in space-y-10">
            <h2 class="text-3xl font-black text-primary-600">System Status</h2>
            <SystemStatus 
              :checkInRate="densityScore"
              :serverStatus="99.9"
              :dbLoad="dbLoad"
              :connections="`${organizationsList.length}K+`"
            />
          </div>

          <!-- ORGANIZATIONS SECTION -->
          <div v-show="activeSection === 'organizations'" class="animate-in">
            <Organizations />
          </div>

          <!-- USERS SECTION -->
          <div v-show="activeSection === 'users'" class="animate-in space-y-10">
            <UsersManagement />
          </div>

          <!-- DEPARTMENTS SECTION -->
          <div v-show="activeSection === 'departments'" class="animate-in space-y-10">
            <h2 class="text-3xl font-black text-primary-600">Departments</h2>
            <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
              <p class="text-slate-500">Departments component will be displayed here</p>
            </div>
          </div>

          <!-- ATTENDANCE SECTION -->
          <div v-show="activeSection === 'attendance'" class="animate-in space-y-10">
            <h2 class="text-3xl font-black text-primary-600">Attendance Tracking</h2>
            <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
              <p class="text-slate-500">Attendance component will be displayed here</p>
            </div>
          </div>

          <!-- GEOFENCES SECTION -->
          <div v-show="activeSection === 'geofences'" class="animate-in space-y-10">
            <Geofences />
          </div>

          <!-- ALERTS SECTION -->
          <div v-show="activeSection === 'alerts'" class="animate-in">
            <Alerts />
          </div>

          <!-- AUDIT LOGS SECTION -->
          <div v-show="activeSection === 'audit-logs'" class="animate-in">
            <AuditLogs />
          </div>

          <!-- FEEDBACK SECTION -->
          <div v-show="activeSection === 'feedback'" class="animate-in">
            <FeedbackManagement />
          </div>

          <!-- SYSTEM CONFIG SECTION -->
          <div v-show="activeSection === 'system-config'" class="animate-in">
            <SystemConfiguration />
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import io from 'socket.io-client'
import { getDashboard, getOrganizations, getNotifications, markNotificationAsRead, getUnreadNotificationCount, deleteNotification as deleteNotifApi, markAllNotificationsAsRead } from '@/services/superadminApi'
import { useDashboardMetrics } from '@/composables/useDashboardMetrics'
import Sidebar from '@/components/dashboard/Sidebar.vue'
import HeaderBar from '@/components/dashboard/HeaderBar.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import RecentOrganizations from '@/components/dashboard/RecentOrganizations.vue'
import SystemStatus from '@/components/dashboard/SystemStatus.vue'
import Analytics from '@/components/dashboard/Analytics.vue'
import Organizations from '@/components/dashboard/Organizations.vue'
import Geofences from '@/components/dashboard/Geofences.vue'
import Alerts from '@/components/dashboard/Alerts.vue'
import AuditLogs from '@/components/dashboard/AuditLogs.vue'
import SystemConfiguration from '@/components/dashboard/SystemConfiguration.vue'
import UsersManagement from '@/components/dashboard/UsersManagement.vue'
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications.vue'
import NotificationPanel from '@/components/dashboard/NotificationPanel.vue'
import SettingsModal from '@/components/dashboard/SettingsModal.vue'
import FeedbackManagement from '@/components/dashboard/FeedbackManagement.vue'
import {
  BuildingIcon, UsersIcon, ClockIcon, BarChart3Icon,
  TrendingUpIcon, CheckCircleIcon, ActivityIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)
const showSettings = ref(false)
const showNotificationPanel = ref(false)
const activeSection = ref('dashboard')
const notifications = ref([])
const unreadCount = ref(0)
const notifRefreshInterval = ref(null)
const isRefreshingNotifications = ref(false)
const lastNotifCheck = ref(0)
const socket = ref(null)

// Real-time metrics composable (SuperAdmin/System-wide)
const { 
  superadminMetrics, 
  isConnected: metricsConnected,
  requestSystemMetrics,
  alerts: realtimeAlerts,
  clearAlerts: clearRealtimeAlerts
} = useDashboardMetrics({ dashboardType: 'superadmin' })

// Data State
const metrics = ref({ totalOrgs: 0, totalUsers: 0, todayCheckins: 0, totalDepts: 0 })
const organizationsList = ref([])

// Computed Properties
const densityScore = computed(() => {
  // Use real-time metrics when available
  const totalUsers = superadminMetrics.value.totalUsers || metrics.value.totalUsers || 0
  const checkins = superadminMetrics.value.todayCheckins || metrics.value.todayCheckins || 0
  if (totalUsers === 0) return 0
  return Math.round((checkins / totalUsers) * 100)
})

const dbLoad = computed(() => {
  return superadminMetrics.value.dbLoad || (Math.random() * 60 + 20)
})

const stats = computed(() => [
  {
    label: 'Organizations',
    value: superadminMetrics.value.totalOrganizations || metrics.value.totalOrgs,
    icon: BuildingIcon,
    color: '#0284c7', // primary-600
    trend: 8
  },
  {
    label: 'Total Users',
    value: superadminMetrics.value.totalUsers || metrics.value.totalUsers,
    icon: UsersIcon,
    color: '#ea580c', // accent-600
    trend: 12
  },
  {
    label: 'Check-ins Today',
    value: superadminMetrics.value.todayCheckins || metrics.value.todayCheckins,
    icon: ClockIcon,
    color: '#f97316', // accent-500
    trend: -3
  },
  {
    label: 'Departments',
    value: metrics.value.totalDepts,
    icon: BarChart3Icon,
    color: '#0ea5e9', // primary-500
    trend: 5
  }
])

// Computed for notifications display (unread only)
const displayNotifications = computed(() => {
  return notifications.value
    .filter(n => !n.Is_Read)
    .sort((a, b) => new Date(b.Created_at) - new Date(a.Created_at))
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    // Request real-time metrics update
    requestSystemMetrics()

    // Fetch Live Dashboard Stats from API (for initial load)
    const statsRes = await getDashboard()
    if (statsRes.data?.stats) {
      metrics.value = statsRes.data.stats
    }

    // Fetch Recent Organizations
    const orgsRes = await getOrganizations()
    organizationsList.value = orgsRes.data?.organizations || []
  } catch (error) {
    console.error('SuperAdmin Data Sync Failed:', error)
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  localStorage.removeItem('superAdminUser')
  router.push('/superadmin/login')
}

// Load notifications with real-time updates
const loadNotifications = async () => {
  try {
    // Skip if already loading
    if (isRefreshingNotifications.value) return
    
    // Skip if checked recently (debounce)
    const now = Date.now()
    if (lastNotifCheck.value && now - lastNotifCheck.value < 1000) return
    
    isRefreshingNotifications.value = true
    lastNotifCheck.value = now
    
    console.log('🔔 Loading notifications...')
    const res = await getNotifications(20)
    console.log('📧 Notifications response:', res.data)
    
    // Handle both old array response and new structured response
    if (Array.isArray(res.data)) {
      notifications.value = res.data || []
      // Get unread count separately if response is array
      const countRes = await getUnreadNotificationCount()
      unreadCount.value = countRes.data?.unreadCount || 0
    } else if (res.data?.notifications) {
      // New response structure with counts
      notifications.value = res.data.notifications || []
      unreadCount.value = res.data.unreadCount || 0
      console.log('📊 Counts:', res.data.counts)
    } else {
      notifications.value = []
      unreadCount.value = 0
    }
    
    console.log('✅ Unread count set to:', unreadCount.value)
  } catch (err) {
    console.error('❌ Failed to load notifications:', err.response?.data || err.message)
  } finally {
    isRefreshingNotifications.value = false
  }
}

// Dismiss notification (mark as read)
const dismissNotification = async (notificationId) => {
  try {
    await markNotificationAsRead(notificationId)
    notifications.value = notifications.value.map(n => 
      n.Notify_ID === notificationId ? {...n, Is_Read: 1} : n
    )
    // Decrement unread count
    if (unreadCount.value > 0) unreadCount.value--
  } catch (err) {
    console.error('Failed to dismiss notification:', err)
  }
}

// Delete notification
const deleteNotification = async (notifyId) => {
  try {
    await deleteNotifApi(notifyId)
    notifications.value = notifications.value.filter(n => n.Notify_ID !== notifyId)
  } catch (err) {
    console.error('Failed to delete notification:', err)
  }
}

// Mark all as read
const markAllAsRead = async () => {
  try {
    await markAllNotificationsAsRead()
    notifications.value = notifications.value.map(n => ({...n, Is_Read: 1}))
    unreadCount.value = 0
  } catch (err) {
    console.error('Failed to mark all as read:', err)
  }
}

// Lifecycle
onMounted(() => {
  refreshData()
  loadNotifications()

  // Set up real-time Socket.IO connection
  const token = localStorage.getItem('superAdminToken')
  socket.value = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    transports: ['websocket', 'polling']
  })

  // Listen for real-time notification events
  socket.value.on('notification:new', (notifData) => {
    console.log('📡 Real-time notification received:', notifData)
    // Add new notification to the list
    notifications.value.unshift({
      Notify_ID: notifData.Notify_ID,
      Title: notifData.title,
      Message: notifData.message,
      Type: notifData.type,
      Category: notifData.category,
      Is_Read: 0,
      Created_at: notifData.timestamp,
      Action_URL: notifData.actionUrl
    })
    // Increment unread count
    unreadCount.value++
    console.log('✅ Notification added to list, unread count:', unreadCount.value)
  })

  socket.value.on('connect', () => {
    console.log('✅ SuperAdmin Dashboard Socket.IO connected')
    // Tell server that this is a SuperAdmin connection
    socket.value.emit('userLogin', { userId: 1, role: 'SuperAdmin' })
  })

  socket.value.on('disconnect', () => {
    console.log('❌ SuperAdmin Dashboard Socket.IO disconnected')
  })

  socket.value.on('connect_error', (error) => {
    console.error('📡 Socket.IO connection error:', error)
  })

  // Refresh notifications every 2 seconds for real-time updates (with debouncing)
  notifRefreshInterval.value = setInterval(() => {
    loadNotifications()
  }, 2000)

  // Request system metrics refresh every 30 seconds if real-time is connected
  const metricsRefreshInterval = setInterval(() => {
    if (metricsConnected.value) {
      requestSystemMetrics()
    }
  }, 30000)

  // Store interval for cleanup
  const intervals = [notifRefreshInterval.value, metricsRefreshInterval]
  onBeforeUnmount(() => {
    intervals.forEach(interval => clearInterval(interval))
    // Disconnect socket
    if (socket.value) {
      socket.value.disconnect()
    }
  })
})

onBeforeUnmount(() => {
  if (notifRefreshInterval.value) {
    clearInterval(notifRefreshInterval.value)
  }
  if (socket.value) {
    socket.value.disconnect()
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.animate-in { 
  animation: slideIn 0.3s ease-out;
}
</style>