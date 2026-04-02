<template>
  <div class="flex h-screen bg-[#F5F7FA] font-sans overflow-hidden">
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
        @refresh="refreshData"
        @logout="handleLogout"
        @open-settings="showSettings = true"
      />

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="p-10 space-y-10">
          
          <!-- OVERVIEW SECTION -->
          <div v-show="activeSection === 'dashboard'" class="animate-in space-y-10">
            <h2 class="text-3xl font-black text-[#1B8B3C]">Dashboard</h2>
            
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
              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h3 class="text-xs font-black text-[#1B8B3C] uppercase tracking-widest mb-8 flex items-center">
                  <UsersIcon class="w-4 h-4 mr-2" /> Active Users
                </h3>
                <p class="text-4xl font-black text-[#000000] mb-3">{{ metrics.totalUsers }}</p>
                <div class="flex items-center space-x-2 text-[9px] font-black text-[#1B8B3C] uppercase tracking-widest">
                  <TrendingUpIcon class="w-3 h-3" />
                  <span>+12% from last week</span>
                </div>
              </div>

              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h3 class="text-xs font-black text-[#FF6B35] uppercase tracking-widest mb-8 flex items-center">
                  <CheckCircleIcon class="w-4 h-4 mr-2" /> Today's Check-ins
                </h3>
                <p class="text-4xl font-black text-[#000000] mb-3">{{ metrics.todayCheckins }}</p>
                <div class="flex items-center space-x-2 text-[9px] font-black text-[#FF6B35] uppercase tracking-widest">
                  <TrendingUpIcon class="w-3 h-3" />
                  <span>{{ densityScore }}% attendance rate</span>
                </div>
              </div>

              <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h3 class="text-xs font-black text-indigo-600 uppercase tracking-widest mb-8 flex items-center">
                  <ActivityIcon class="w-4 h-4 mr-2" /> System Uptime
                </h3>
                <p class="text-4xl font-black text-[#000000] mb-3">99.9%</p>
                <div class="flex items-center space-x-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest">
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
            <h2 class="text-3xl font-black text-[#1B8B3C]">System Status</h2>
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
            <h2 class="text-3xl font-black text-[#1B8B3C]">Departments</h2>
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <p class="text-slate-500">Departments component will be displayed here</p>
            </div>
          </div>

          <!-- ATTENDANCE SECTION -->
          <div v-show="activeSection === 'attendance'" class="animate-in space-y-10">
            <h2 class="text-3xl font-black text-[#1B8B3C]">Attendance Tracking</h2>
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <p class="text-slate-500">Attendance component will be displayed here</p>
            </div>
          </div>

          <!-- GEOFENCES SECTION -->
          <div v-show="activeSection === 'geofences'" class="animate-in space-y-10">
            <h2 class="text-3xl font-black text-[#1B8B3C]">Geofences</h2>
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <p class="text-slate-500">Geofences component will be displayed here</p>
            </div>
          </div>

          <!-- ALERTS SECTION -->
          <div v-show="activeSection === 'alerts'" class="animate-in space-y-10">
            <h2 class="text-3xl font-black text-[#1B8B3C]">Alerts</h2>
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <p class="text-slate-500">Alerts component will be displayed here</p>
            </div>
          </div>

          <!-- AUDIT LOGS SECTION -->
          <div v-show="activeSection === 'audit-logs'" class="animate-in space-y-10">
            <h2 class="text-3xl font-black text-[#1B8B3C]">Audit Logs</h2>
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <p class="text-slate-500">Audit Logs component will be displayed here</p>
            </div>
          </div>

          <!-- SYSTEM CONFIG SECTION -->
          <div v-show="activeSection === 'system-config'" class="animate-in space-y-10">
            <h2 class="text-3xl font-black text-[#1B8B3C]">System Configuration</h2>
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <p class="text-slate-500">System Configuration component will be displayed here</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboard, getOrganizations } from '@/services/superadminApi'
import Sidebar from '@/components/dashboard/Sidebar.vue'
import HeaderBar from '@/components/dashboard/HeaderBar.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import RecentOrganizations from '@/components/dashboard/RecentOrganizations.vue'
import SystemStatus from '@/components/dashboard/SystemStatus.vue'
import Analytics from '@/components/dashboard/Analytics.vue'
import Organizations from '@/components/dashboard/Organizations.vue'
import UsersManagement from '@/components/dashboard/UsersManagement.vue'
import {
  BuildingIcon, UsersIcon, ClockIcon, BarChart3Icon,
  TrendingUpIcon, CheckCircleIcon, ActivityIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)
const showSettings = ref(false)
const activeSection = ref('dashboard')

// Data State
const metrics = ref({ totalOrgs: 0, totalUsers: 0, todayCheckins: 0, totalDepts: 0 })
const organizationsList = ref([])

// Computed Properties
const densityScore = computed(() => {
  if (metrics.value.totalUsers === 0) return 0
  return Math.round((metrics.value.todayCheckins / metrics.value.totalUsers) * 100)
})

const dbLoad = computed(() => {
  return Math.random() * 60 + 20 // Simulated DB load between 20-80%
})

const stats = computed(() => [
  {
    label: 'Organizations',
    value: metrics.value.totalOrgs,
    icon: BuildingIcon,
    color: '#1B8B3C',
    trend: 8
  },
  {
    label: 'Total Users',
    value: metrics.value.totalUsers,
    icon: UsersIcon,
    color: '#FF6B35',
    trend: 12
  },
  {
    label: 'Check-ins Today',
    value: metrics.value.todayCheckins,
    icon: ClockIcon,
    color: '#4ADE80',
    trend: -3
  },
  {
    label: 'Departments',
    value: metrics.value.totalDepts,
    icon: BarChart3Icon,
    color: '#60A5FA',
    trend: 5
  }
])

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    // Fetch Live Dashboard Stats
    const statsRes = await getDashboard()
    metrics.value = statsRes.data?.stats || metrics.value

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

// Lifecycle
onMounted(refreshData)
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