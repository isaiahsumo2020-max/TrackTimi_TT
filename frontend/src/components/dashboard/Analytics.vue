<template>
  <div class="space-y-10">
    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
      <div class="flex items-center justify-center space-x-2">
        <div class="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
        <p class="text-sm font-bold text-slate-600">Loading analytics data...</p>
      </div>
    </div>

    <template v-else>
    <!-- Header with Filters -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <h3 class="text-2xl font-black text-primary-600 mb-2">Analytics & Reports</h3>
        <p class="text-sm text-slate-500">Track attendance patterns, trends, and system performance</p>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <select 
          v-model="filters.dateRange"
          @change="onFilterChange"
          class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="custom">Custom Range</option>
        </select>

        <button 
          @click="exportReport"
          class="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-primary-700 transition-all disabled:opacity-50"
          :disabled="loading"
        >
          <DownloadIcon class="w-4 h-4 inline mr-2" />
          {{ loading ? 'Loading...' : 'Export' }}
        </button>
      </div>
    </div>

    <!-- Key Metrics Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-xs font-black text-slate-500 uppercase tracking-widest">Avg Check-in Rate</h4>
          <TrendingUpIcon class="w-5 h-5 text-blue-500" />
        </div>
        <p class="text-3xl font-black text-primary-600">{{ metrics.avgAttendanceRate }}%</p>
        <p class="text-xs text-slate-500 mt-2">{{ getDaysValue() }}-day average</p>
      </div>

      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-xs font-black text-slate-500 uppercase tracking-widest">Total Check-ins</h4>
          <UsersIcon class="w-5 h-5 text-accent-500" />
        </div>
        <p class="text-3xl font-black text-accent-600">{{ metrics.totalCheckIns }}</p>
        <p class="text-xs text-slate-500 mt-2">Last {{ getDaysValue() }} days</p>
      </div>

      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-xs font-black text-slate-500 uppercase tracking-widest">Avg Session Time</h4>
          <ClockIcon class="w-5 h-5 text-primary-500" />
        </div>
        <p class="text-3xl font-black text-primary-600">{{ (metrics.totalCheckIns / metrics.totalEmployees / getDaysValue()).toFixed(1) }}h</p>
        <p class="text-xs text-slate-500 mt-2">Per employee daily</p>
      </div>

      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-xs font-black text-slate-500 uppercase tracking-widest">Absent Today</h4>
          <AlertCircleIcon class="w-5 h-5 text-red-500" />
        </div>
        <p class="text-3xl font-black text-red-500">{{ metrics.absentCount }}</p>
        <p class="text-xs text-slate-500 mt-2">Out of {{ metrics.totalEmployees }}</p>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Check-in Trend Chart -->
      <div class="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-8">
        <h3 class="text-lg font-black text-primary-600 mb-6">Check-in Trends (Last {{ getDaysValue() }} Days)</h3>
        <div class="w-full h-64 flex items-end justify-between gap-2">
          <div v-for="(day, idx) in checkInTrends" :key="idx" class="flex-1 flex flex-col items-center" style="min-width: 0">
            <div class="w-full flex flex-col items-center justify-end" style="height: 200px">
              <div 
                class="w-full bg-gradient-to-t from-[#FF6B35] to-[#FFB84A] rounded-t-lg transition-all hover:shadow-lg hover:from-[#E55A25] cursor-pointer"
                :style="{ height: Math.max((day.value / 100) * 180, 10) + 'px' }"
                :title="`${day.day}: ${day.value}%`"
              ></div>
            </div>
            <p class="text-xs font-bold text-slate-600 mt-2 text-center truncate w-full">{{ day.day }}</p>
            <p class="text-xs font-black text-[#FF6B35]">{{ day.value }}%</p>
          </div>
        </div>
      </div>

      <!-- Department Distribution -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
        <h3 class="text-lg font-black text-primary-600 mb-6">By Department</h3>
        <div class="space-y-4">
          <div v-for="dept in departmentDistribution" :key="dept.name" class="flex items-center gap-3">
            <div 
              class="h-3 rounded-full"
              :style="{ width: dept.percentage + '%', backgroundColor: dept.color }"
            ></div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-slate-700 truncate">{{ dept.name }}</p>
              <p class="text-xs text-slate-500">{{ dept.count }} employees</p>
            </div>
            <p class="text-sm font-black text-slate-700">{{ dept.percentage }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Patterns Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-black text-primary-600">Attendance Details</h3>
        <div class="flex gap-2">
          <button 
            @click="sortBy = 'name'"
            :class="sortBy === 'name' ? 'bg-[#FF6B35] text-white' : 'bg-slate-100 text-slate-700'"
            class="px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all"
          >
            By Name
          </button>
          <button 
            @click="sortBy = 'attendance'"
            :class="sortBy === 'attendance' ? 'bg-[#FF6B35] text-white' : 'bg-slate-100 text-slate-700'"
            class="px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all"
          >
            By Rate
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="px-6 py-3 text-left text-xs font-black text-slate-700 uppercase">Employee</th>
              <th class="px-6 py-3 text-left text-xs font-black text-slate-700 uppercase">Department</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Check-ins</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Attendance Rate</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-if="sortedAttendance.length === 0" class="hover:bg-slate-50">
              <td colspan="5" class="px-6 py-8 text-center">
                <p class="text-sm font-bold text-slate-500">No attendance data available for the selected period</p>
              </td>
            </tr>
            <tr v-for="(emp, idx) in sortedAttendance.slice(0, 10)" :key="emp.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-black text-xs">
                    {{ emp.initials }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900">{{ emp.name }}</p>
                    <p class="text-xs text-slate-500">ID: {{ emp.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-bold text-slate-700">{{ emp.department }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <p class="text-sm font-black text-slate-900">{{ emp.checkIns }}</p>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all"
                      :class="emp.attendanceRate >= 85 ? 'bg-blue-500' : emp.attendanceRate >= 70 ? 'bg-accent-500' : 'bg-red-500'"
                      :style="{ width: emp.attendanceRate + '%' }"
                    ></div>
                  </div>
                  <p class="text-sm font-black text-slate-900 w-12 text-right">{{ emp.attendanceRate }}%</p>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-3 py-1 rounded-full text-xs font-black uppercase"
                  :class="emp.status === 'on-time' 
                    ? 'bg-primary-100/50 text-primary-600' 
                    : emp.status === 'late' 
                    ? 'bg-[#FF6B35]/20 text-[#FF6B35]'
                    : 'bg-red-100 text-red-700'"
                >
                  {{ emp.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
        <p class="text-xs font-bold text-slate-600">Showing 1-{{ Math.min(10, sortedAttendance.length) }} of {{ sortedAttendance.length }} records</p>
        <div class="flex gap-2">
          <button class="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50">← Previous</button>
          <button class="px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-xs font-bold">1</button>
          <button v-if="sortedAttendance.length > 10" class="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50">2</button>
          <button v-if="sortedAttendance.length > 20" class="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50">3</button>
          <button v-if="sortedAttendance.length > 10" class="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50">Next →</button>
        </div>
      </div>
    </div>

    <!-- Summary Report -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg border border-primary-700 shadow-lg p-8 text-white">
        <h3 class="text-lg font-black mb-6 flex items-center">
          <BarChart3Icon class="w-5 h-5 mr-3" />
          Performance Summary
        </h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center pb-3 border-b border-white/20">
            <span class="text-sm font-bold">Total Check-ins ({{ getDaysValue() }} days)</span>
            <span class="text-2xl font-black">{{ metrics.totalCheckIns }}</span>
          </div>
          <div class="flex justify-between items-center pb-3 border-b border-white/20">
            <span class="text-sm font-bold">Average Daily Check-ins</span>
            <span class="text-2xl font-black">{{ Math.round(metrics.totalCheckIns / getDaysValue()) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-bold">Total Employees</span>
            <span class="text-2xl font-black">{{ metrics.totalEmployees }}</span>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg border border-accent-600 shadow-lg p-8 text-white">
        <h3 class="text-lg font-black mb-6 flex items-center">
          <AlertCircleIcon class="w-5 h-5 mr-3" />
          Alerts & Issues
        </h3>
        <div class="space-y-3">
          <div class="bg-white/20 rounded-lg p-3" v-for="(alert, idx) in alerts" :key="idx">
            <p class="text-sm font-bold">{{ alert.title }}</p>
            <p class="text-xs opacity-90 mt-1">{{ alert.message }}</p>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAttendanceAnalytics, getEmployeeAnalytics, getDashboard } from '@/services/superadminApi'
import {
  TrendingUpIcon, UsersIcon, ClockIcon, AlertCircleIcon,
  DownloadIcon, BarChart3Icon
} from 'lucide-vue-next'

const filters = ref({
  dateRange: '7days'
})

const sortBy = ref('name')
const loading = ref(true)

const metrics = ref({
  totalCheckIns: 0,
  absentCount: 0,
  totalEmployees: 0,
  avgAttendanceRate: 82.5
})

const checkInTrends = ref([
  { day: 'Mon', value: 92 },
  { day: 'Tue', value: 88 },
  { day: 'Wed', value: 85 },
  { day: 'Thu', value: 90 },
  { day: 'Fri', value: 83 },
  { day: 'Sat', value: 45 },
  { day: 'Sun', value: 35 }
])

const departmentDistribution = ref([
  { name: 'Engineering', count: 45, percentage: 29, color: '#0ea5e9' },
  { name: 'Sales', count: 38, percentage: 24, color: '#FF6B35' },
  { name: 'HR', count: 22, percentage: 14, color: '#f97316' },
  { name: 'Support', count: 28, percentage: 18, color: '#60A5FA' },
  { name: 'Management', count: 23, percentage: 15, color: '#F59E0B' }
])

const attendanceData = ref([])

const alerts = ref([
  { title: 'Low Attendance Warning', message: '5 employees below 80% attendance threshold' },
  { title: 'System Maintenance', message: 'Geofence sync scheduled for 2:00 AM' },
  { title: 'High Absence Rate', message: 'Support department at 15% absence today' }
])

// Get days value from filter
const getDaysValue = () => {
  switch (filters.value.dateRange) {
    case '7days': return 7
    case '30days': return 30
    case '90days': return 90
    default: return 7
  }
}

// Fetch analytics data from API
const fetchAnalyticsData = async () => {
  loading.value = true
  try {
    const days = getDaysValue()
    
    // Fetch attendance analytics (trends and department breakdown)
    try {
      const attendanceRes = await getAttendanceAnalytics(days)
      const data = attendanceRes.data || {}
      
      // Process attendance data
      if (data.attendance && Array.isArray(data.attendance) && data.attendance.length > 0) {
        const attendanceByDate = {}
        
        // Group by date and sum totals
        data.attendance.forEach(item => {
          attendanceByDate[item.date] = {
            checkins: item.total_checkins,
            users: item.unique_users
          }
        })
        
        // Create trends for last 7 days
        const today = new Date()
        const trends = []
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          const dayName = dayLabels[date.getDay()]
          
          const dayData = attendanceByDate[dateStr]
          const percentage = dayData 
            ? Math.round((dayData.checkins / Math.max(dayData.users, 1)) * 100)
            : 0
          
          trends.push({
            day: dayName,
            value: Math.min(percentage, 100)
          })
        }
        
        checkInTrends.value = trends
        
        // Update total check-ins metric
        metrics.value.totalCheckIns = data.attendance.reduce((sum, item) => sum + item.total_checkins, 0)
      }
      
      // Process department breakdown
      if (data.departmentBreakdown && Array.isArray(data.departmentBreakdown) && data.departmentBreakdown.length > 0) {
        const colors = ['#0ea5e9', '#f97316', '#22c55e', '#ec4899', '#f59e0b']
        const totalCheckins = data.departmentBreakdown.reduce((sum, d) => sum + d.checkins, 0)
        
        departmentDistribution.value = data.departmentBreakdown.map((dept, idx) => ({
          name: dept.Depart_Name || dept.depart_name || 'Unknown',
          count: dept.users || 0,
          percentage: totalCheckins > 0 ? Math.round((dept.checkins / totalCheckins) * 100) : 0,
          color: colors[idx % colors.length]
        }))
      }
    } catch (error) {
      console.error('Attendance analytics fetch error:', error)
    }

    // Fetch employee attendance details
    try {
      const employeeRes = await getEmployeeAnalytics(days)
      const data = employeeRes.data || {}
      
      if (data.employees && Array.isArray(data.employees)) {
        attendanceData.value = data.employees.map(emp => ({
          id: emp.id || emp.User_ID || 'N/A',
          name: emp.name || `${emp.First_Name} ${emp.SurName}` || 'Unknown',
          initials: emp.initials || ((emp.name || 'U').charAt(0) + ((emp.name || 'U').split(' ')[1] || 'N').charAt(0)).toUpperCase(),
          department: emp.department || emp.Depart_Name || 'Unassigned',
          checkIns: emp.checkIns || emp.checkins || 0,
          attendanceRate: Math.max(0, Math.min(100, Math.round(emp.attendanceRate || 0))),
          status: emp.status || 'absent'
        }))

        // Calculate metrics
        metrics.value.totalEmployees = data.employees.length
        metrics.value.absentCount = data.employees.filter(e => e.status === 'absent').length
        
        const validRates = data.employees
          .filter(e => e.attendanceRate && !isNaN(e.attendanceRate))
          .map(e => e.attendanceRate)
        
        if (validRates.length > 0) {
          const avgRate = validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length
          metrics.value.avgAttendanceRate = Math.round(avgRate * 10) / 10
        }
      }
    } catch (error) {
      console.error('Employee analytics fetch error:', error)
    }

    // Fetch dashboard data for total employees reference
    try {
      const dashRes = await getDashboard()
      if (dashRes.data?.stats) {
        const stats = dashRes.data.stats
        if (stats.totalUsers && !attendanceData.value.length) {
          metrics.value.totalEmployees = stats.totalUsers
        }
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
    }

  } catch (error) {
    console.error('Failed to fetch analytics:', error)
  } finally {
    loading.value = false
  }
}

const sortedAttendance = computed(() => {
  if (sortBy.value === 'attendance') {
    return [...attendanceData.value].sort((a, b) => b.attendanceRate - a.attendanceRate)
  }
  return [...attendanceData.value].sort((a, b) => a.name.localeCompare(b.name))
})

const exportReport = () => {
  alert('Report exported as CSV! (Download functionality would be implemented here)')
  console.log('Exporting analytics report...')
}

// Watch for filter changes and reload data
const onFilterChange = () => {
  fetchAnalyticsData()
}

// Lifecycle
onMounted(() => {
  fetchAnalyticsData()
})

</script>

<style scoped>
table {
  width: 100%;
}
</style>
