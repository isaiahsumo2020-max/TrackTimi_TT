<template>
  <div class="min-h-screen bg-white">
    <!-- Super Admin Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-xl">
              <span class="text-2xl font-bold text-white">SA</span>
            </div>
            <h1 class="text-3xl font-bold text-black">Super Admin Dashboard</h1>
          </div>
          <div class="flex items-center space-x-3">
            <span class="bg-black/10 text-black px-4 py-2 rounded-full font-bold text-sm">
              {{ organizations.length }} Organizations
            </span>
            <button class="btn-black">Logout</button>
          </div>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-72 bg-white border-r border-gray-200">
        <nav class="py-12 px-6 space-y-2">
          <router-link to="/superadmin" class="flex items-center space-x-3 p-4 rounded-xl font-bold bg-orange-500 text-white shadow-md">
            <span>📊</span>
            <span>Overview</span>
          </router-link>
          <router-link to="/superadmin/organizations" class="flex items-center space-x-3 p-4 rounded-xl text-gray-700 hover:bg-orange-50 font-semibold border border-gray-200">
            <span>🏢</span>
            <span>Organizations</span>
          </router-link>
          <router-link to="/superadmin/users" class="flex items-center space-x-3 p-4 rounded-xl text-gray-700 hover:bg-orange-50 font-semibold border border-gray-200">
            <span>👥</span>
            <span>All Users</span>
          </router-link>
          <router-link to="/superadmin/activity" class="flex items-center space-x-3 p-4 rounded-xl text-gray-700 hover:bg-orange-50 font-semibold border border-gray-200">
            <span>📈</span>
            <span>System Activity</span>
          </router-link>
        </nav>
      </aside>

      <!-- Content -->
      <main class="flex-1 p-12">
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <!-- Total Orgs -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-bold text-gray-600 uppercase">Organizations</div>
                <div class="text-4xl font-bold text-black mt-2">{{ organizations.length }}</div>
              </div>
              <div class="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center">
                <span class="text-2xl text-white">🏢</span>
              </div>
            </div>
          </div>

          <!-- Total Users -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-bold text-gray-600 uppercase">Total Users</div>
                <div class="text-4xl font-bold text-black mt-2">{{ totalUsers }}</div>
              </div>
              <div class="w-20 h-20 bg-black rounded-2xl flex items-center justify-center">
                <span class="text-2xl text-white">👥</span>
              </div>
            </div>
          </div>

          <!-- Active Checkins -->
          <div class="card">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-bold text-gray-600 uppercase">Today’s Check-ins</div>
                <div class="text-4xl font-bold text-black mt-2">{{ todayCheckins }}</div>
              </div>
              <div class="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center border-2 border-orange-200">
                <span class="text-2xl text-orange-600">📍</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Organizations Table -->
        <div class="card mt-12">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-3xl font-bold text-black">Recent Organizations</h2>
            <button class="btn-orange">View All →</button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Organization</th>
                  <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Users</th>
                  <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Plan</th>
                  <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                  <th class="px-6 py-4 text-right text-sm font-bold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="org in organizations.slice(0, 5)" :key="org.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold mr-4">
                        {{ org.initials }}
                      </div>
                      <div>
                        <div class="font-bold text-black">{{ org.name }}</div>
                        <div class="text-sm text-gray-600">{{ org.slug }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-black">{{ org.users }}</td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold border border-orange-200">
                      {{ org.plan }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 bg-black/10 text-black rounded-full text-xs font-bold border border-black/20">
                      Active
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right text-sm text-gray-700">{{ org.created }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
const organizations = ref([
  { id: 1, initials: 'AC', name: 'Acme Corp', slug: 'acme-corp', users: 24, plan: 'Pro', created: 'Mar 4, 2026' },
  { id: 2, initials: 'LR', name: 'Liberia School', slug: 'liberia-school', users: 156, plan: 'Enterprise', created: 'Mar 3, 2026' }
])

const totalUsers = computed(() => organizations.value.reduce((sum, org) => sum + org.users, 0))
const todayCheckins = ref(342)
</script>
