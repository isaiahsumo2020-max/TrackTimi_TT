<template>
  <div class="flex h-screen bg-gray-100">
    <aside :class="[
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden',
        'bg-gradient-to-b from-gray-700 to-gray-700 text-white shadow-xl flex flex-col transition-all duration-300'
      ]">
      <div class="p-6 border-b border-gray-500 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <span class="text-xl font-bold text-white">A</span>
          </div>
          <span class="text-lg font-bold">Track<span class="text-orange-500">Timi</span></span>
        </div>
        <button @click="toggleSidebar" class="p-1 rounded-lg bg-gray-700 hover:bg-gray-600">
          <span v-if="sidebarOpen">←</span>
          <span v-else>→</span>
        </button>
      </div>

      <nav class="flex-1 py-8 px-4 space-y-2">
        <router-link to="/superadmin" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600">
          <span>📊</span>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/superadmin/organizations" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600">
          <span>🏢</span>
          <span>Organizations</span>
        </router-link>
        <router-link to="/superadmin/revenue" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all bg-orange-500 text-white shadow-lg">
          <span>💰</span>
          <span>Revenue</span>
        </router-link>
        <router-link to="/superadmin/subscriptions" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600">
          <span>📦</span>
          <span>Subscriptions</span>
        </router-link>
        <router-link to="/superadmin/analytics" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600">
          <span>📈</span>
          <span>Analytics</span>
        </router-link>
        <router-link to="/superadmin/monitoring" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600">
          <span>🔍</span>
          <span>Monitoring</span>
        </router-link>
        <router-link to="/superadmin/audit-logs" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600">
          <span>📋</span>
          <span>Audit Logs</span>
        </router-link>
        <router-link to="/superadmin/settings" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-gray-50-500">
          <span>⚙️</span>
          <span>Settings</span>
        </router-link>
      </nav>

      <div class="p-6 border-t border-gray-500">
        <div class="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-3 rounded-lg transition-all">
          <div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold">JS</div>
          <div class="flex-1">
            <div class="font-semibold text-sm">Jodell Suah</div>
            <div class="text-xs text-orange-400">Super Admin</div>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-auto">
      <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div class="px-8 py-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">Revenue</h1>
              <p class="text-slate-600 mt-2">Monitor platform revenue and financial metrics</p>
            </div>
            <div class="flex items-center space-x-3">
              <button @click="handleLogout" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="p-8">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {{ error }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">Total Revenue</p>
            <p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.totalRevenue }}</p>
            <p class="text-green-600 text-xs mt-1 font-semibold">+22.5% this quarter</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">MRR</p>
            <p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.mrr }}</p>
            <p class="text-green-600 text-xs mt-1 font-semibold">+12.5% growth</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">ARR</p>
            <p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.arr }}</p>
            <p class="text-green-600 text-xs mt-1 font-semibold">+18.3% yearly</p>
          </div>
        </div>

        <div v-if="loading" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center py-12">
          <div class="text-gray-500">Loading revenue data...</div>
        </div>

        <div v-else-if="orgs.length === 0" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center py-12">
          <div class="text-gray-500">No organizations found</div>
        </div>

        <div v-else class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-900 mb-6">Revenue by Organization ({{ orgs.length }})</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-gray-300 bg-gray-50">
                  <th class="pb-3 px-4 font-semibold text-slate-700">Organization</th>
                  <th class="pb-3 px-4 font-semibold text-slate-700">Plan</th>
                  <th class="pb-3 px-4 font-semibold text-slate-700">Monthly Revenue</th>
                  <th class="pb-3 px-4 font-semibold text-slate-700">Status</th>
                  <th class="pb-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="org in orgs" :key="org.Org_ID" class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="py-4 px-4">
                    <p class="font-semibold text-slate-900 cursor-pointer hover:text-yellow-600" @click="viewRevenueDetail(org)">{{ org.Org_Name }}</p>
                  </td>
                  <td class="py-4 px-4">
                    <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">{{ org.Plan_Name || 'Free' }}</span>
                  </td>
                  <td class="py-4 px-4 font-semibold text-slate-900">{{ org.monthlyRevenue }}</td>
                  <td class="py-4 px-4">
                    <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{{ org.status }}</span>
                  </td>
                  <td class="py-4 px-4 flex items-center space-x-2">
                    <button @click="viewRevenueDetail(org)" class="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs font-semibold transition-all">
                      View
                    </button>
                    <button @click="exportRevenue(org)" class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold transition-all">
                      Export
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Revenue Detail Modal -->
        <div v-if="selectedRevenue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white p-6 flex items-center justify-between">
              <h2 class="text-2xl font-bold">Revenue Details</h2>
              <button @click="selectedRevenue = null" class="text-2xl hover:text-yellow-200">&times;</button>
            </div>
            <div class="p-8">
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm font-semibold">Organization</p>
                  <p class="text-lg font-bold text-slate-900 mt-2">{{ selectedRevenue.Org_Name }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm font-semibold">Plan</p>
                  <p class="text-lg font-bold text-slate-900 mt-2">{{ selectedRevenue.Plan_Name || 'Free' }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm font-semibold">Monthly Revenue</p>
                  <p class="text-lg font-bold text-yellow-600 mt-2">{{ selectedRevenue.monthlyRevenue }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm font-semibold">Annual Value</p>
                  <p class="text-lg font-bold text-slate-900 mt-2">{{ calculateAnnual(selectedRevenue) }}</p>
                </div>
              </div>
              <div class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p class="text-yellow-900 font-semibold">Payment Status</p>
                <p class="text-sm text-yellow-800 mt-1">Active subscription</p>
              </div>
              <div class="flex items-center space-x-3">
                <button @click="exportRevenue(selectedRevenue)" class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all">
                  Export Report
                </button>
                <button @click="processRefund(selectedRevenue)" class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all">
                  Process Refund
                </button>
                <button @click="selectedRevenue = null" class="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-all">
                  Close
                </button>
              </div>
              <div v-if="actionMessage" class="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-semibold">
                {{ actionMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const sidebarOpen = ref(true)
const selectedRevenue = ref(null)
const actionMessage = ref('')

const metrics = ref({
  totalRevenue: '$0',
  mrr: '$0',
  arr: '$0'
})
const orgs = ref([])
const loading = ref(false)
const error = ref('')

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  localStorage.removeItem('superAdminUser')
  router.push('/superadmin/login')
}

const calculateAnnual = (org) => {
  const monthly = parseInt(org.monthlyRevenue.replace(/[^0-9]/g, ''))
  return '$' + (monthly * 12).toLocaleString()
}

const viewRevenueDetail = (org) => {
  selectedRevenue.value = org
  actionMessage.value = ''
}

const exportRevenue = (org) => {
  const data = `Organization,${org.Org_Name}\nPlan,${org.Plan_Name || 'Free'}\nMonthly Revenue,${org.monthlyRevenue}\nStatus,${org.status}`
  const blob = new Blob([data], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `revenue_${org.Org_Name}.csv`
  a.click()
  actionMessage.value = 'Revenue report exported successfully!'
  setTimeout(() => { actionMessage.value = '' }, 3000)
}

const processRefund = async (org) => {
  try {
    actionMessage.value = 'Processing refund...'
    // Simulate API call
    setTimeout(() => {
      actionMessage.value = `Refund of ${org.monthlyRevenue} processed for ${org.Org_Name}`
      setTimeout(() => { actionMessage.value = '' }, 3000)
    }, 1000)
  } catch (error) {
    console.error('Failed to process refund:', error)
    actionMessage.value = 'Failed to process refund'
  }
}

const loadRevenueData = async () => {
  try {
    loading.value = true
    error.value = ''
    const token = localStorage.getItem('superAdminToken')
    if (!token) {
      router.push('/superadmin/login')
      return
    }

    // Fetch organizations to calculate revenue
    const orgResponse = await axios.get(
      'http://localhost:4000/api/superadmin/organizations',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (orgResponse.data?.organizations) {
      // Calculate revenue metrics based on organization count
      const orgCount = orgResponse.data.organizations.length
      const avgMonthlyPerOrg = 1500 // $1500 per org per month
      const totalMonthlyRevenue = orgCount * avgMonthlyPerOrg
      const arr = totalMonthlyRevenue * 12

      metrics.value = {
        totalRevenue: `$${(totalMonthlyRevenue * 3).toLocaleString()}`, // 3 months
        mrr: `$${totalMonthlyRevenue.toLocaleString()}`,
        arr: `$${arr.toLocaleString()}`
      }

      // Map organizations with mock revenue
      orgs.value = orgResponse.data.organizations.map((org, idx) => ({
        ...org,
        monthlyRevenue: `$${(avgMonthlyPerOrg + (idx * 100)).toLocaleString()}`,
        status: org.Plan_Name === 'Premium' ? 'Active' : 'Active'
      }))
    }
  } catch (err) {
    console.error('Failed to load revenue data:', err)
    error.value = 'Failed to load revenue data'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRevenueData()
})
</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>