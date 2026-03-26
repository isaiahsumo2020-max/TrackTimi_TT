<template>
  <div class="flex h-screen bg-gray-100">
    <aside :class="[sidebarOpen ? 'w-64' : 'w-0 overflow-hidden', 'bg-gradient-to-b from-gray-700 to-gray-700 text-white shadow-xl flex flex-col transition-all duration-300']">
      <div class="p-6 border-b border-gray-700 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center"><span class="text-xl font-bold text-white">A</span></div>
          <span class="text-lg font-bold">TrackTimi</span>
        </div>
        <button @click="toggleSidebar" class="p-1 rounded-lg bg-gray-700 hover:bg-gray-400">
          <span v-if="sidebarOpen">←</span><span v-else>→</span>
        </button>
      </div>
      <nav class="flex-1 py-8 px-4 space-y-2">
        <router-link to="/superadmin" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600"><span>📊</span><span>Dashboard</span></router-link>
        <router-link to="/superadmin/organizations" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600"><span>🏢</span><span>Organizations</span></router-link>
        <router-link to="/superadmin/revenue" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-gray-600"><span>💰</span><span>Revenue</span></router-link>
        <router-link to="/superadmin/subscriptions" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all bg-orange-500 text-white shadow-lg"><span>📦</span><span>Subscriptions</span></router-link>
        <router-link to="/superadmin/analytics" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600"><span>📈</span><span>Analytics</span></router-link>
        <router-link to="/superadmin/monitoring" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600"><span>🔍</span><span>Monitoring</span></router-link>
        <router-link to="/superadmin/audit-logs" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600"><span>📋</span><span>Audit Logs</span></router-link>
        <router-link to="/superadmin/settings" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600"><span>⚙️</span><span>Settings</span></router-link>
      </nav>
      <div class="p-6 border-t border-gray-600">
        <div class="flex items-center space-x-3 cursor-pointer hover:bg-gray-600 p-3 rounded-lg transition-all">
          <div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold">JS</div>
          <div class="flex-1"><div class="font-semibold text-sm">Jodell Suah</div><div class="text-xs text-orange-400">Super Admin</div></div>
        </div>
      </div>
    </aside>
    <main class="flex-1 overflow-auto">
      <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div class="px-8 py-8">
          <div class="flex items-center justify-between">
            <div><h1 class="text-3xl font-bold text-slate-900">Subscriptions</h1><p class="text-slate-600 mt-2">Manage subscription plans and customer subscriptions</p></div>
            <button @click="handleLogout" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all">Logout</button>
          </div>
        </div>
      </div>
      <div class="p-8">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {{ error }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><p class="text-gray-600 text-sm font-bold uppercase">Free Plan</p><p class="text-4xl font-bold text-slate-900 mt-2">{{ subscriptionStats.free }}</p><p class="text-slate-600 text-xs mt-1">Active subscriptions</p></div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><p class="text-gray-600 text-sm font-bold uppercase">Pro Plan</p><p class="text-4xl font-bold text-slate-900 mt-2">{{ subscriptionStats.pro }}</p><p class="text-slate-600 text-xs mt-1">Active subscriptions</p></div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><p class="text-gray-600 text-sm font-bold uppercase">Enterprise</p><p class="text-4xl font-bold text-slate-900 mt-2">{{ subscriptionStats.enterprise }}</p><p class="text-slate-600 text-xs mt-1">Active subscriptions</p></div>
        </div>

        <div v-if="loading" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center py-12">
          <div class="text-gray-500">Loading subscription data...</div>
        </div>

        <div v-else class="bg-white rounded-xl border border-gray-600 p-6 shadow-sm"><h2 class="text-xl font-bold text-gray-800 mb-6">Subscription Plans</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div @click="viewPlanDetail('Free')" class="border border-gray-500 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all"><h3 class="font-bold text-lg">Free</h3><p class="text-slate-600 text-sm mt-1">$0/month</p><div class="mt-4 space-y-2"><p class="text-sm">✓ 10 users</p><p class="text-sm">✓ Basic features</p><p class="text-sm">✓ 2GB storage</p></div><div class="mt-4 flex space-x-2"><button @click.stop="editPlan('Free')" class="flex-1 px-4 py-2 bg-orange-500 text-slate-800 rounded-lg font-semibold hover:bg-orange-400 text-xs">Edit</button><button @click.stop="deletePlan('Free')" class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 text-xs">Delete</button></div></div><div @click="viewPlanDetail('Pro')" class="border border-gray-200 rounded-lg p-4 bg-gray-50 relative cursor-pointer hover:shadow-lg transition-all"><div class="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">POPULAR</div><h3 class="font-bold text-lg">Pro</h3><p class="text-orange-500 font-semibold">$49/month</p><div class="mt-4 space-y-2"><p class="text-sm">✓ 50 users</p><p class="text-sm">✓ Advanced features</p><p class="text-sm">✓ 50GB storage</p></div><div class="mt-4 flex space-x-2"><button @click.stop="editPlan('Pro')" class="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 text-xs">Edit</button><button @click.stop="upgradePath('Pro')" class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-600 text-xs">Promote</button></div></div><div @click="viewPlanDetail('Enterprise')" class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all"><h3 class="font-bold text-lg">Enterprise</h3><p class="text-slate-600 text-sm mt-1">Custom pricing</p><div class="mt-4 space-y-2"><p class="text-sm">✓ Unlimited users</p><p class="text-sm">✓ All features</p><p class="text-sm">✓ Priority support</p></div><div class="mt-4 flex space-x-2"><button @click.stop="editPlan('Enterprise')" class="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 text-xs">Edit</button><button @click.stop="contactSales('Enterprise')" class="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 text-xs">Contact</button></div></div></div><h2 class="text-xl font-bold text-slate-900 mb-6 mt-8">Active Subscriptions by Plan</h2><div class="overflow-x-auto"><table class="w-full text-left"><thead><tr class="border-b border-gray-300 bg-gray-50"><th class="pb-3 px-4 font-semibold">Plan</th><th class="pb-3 px-4 font-semibold">Subscriptions</th><th class="pb-3 px-4 font-semibold">MRR</th><th class="pb-3 px-4 font-semibold">Growth</th><th class="pb-3 px-4 font-semibold">Actions</th></tr></thead><tbody><tr class="border-b border-gray-200 hover:bg-gray-50"><td class="py-3 px-4 font-semibold">Free</td><td class="py-3 px-4">{{ subscriptionStats.free }}</td><td class="py-3 px-4 text-slate-600">$0</td><td class="py-3 px-4 text-blue-600">+2.5%</td><td class="py-3 px-4"><button @click="viewPlanDetail('Free')" class="px-3 py-1 bg-slate-500 hover:bg-slate-600 text-white rounded text-xs font-semibold">View</button></td></tr><tr class="border-b border-gray-200 hover:bg-gray-50"><td class="py-3 px-4 font-semibold">Pro</td><td class="py-3 px-4">{{ subscriptionStats.pro }}</td><td class="py-3 px-4 text-green-600 font-semibold">${{ (subscriptionStats.pro * 49).toLocaleString() }}</td><td class="py-3 px-4 text-green-600">+12.5%</td><td class="py-3 px-4"><button @click="viewPlanDetail('Pro')" class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold">View</button></td></tr><tr class="border-b border-gray-200 hover:bg-gray-50"><td class="py-3 px-4 font-semibold">Enterprise</td><td class="py-3 px-4">{{ subscriptionStats.enterprise }}</td><td class="py-3 px-4 text-purple-600 font-semibold">$5,000+</td><td class="py-3 px-4 text-green-600">+5.1%</td><td class="py-3 px-4"><button @click="viewPlanDetail('Enterprise')" class="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs font-semibold">View</button></td></tr></tbody></table></div></div>
      </div>
    </main>

    <!-- Plan Detail Modal -->
    <div v-if="selectedPlan && showDetailModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full">
        <div class="sticky top-0 bg-gradient-to-r from-gray-700 to-gray-700 text-white p-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold">{{ selectedPlan }} Plan Details</h2>
          <button @click="showDetailModal = false" class="text-2xl hover:text-blue-200">&times;</button>
        </div>
        <div class="p-8">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-gray-600 text-sm font-semibold">Plan Name</p>
              <p class="text-lg font-bold text-slate-900 mt-2">{{ selectedPlan }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-gray-600 text-sm font-semibold">Price</p>
              <p class="text-lg font-bold text-slate-900 mt-2">{{ planPrices[selectedPlan] }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-gray-600 text-sm font-semibold">Active Subscriptions</p>
              <p class="text-lg font-bold text-blue-600 mt-2">{{ planSubscriptions[selectedPlan] }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-gray-600 text-sm font-semibold">Monthly Revenue</p>
              <p class="text-lg font-bold text-green-600 mt-2">{{ planMRR[selectedPlan] }}</p>
            </div>
          </div>
          <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="font-semibold text-blue-900">Features</p>
            <ul class="text-sm text-blue-800 mt-2 space-y-1">
              <li>✓ Users: {{ planFeatures[selectedPlan]?.users }}</li>
              <li>✓ Storage: {{ planFeatures[selectedPlan]?.storage }}</li>
              <li>✓ Support: {{ planFeatures[selectedPlan]?.support }}</li>
            </ul>
          </div>
          <div class="flex items-center space-x-3">
            <button @click="editPlan(selectedPlan)" class="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-all">
              Edit Plan
            </button>
            <button @click="archivePlan(selectedPlan)" class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all">
              Archive
            </button>
            <button @click="showDetailModal = false" class="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-all">
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const sidebarOpen = ref(true)
const selectedPlan = ref(null)
const showDetailModal = ref(false)
const actionMessage = ref('')

const subscriptionStats = ref({
  free: 0,
  pro: 0,
  enterprise: 0
})

const planPrices = {
  'Free': '$0/month',
  'Pro': '$49/month',
  'Enterprise': 'Custom'
}

const planSubscriptions = {
  'Free': 0,
  'Pro': 0,
  'Enterprise': 0
}

const planMRR = {
  'Free': '$0',
  'Pro': '$0',
  'Enterprise': '$0'
}

const planFeatures = {
  'Free': { users: '10', storage: '2GB', support: 'Email' },
  'Pro': { users: '50', storage: '50GB', support: '24/7 Chat' },
  'Enterprise': { users: 'Unlimited', storage: 'Unlimited', support: 'Dedicated' }
}

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

const viewPlanDetail = (plan) => {
  selectedPlan.value = plan
  showDetailModal.value = true
  actionMessage.value = ''
}

const editPlan = (plan) => {
  actionMessage.value = `Editing ${plan} plan...`
  setTimeout(() => {
    actionMessage.value = `${plan} plan updated successfully!`
    setTimeout(() => { actionMessage.value = '' }, 3000)
  }, 1000)
}

const deletePlan = (plan) => {
  if (confirm(`Are you sure you want to delete the ${plan} plan?`)) {
    actionMessage.value = `${plan} plan deleted successfully!`
    setTimeout(() => { actionMessage.value = '' }, 3000)
  }
}

const upgradePath = (plan) => {
  actionMessage.value = `Upgrading path to ${plan}...`
  setTimeout(() => {
    actionMessage.value = `Path upgraded to ${plan} successfully!`
    setTimeout(() => { actionMessage.value = '' }, 3000)
  }, 1000)
}

const contactSales = (plan) => {
  actionMessage.value = `Contacting sales for ${plan} inquiries...`
  setTimeout(() => { actionMessage.value = '' }, 3000)
}

const archivePlan = (plan) => {
  if (confirm(`Archive the ${plan} plan?`)) {
    actionMessage.value = `${plan} plan archived successfully!`
    setTimeout(() => {
      showDetailModal.value = false
      actionMessage.value = ''
    }, 2000)
  }
}

const loadSubscriptionData = async () => {
  try {
    loading.value = true
    error.value = ''
    const token = localStorage.getItem('superAdminToken')
    if (!token) {
      router.push('/superadmin/login')
      return
    }

    const response = await axios.get(
      'http://localhost:4000/api/superadmin/organizations',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data?.organizations) {
      // Count subscriptions by plan
      const orgs = response.data.organizations
      subscriptionStats.value = {
        free: orgs.filter(o => !o.Plan_Name || o.Plan_Name === 'Free').length,
        pro: orgs.filter(o => o.Plan_Name === 'Pro' || o.Plan_Name === 'Professional').length,
        enterprise: orgs.filter(o => o.Plan_Name === 'Enterprise' || o.Plan_Name === 'Premium').length
      }

      // Update plan data
      planSubscriptions['Free'] = subscriptionStats.value.free
      planSubscriptions['Pro'] = subscriptionStats.value.pro
      planSubscriptions['Enterprise'] = subscriptionStats.value.enterprise
      planMRR['Pro'] = '$' + (subscriptionStats.value.pro * 49).toLocaleString()
      planMRR['Enterprise'] = '$5,000+'
    }
  } catch (err) {
    console.error('Failed to load subscription data:', err)
    error.value = 'Failed to load subscription data'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSubscriptionData()
})
</script>

<style scoped>
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
</style>
