<template>
  <div class="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
    <!-- Sidebar -->
    <aside :class="[sidebarOpen ? 'w-72' : 'w-20', 'bg-slate-950 text-white shadow-2xl transition-all duration-500 flex flex-col z-20']">
      <div class="p-6 border-b border-slate-800 flex items-center justify-between">
        <div v-if="sidebarOpen" class="flex items-center space-x-3">
          <ZapIcon class="w-6 h-6" style="color: #F2D479;" />
          <span class="text-xl font-black uppercase" style="color: #000000;">TrackTimi</span>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-xl bg-slate-900">
          <MenuIcon v-if="!sidebarOpen" class="w-5 h-5" />
          <ChevronLeftIcon v-else class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 py-8 px-4 space-y-2">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex items-center space-x-4 px-4 py-3.5 rounded-lg font-bold text-xs uppercase transition-all"
          :class="[$route.path === item.path ? 'text-white shadow-xl' : 'text-slate-400 hover:bg-slate-900']"
          :style="$route.path === item.path ? { backgroundColor: '#0284c7' } : {}"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="p-6 border-t border-slate-800">
        <button @click="handleLogout" class="w-full p-3 rounded-xl text-xs font-bold uppercase text-white" style="background-color: #0284c7;">
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10">
        <div>
          <h1 class="text-xl font-black uppercase" style="color: #000000;">Users Directory</h1>
          <p class="text-[10px] font-bold uppercase" style="color: #000000;">All users across platform</p>
        </div>
        <div class="flex items-center space-x-4">
          <input v-model="searchQuery" type="text" placeholder="Search users..." class="px-4 py-2 border border-slate-200 rounded-lg text-sm">
          <button @click="loadUsers" class="p-3 bg-slate-50 rounded-xl hover:bg-slate-100" style="color: #0284c7;">
            <RefreshCwIcon :class="{'animate-spin': loading}" class="w-4 h-4" />
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-10 space-y-8">
        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-lg border border-slate-100">
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Total Users</p>
            <h3 class="text-3xl font-black mt-2" style="color: #0284c7;">{{ users.length }}</h3>
          </div>
          <div class="bg-white p-6 rounded-lg border border-slate-100">
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Active Users</p>
            <h3 class="text-3xl font-black mt-2" style="color: #ea580c;">{{ activeUsers }}</h3>
          </div>
          <div class="bg-white p-6 rounded-lg border border-slate-100">
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Inactive Users</p>
            <h3 class="text-3xl font-black mt-2" style="color: #ef4444;">{{ inactiveUsers }}</h3>
          </div>
          <div class="bg-white p-6 rounded-lg border border-slate-100">
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Organizations</p>
            <h3 class="text-3xl font-black mt-2" style="color: #0284c7;">{{ uniqueOrgs }}</h3>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-lg border border-slate-100 overflow-hidden">
          <div class="p-8 border-b border-slate-100">
            <h2 class="text-sm font-black uppercase" style="color: #000000;">Users Directory</h2>
          </div>

          <div v-if="filteredUsers.length > 0" class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-slate-50 border-b border-slate-100">
                <tr class="text-[9px] font-black uppercase tracking-widest" style="color: #000000;">
                  <th class="px-6 py-4">Name</th>
                  <th class="px-6 py-4">Email</th>
                  <th class="px-6 py-4">Organization</th>
                  <th class="px-6 py-4">Job Title</th>
                  <th class="px-6 py-4">Domain</th>
                  <th class="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="user in filteredUsers.slice(0, 50)" :key="user.User_ID" class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                      <!-- User Avatar -->
                      <div v-if="user.Avatar_Data" class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-200 shadow-md">
                        <img :src="formatAvatarPath(user.Avatar_Data, user.Avatar_MIME_Type)" :alt="`${user.First_Name} ${user.SurName}`" class="w-full h-full object-cover" @error="handleImageError" />
                      </div>
                      <div v-else class="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md">
                        {{ getInitials(user.First_Name, user.SurName) }}
                      </div>
                      <p class="text-xs font-bold" style="color: #000000;">{{ user.First_Name }} {{ user.SurName }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-xs" style="color: #000000;">{{ user.Email }}</td>
                  <td class="px-6 py-4 text-xs font-bold" style="color: #0284c7;">{{ user.Org_Name }}</td>
                  <td class="px-6 py-4 text-xs" style="color: #000000;">{{ user.Job_Title || 'N/A' }}</td>
                  <td class="px-6 py-4 text-xs font-mono" style="color: #0284c7;">{{ user.Org_Domain }}.tracktimi.com</td>
                  <td class="px-6 py-4">
                    <span :style="user.Is_Active ? { backgroundColor: '#0284c7', color: 'white' } : { backgroundColor: '#FFE5E5', color: '#ef4444' }" class="px-3 py-1 rounded-full text-[9px] font-black uppercase">
                      {{ user.Is_Active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="p-8 text-center text-slate-400">
            <p class="text-sm font-bold">No users found</p>
          </div>
        </div>

        <!-- User Statistics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg border border-slate-100 p-8">
            <h2 class="text-sm font-black text-slate-900 uppercase mb-6">Top Organizations by Users</h2>
            <div class="space-y-3">
              <div v-for="org in topOrganizations" :key="org.org" class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <p class="text-xs font-bold text-slate-900">{{ org.org }}</p>
                <span class="text-xs font-black text-primary-600">{{ org.count }} users</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-slate-100 p-8">
            <h2 class="text-sm font-black text-slate-900 uppercase mb-6">User Status Distribution</h2>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-xs font-bold text-slate-900">Active</span>
                  <span class="text-xs font-bold text-green-600">{{ activeUsers }}</span>
                </div>
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500" :style="{ width: (activeUsers / users.length * 100) + '%' }"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-xs font-bold text-slate-900">Inactive</span>
                  <span class="text-xs font-bold text-red-600">{{ inactiveUsers }}</span>
                </div>
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-red-500" :style="{ width: (inactiveUsers / users.length * 100) + '%' }"></div>
                </div>
              </div>
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
import { getUsers } from '@/services/superadminApi'
import {
  ZapIcon, MenuIcon, ChevronLeftIcon, RefreshCwIcon, LayoutDashboardIcon,
  BuildingIcon, UsersIcon, TrendingUpIcon, MapPinIcon, BriefcaseIcon,
  ClockIcon, ActivityIcon, FileTextIcon, AlertCircleIcon, ShieldAlertIcon, SettingsIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)
const users = ref([])
const searchQuery = ref('')

const activeUsers = computed(() => users.value.filter(u => u.Is_Active).length)
const inactiveUsers = computed(() => users.value.filter(u => !u.Is_Active).length)
const uniqueOrgs = computed(() => new Set(users.value.map(u => u.Org_ID)).size)

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(u =>
    u.First_Name.toLowerCase().includes(query) ||
    u.SurName.toLowerCase().includes(query) ||
    u.Email.toLowerCase().includes(query) ||
    u.Org_Name.toLowerCase().includes(query)
  )
})

const topOrganizations = computed(() => {
  const orgCounts = {}
  users.value.forEach(u => {
    orgCounts[u.Org_Name] = (orgCounts[u.Org_Name] || 0) + 1
  })
  return Object.entries(orgCounts)
    .map(([org, count]) => ({ org, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const navItems = [
  { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboardIcon },
  { name: 'Organizations', path: '/superadmin/organizations', icon: BuildingIcon },
  { name: 'Global Users', path: '/superadmin/users', icon: UsersIcon },
  { name: 'Attendance', path: '/superadmin/analytics', icon: TrendingUpIcon },
  { name: 'Geofences', path: '/superadmin/geofences', icon: MapPinIcon },
  { name: 'Departments', path: '/superadmin/departments', icon: BriefcaseIcon },
  { name: 'Shifts', path: '/superadmin/shifts', icon: ClockIcon },
  { name: 'Infrastructure', path: '/superadmin/monitoring', icon: ActivityIcon },
  { name: 'Reports', path: '/superadmin/reports', icon: FileTextIcon },
  { name: 'Alerts', path: '/superadmin/alerts', icon: AlertCircleIcon },
  { name: 'System Health', path: '/superadmin/health', icon: ShieldAlertIcon },
  { name: 'Audit Matrix', path: '/superadmin/audit-logs', icon: ShieldAlertIcon },
  { name: 'System Settings', path: '/superadmin/settings', icon: SettingsIcon },
]

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getUsers()
    if (res.data.success && res.data.users) {
      users.value = res.data.users
    }
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  router.push('/superadmin/login')
}

// Format avatar path for display
const formatAvatarPath = (avatarData, mimeType) => {
  if (!avatarData) return null
  // If it's already a data URL, return as is
  if (avatarData.startsWith('data:')) {
    return avatarData
  }
  // If it's base64 without data: prefix, add it
  if (!avatarData.startsWith('http')) {
    return `data:${mimeType || 'image/png'};base64,${avatarData}`
  }
  // Otherwise return as is
  return avatarData
}

// Get user initials
const getInitials = (firstName, lastName) => {
  const first = (firstName || '').charAt(0).toUpperCase()
  const last = (lastName || '').charAt(0).toUpperCase()
  return (first + last) || '?'
}

// Handle image load errors
const handleImageError = (event) => {
  console.error('Failed to load avatar image')
  event.target.style.display = 'none'
}

onMounted(loadUsers)
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

