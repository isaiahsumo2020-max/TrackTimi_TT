<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Real-time Notifications (Toast) -->
    <RealtimeNotifications 
      :notifications="displayNotifications"
      @dismiss="dismissNotification"
    />

    <!-- Live Feedback Toast Notifications -->
    <div v-if="liveNotifications.length > 0" class="fixed bottom-6 right-6 space-y-3 z-50">
      <div v-for="(notif, idx) in liveNotifications" :key="idx" 
           :class="{
             'bg-blue-500': notif.type === 'success',
             'bg-red-500': notif.type === 'error',
             'bg-blue-500': notif.type === 'info',
             'bg-yellow-500': notif.type === 'warning'
           }"
           class="text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slideIn min-w-80">
        <CheckCircle2 v-if="notif.type === 'success'" class="w-5 h-5" />
        <XCircle v-else-if="notif.type === 'error'" class="w-5 h-5" />
        <AlertTriangleIcon v-else-if="notif.type === 'warning'" class="w-5 h-5" />
        <Info v-else class="w-5 h-5" />
        <span class="flex-1">{{ notif.message }}</span>
        <button @click="removeLiveNotification(idx)" class="text-white opacity-70 hover:opacity-100"><XIcon class="w-4 h-4" /></button>
      </div>
    </div>

    <!-- Notification Panel (Modal) -->
    <NotificationPanel
      :isOpen="showNotificationsPanel"
      :notifications="notifications"
      :unreadCount="unreadCount"
      @close="showNotificationsPanel = false"
      @mark-as-read="markNotificationAsRead"
      @delete="deleteNotification"
      @mark-all-read="markAllAsRead"
    />

    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p class="text-sm text-gray-600 mt-1">Manage your organization's employees</p>
          </div>
          <div class="flex items-center gap-4">
            <!-- Notification Bell -->
            <button 
              @click="showNotificationsPanel = !showNotificationsPanel"
              class="relative p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all hover:shadow-md"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>
            <button @click="showAddEmployeeModal = true"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Employee
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Cards with Attendance Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Employees</p>
              <p class="text-2xl font-bold text-gray-900">{{ employees.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Today</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeToday }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending Invitations</p>
              <p class="text-2xl font-bold text-gray-900">{{ pendingInvitations }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Avg. Attendance</p>
              <p class="text-2xl font-bold text-gray-900">{{ avgAttendance }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Tabs with New Views -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="flex space-x-8">
          <button @click="activeTab = 'employees'"
                  :class="activeTab === 'employees' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
            👥 Workforce Directory
          </button>
          <button @click="activeTab = 'attendance'"
                  :class="activeTab === 'attendance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2">
            <BarChart3 class="w-4 h-4" /> Attendance
          </button>
          <button @click="activeTab = 'schedules'"
                  :class="activeTab === 'schedules' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2">
            <Calendar class="w-4 h-4" /> Schedules
          </button>
          <button @click="activeTab = 'invitations'"
                  :class="activeTab === 'invitations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2">
            <Mail class="w-4 h-4" /> Invitations
          </button>
          <button @click="activeTab = 'activity'"
                  :class="activeTab === 'activity' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2">
            <ClipboardList class="w-4 h-4" /> Activity Logs
          </button>
        </nav>
      </div>

      <!-- Live Feedback & Activity Panel -->
      <div class="mt-6 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="flex h-3 w-3 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
            </span>
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2"><div class="flex h-3 w-3 relative"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></div> Live Activity Feed</h3>
          </div>
          <button @click="showActivityPanel = !showActivityPanel" class="text-xs bg-white px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">
            {{ showActivityPanel ? 'Hide' : 'Show' }}
          </button>
        </div>
        
        <div v-if="showActivityPanel" class="space-y-2 max-h-48 overflow-y-auto">
          <div v-if="activityLog.length === 0" class="text-xs text-gray-500 italic">No recent activity yet...</div>
          <div v-for="(log, index) in activityLog" :key="index" class="text-xs bg-white bg-opacity-60 px-3 py-2 rounded border border-blue-100 flex items-start gap-2">
            <span class="mt-0.5 text-lg">{{ log.icon }}</span>
            <div class="flex-1">
              <p class="text-gray-900 font-medium">{{ log.action }}</p>
              <p class="text-gray-600 text-xs mt-0.5">{{ log.details }}</p>
              <p class="text-gray-400 text-xs mt-1">{{ log.timestamp }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Employees Tab with Advanced Filtering & Bulk Actions -->
      <div v-if="activeTab === 'employees'" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <!-- Advanced Filter Section -->
          <div class="mb-6 pb-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 mb-4">🔍 Advanced Filters</h3>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <input v-model="searchQuery" type="text" placeholder="🔎 Search by name, email..."
                       class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <select v-model="filterDepartment" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Departments</option>
                  <option v-for="dept in departments" :key="dept.Depart_ID" :value="dept.Depart_ID">
                    {{ dept.Depart_Name }}
                  </option>
                </select>
              </div>
              <div>
                <select v-model="filterRole" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Roles</option>
                  <option value="1">Admin</option>
                  <option value="2">Manager</option>
                  <option value="3">Staff</option>
                  <option value="5">Supervisor</option>
                </select>
              </div>
              <div>
                <select v-model="filterStatus" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
              <div class="flex gap-2">
                <button @click="exportToCSV" class="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                  📥 Export CSV
                </button>
              </div>
            </div>
          </div>

          <!-- Bulk Actions -->
          <div v-if="selectedEmployees.length > 0" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
            <span class="text-sm font-medium text-blue-900">{{ selectedEmployees.length }} selected</span>
            <div class="flex gap-2">
              <button @click="bulkChangeStatus" class="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700">
                Change Status
              </button>
              <button @click="bulkAssignDepartment" class="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700">
                Assign Department
              </button>
              <button @click="bulkDelete" class="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>

          <!-- Employee Directory Table with Real-time Status -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left">
                    <input type="checkbox" @change="toggleSelectAll" :checked="allSelected" class="rounded">
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="employee in filteredAndPaginatedEmployees" :key="employee.User_ID" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <input type="checkbox" @change="toggleSelectEmployee(employee.User_ID)" :checked="selectedEmployees.includes(employee.User_ID)" class="rounded">
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div v-if="employee.avatar" class="h-10 w-10 rounded-full overflow-hidden">
                          <img :src="`data:${employee.avatarMimeType};base64,${employee.avatar}`" :alt="employee.First_Name" class="w-full h-full object-cover" />
                        </div>
                        <div v-else class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-700">
                            {{ employee.First_Name?.[0] }}{{ employee.SurName?.[0] }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ employee.First_Name }} {{ employee.SurName }}
                        </div>
                        <div class="text-sm text-gray-500">{{ employee.Email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getRoleName(employee.User_Type_ID) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getDepartmentName(employee.Depart_ID) || 'Not Assigned' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div :class="employee.Is_Active ? 'bg-green-100' : 'bg-red-100'" class="w-2 h-2 rounded-full"></div>
                      <span :class="employee.Is_Active ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ employee.Is_Active ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ getLastActive(employee.User_ID) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button @click="viewUserProfile(employee.User_ID)" class="text-blue-600 hover:text-blue-900" title="View Profile">👁️</button>
                    <button @click="assignShift(employee.User_ID)" class="text-green-600 hover:text-green-900" title="Assign Shift">📅</button>
                    <button @click="sendMessage(employee.User_ID)" class="text-purple-600 hover:text-purple-900" title="Send Message">💬</button>
                    <button @click="toggleEmployeeStatus(employee.User_ID)" class="text-orange-600 hover:text-orange-900" title="Toggle Status">⚙️</button>
                  </td>
                </tr>
                <tr v-if="filteredEmployees.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    No employees found matching your criteria
              <div>
                <select v-model="filterStatus" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
              <div class="flex gap-2">
                <button @click="exportToCSV" class="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                  📥 Export CSV
                </button>
              </div>
            </div>
          </div>

          <!-- Bulk Actions -->
          <div v-if="selectedEmployees.length > 0" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
            <span class="text-sm font-medium text-blue-900">{{ selectedEmployees.length }} selected</span>
            <div class="flex gap-2">
              <button @click="bulkChangeStatus" class="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700">
                Change Status
              </button>
              <button @click="bulkAssignDepartment" class="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700">
                Assign Department
              </button>
              <button @click="bulkDelete" class="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>

          <!-- Employee Directory Table with Real-time Status -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left">
                    <input type="checkbox" @change="toggleSelectAll" :checked="allSelected" class="rounded">
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="employee in filteredAndPaginatedEmployees" :key="employee.User_ID" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <input type="checkbox" @change="toggleSelectEmployee(employee.User_ID)" :checked="selectedEmployees.includes(employee.User_ID)" class="rounded">
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div v-if="employee.avatar" class="h-10 w-10 rounded-full overflow-hidden">
                          <img :src="`data:${employee.avatarMimeType};base64,${employee.avatar}`" :alt="employee.First_Name" class="w-full h-full object-cover" />
                        </div>
                        <div v-else class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-700">
                            {{ employee.First_Name?.[0] }}{{ employee.SurName?.[0] }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ employee.First_Name }} {{ employee.SurName }}
                        </div>
                        <div class="text-sm text-gray-500">{{ employee.Email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getRoleName(employee.User_Type_ID) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getDepartmentName(employee.Depart_ID) || 'Not Assigned' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div :class="employee.Is_Active ? 'bg-green-100' : 'bg-red-100'" class="w-2 h-2 rounded-full"></div>
                      <span :class="employee.Is_Active ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ employee.Is_Active ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ getLastActive(employee.User_ID) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button @click="viewUserProfile(employee.User_ID)" class="text-blue-600 hover:text-blue-900" title="View Profile">👁️</button>
                    <button @click="assignShift(employee.User_ID)" class="text-green-600 hover:text-green-900" title="Assign Shift">📅</button>
                    <button @click="sendMessage(employee.User_ID)" class="text-purple-600 hover:text-purple-900" title="Send Message">💬</button>
                    <button @click="toggleEmployeeStatus(employee.User_ID)" class="text-orange-600 hover:text-orange-900" title="Toggle Status">⚙️</button>
                  </td>
                </tr>
                <tr v-if="filteredEmployees.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    No employees found matching your criteria
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Attendance Tab -->\n      <div v-if=\"activeTab === 'attendance'\" class=\"bg-white shadow rounded-lg\">\n        <div class=\"px-4 py-5 sm:p-6\">\n          <h3 class=\"text-lg font-medium text-gray-900 mb-4\">📊 Employee Attendance Overview</h3>\n          <div class=\"grid grid-cols-1 md:grid-cols-3 gap-6 mb-6\">\n            <div class=\"bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg\">\n              <p class=\"text-sm text-gray-600 mb-2\">Present Today</p>\n              <p class=\"text-3xl font-bold text-green-700\">{{ activeToday }} / {{ employees.length }}</p>\n              <p class=\"text-xs text-gray-600 mt-2\">{{ Math.round((activeToday / employees.length) * 100) }}% Attendance</p>\n            </div>\n            <div class=\"bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg\">\n              <p class=\"text-sm text-gray-600 mb-2\">Late Today</p>\n              <p class=\"text-3xl font-bold text-yellow-700\">{{ lateToday }}</p>\n              <p class=\"text-xs text-gray-600 mt-2\">Employees who clocked in late</p>\n            </div>\n            <div class=\"bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg\">\n              <p class=\"text-sm text-gray-600 mb-2\">Absent Today</p>\n              <p class=\"text-3xl font-bold text-red-700\">{{ employees.length - activeToday }}</p>\n              <p class=\"text-xs text-gray-600 mt-2\">Not yet clocked in</p>\n            </div>\n          </div>\n\n          <!-- Attendance Table -->\n          <div class=\"overflow-x-auto\">\n            <table class=\"min-w-full divide-y divide-gray-200\">\n              <thead class=\"bg-gray-50\">\n                <tr>\n                  <th class=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase\">Employee</th>\n                  <th class=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase\">Check-in Time</th>\n                  <th class=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase\">Check-out Time</th>\n                  <th class=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase\">Status</th>\n                  <th class=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase\">Hours Worked</th>\n                </tr>\n              </thead>\n              <tbody class=\"divide-y divide-gray-200\">\n                <tr v-for=\"emp in filteredEmployees\" :key=\"emp.User_ID\" class=\"hover:bg-gray-50\">\n                  <td class=\"px-6 py-4 whitespace-nowrap text-sm font-medium\">{{ emp.First_Name }} {{ emp.SurName }}</td>\n                  <td class=\"px-6 py-4 whitespace-nowrap text-sm\">{{ getCheckInTime(emp.User_ID) || '—' }}</td>\n                  <td class=\"px-6 py-4 whitespace-nowrap text-sm\">{{ getCheckOutTime(emp.User_ID) || '—' }}</td>\n                  <td class=\"px-6 py-4 whitespace-nowrap\">\n                    <span :class=\"getAttendanceStatus(emp.User_ID) === 'Present' ? 'bg-green-100 text-green-800' : getAttendanceStatus(emp.User_ID) === 'Late' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'\" class=\"px-2 py-1 text-xs font-semibold rounded-full\">\n                      {{ getAttendanceStatus(emp.User_ID) }}\n                    </span>\n                  </td>\n                  <td class=\"px-6 py-4 whitespace-nowrap text-sm font-medium\">{{ getHoursWorked(emp.User_ID) }} hrs</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n        </div>\n      </div>\n\n      <!-- Schedules Tab -->\n      <div v-if=\"activeTab === 'schedules'\" class=\"bg-white shadow rounded-lg\">\n        <div class=\"px-4 py-5 sm:p-6\">\n          <div class=\"flex justify-between items-center mb-4\">\n            <h3 class=\"text-lg font-medium text-gray-900\">📅 Work Schedules</h3>\n            <button @click=\"showScheduleModal = true\" class=\"bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium\">\n              + Create Schedule\n            </button>\n          </div>\n\n          <div class=\"space-y-4\">\n            <div v-for=\"emp in filteredEmployees\" :key=\"emp.User_ID\" class=\"border border-gray-200 rounded-lg p-4 hover:bg-gray-50\">\n              <div class=\"flex justify-between items-start mb-3\">\n                <div>\n                  <p class=\"font-medium text-gray-900\">{{ emp.First_Name }} {{ emp.SurName }}</p>\n                  <p class=\"text-sm text-gray-600\">{{ emp.Email }}</p>\n                </div>\n                <button @click=\"editSchedule(emp.User_ID)\" class=\"text-blue-600 hover:text-blue-900 text-sm\">Edit Schedule</button>\n              </div>\n              <div class=\"grid grid-cols-7 gap-2\">\n                <div v-for=\"day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']\" :key=\"day\" class=\"text-center\">\n                  <p class=\"text-xs font-bold text-gray-600 mb-1\">{{ day }}</p>\n                  <p class=\"text-xs text-gray-900\">9AM-5PM</p>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <!-- Activity Logs Tab -->\n      <div v-if=\"activeTab === 'activity'\" class=\"bg-white shadow rounded-lg\">\n        <div class=\"px-4 py-5 sm:p-6\">\n          <h3 class=\"text-lg font-medium text-gray-900 mb-4\">📋 Recent Activity Logs</h3>\n          <div class=\"space-y-3\">\n            <div class=\"border-l-4 border-blue-500 pl-4 py-2\">\n              <p class=\"text-sm font-medium text-gray-900\">System Activity Overview</p>\n              <div class=\"mt-3 space-y-2 text-sm text-gray-600\">\n                <p>✅ Archie Quewon - Clocked in at 09:05 AM</p>\n                <p>✅ Teach Mee - Clocked in at 08:45 AM</p>\n                <p>⏱️ fghjk fghjk - Late clock-in alert (10 min late)</p>\n                <p>📧 Invitation sent to new.employee@gmail.com</p>\n                <p>👤 User profile updated: Archie Quewon</p>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <!-- Invitations Tab -->
      <div v-if="activeTab === 'invitations'" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Pending Invitations</h3>

          <div class="space-y-4">
            <div v-for="invitation in invitations" :key="invitation.Invitation_ID"
                 class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ invitation.Email }}</p>
                  <p class="text-sm text-gray-500">Role: {{ invitation.UserType }}</p>
                  <p class="text-sm text-gray-500">Sent: {{ formatDate(invitation.Created_at) }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span :class="getStatusClass(invitation.Status)"
                        class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ invitation.Status }}
                  </span>
                  <button v-if="invitation.Status === 'Pending'"
                          @click="resendInvitation(invitation.Invitation_ID)"
                          class="text-blue-600 hover:text-blue-900 text-sm">
                    Resend
                  </button>
                </div>
              </div>
            </div>

            <div v-if="invitations.length === 0" class="text-center py-8 text-gray-500">
              No pending invitations
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Employee Modal -->
    <div v-if="showAddEmployeeModal"
         class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
         @click="showAddEmployeeModal = false">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
           @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Employee</h3>

          <form @submit.prevent="inviteEmployee" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">First Name</label>
              <input v-model="newEmployee.firstName" type="text" required
                     class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Last Name</label>
              <input v-model="newEmployee.surName" type="text" required
                     class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="newEmployee.email" type="email" required
                     class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Department</label>
              <select v-model="newEmployee.departmentId"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Department</option>
                <option v-for="dept in departments" :key="dept.Depart_ID" :value="dept.Depart_ID">
                  {{ dept.Depart_Name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Job Title</label>
              <input v-model="newEmployee.jobTitle" type="text"
                     class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <select v-model="newEmployee.userTypeId"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="3">Staff</option>
                <option value="2">Manager</option>
                <option value="5">Supervisor</option>
              </select>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" @click="showAddEmployeeModal = false"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" :disabled="inviting"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50">
                {{ inviting ? 'Sending...' : 'Send Invitation' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- User Profile Modal -->
    <div v-if="showProfileModal"
         class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
         @click="closeProfileModal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
           @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ isEditingProfile ? 'Edit User Profile' : 'User Profile' }}
          </h3>

          <div v-if="selectedUserProfile" class="space-y-4">
            <div v-if="!isEditingProfile" class="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p class="text-xs font-semibold text-gray-600 uppercase">Name</p>
                <p class="text-sm text-gray-900">{{ selectedUserProfile.First_Name }} {{ selectedUserProfile.SurName }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-600 uppercase">Email</p>
                <p class="text-sm text-gray-900">{{ selectedUserProfile.Email }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-600 uppercase">Job Title</p>
                <p class="text-sm text-gray-900">{{ selectedUserProfile.Job_Title || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-600 uppercase">Employee ID</p>
                <p class="text-sm text-gray-900">{{ selectedUserProfile.Employee_ID || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-600 uppercase">Status</p>
                <p class="text-sm text-gray-900">{{ selectedUserProfile.Is_Active ? 'Active' : 'Inactive' }}</p>
              </div>
            </div>

            <form v-else @submit.prevent="updateUserProfile" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">First Name</label>
                <input v-model="profileFormData.firstName" type="text" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                <input v-model="profileFormData.surName" type="text" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="profileFormData.email" type="email" required
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Job Title</label>
                <input v-model="profileFormData.jobTitle" type="text"
                       class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button type="button" @click="cancelEditProfile"
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                        class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                  Save Changes
                </button>
              </div>
            </form>

            <div v-if="!isEditingProfile" class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button @click="closeProfileModal"
                      class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Close
              </button>
              <button @click="isEditingProfile = true"
                      class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Eye, Calendar, MessageCircle, Settings, BarChart3, Mail, ClipboardList, AlertCircle, CheckCircle2, AlertTriangleIcon, Info, XCircle, XIcon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/utils/api.js'
import { getNotifications, markNotificationAsRead, getUnreadNotificationCount, deleteNotification as deleteNotifApi, markAllNotificationsAsRead } from '@/services/orgApi'
import { showConfirm, showAlert, showSuccess, showError } from '@/utils/dialog'
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications.vue'
import NotificationPanel from '@/components/dashboard/NotificationPanel.vue'

const authStore = useAuthStore()

// State
const employees = ref([])
const invitations = ref([])
const departments = ref([])
const activeTab = ref('employees')
const searchQuery = ref('')
const showAddEmployeeModal = ref(false)
const inviting = ref(false)
const activeToday = ref(0)
const pendingInvitations = ref(0)
const notifications = ref([])
const unreadCount = ref(0)
const notifRefreshInterval = ref(null)
const showNotificationsPanel = ref(false)

// User Profile Modal State
const showProfileModal = ref(false)
const selectedUserProfile = ref(null)
const isEditingProfile = ref(false)
const profileFormData = ref({
  firstName: '',
  surName: '',
  email: '',
  jobTitle: ''
})

const newEmployee = ref({
  firstName: '',
  surName: '',
  email: '',
  departmentId: '',
  jobTitle: '',
  userTypeId: '3'
})

// Advanced Filter State
const filterDepartment = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const selectedEmployees = ref([])
const lateToday = ref(2)
const avgAttendance = ref(92)
const showScheduleModal = ref(false)

// Live Notification & Activity Feed State
const liveNotifications = ref([])
const activityLog = ref([])
const showActivityPanel = ref(true)
const liveNotifTimeout = ref(null)

// Computed
const filteredEmployees = computed(() => {
  let result = employees.value

  // Apply search filter
  if (searchQuery.value) {
    result = result.filter(emp =>
      `${emp.First_Name} ${emp.SurName}`.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      emp.Email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Apply department filter
  if (filterDepartment.value) {
    result = result.filter(emp => emp.Depart_ID === parseInt(filterDepartment.value))
  }

  // Apply role filter
  if (filterRole.value) {
    result = result.filter(emp => emp.User_Type_ID === parseInt(filterRole.value))
  }

  // Apply status filter
  if (filterStatus.value) {
    result = result.filter(emp => emp.Is_Active === (filterStatus.value === '1'))
  }

  return result
})

const filteredAndPaginatedEmployees = computed(() => filteredEmployees.value)

const allSelected = computed(() => {
  return filteredEmployees.value.length > 0 && 
         selectedEmployees.value.length === filteredEmployees.value.length
})

// Computed for notifications display (unread only)
const displayNotifications = computed(() => {
  return notifications.value
    .filter(n => !n.Is_Read)
    .sort((a, b) => new Date(b.Created_at) - new Date(a.Created_at))
})

// Methods
const loadEmployees = async () => {
  try {
    const response = await api.get('/users')
    employees.value = response.data
  } catch (error) {
    console.error('Error loading employees:', error)
  }
}

const loadInvitations = async () => {
  try {
    const response = await api.get('/admin/invitations')
    invitations.value = response.data.invitations
    pendingInvitations.value = response.data.invitations.filter(inv => inv.Status === 'Pending').length
  } catch (error) {
    console.error('Error loading invitations:', error)
  }
}

const loadDepartments = async () => {
  try {
    const response = await api.get('/departments')
    departments.value = response.data
  } catch (error) {
    console.error('Error loading departments:', error)
  }
}

const inviteEmployee = async () => {
  inviting.value = true
  try {
    await api.post('/admin/invite-employee', newEmployee.value)
    showAddEmployeeModal.value = false
    newEmployee.value = { firstName: '', surName: '', email: '', departmentId: '', jobTitle: '', userTypeId: '3' }
    await loadInvitations()
    alert('Employee invitation sent successfully!')
  } catch (error) {
    console.error('Error inviting employee:', error)
    alert(error.response?.data?.error || 'Failed to send invitation')
  } finally {
    inviting.value = false
  }
}

const resendInvitation = async (invitationId) => {
  try {
    await api.post(`/admin/resend-invitation/${invitationId}`)
    alert('Invitation resent successfully!')
    await loadInvitations()
  } catch (error) {
    console.error('Error resending invitation:', error)
    alert('Failed to resend invitation')
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Accepted': return 'bg-green-100 text-green-800'
    case 'Expired': return 'bg-red-100 text-red-800'
    default: return 'bg-yellow-100 text-yellow-800'
  }
}

const viewUserProfile = async (userId) => {
  try {
    const res = await api.get(`/users/${userId}`)
    selectedUserProfile.value = res.data
    isEditingProfile.value = false
    profileFormData.value = {
      firstName: res.data.First_Name,
      surName: res.data.SurName,
      email: res.data.Email,
      jobTitle: res.data.Job_Title || ''
    }
    showProfileModal.value = true
  } catch (err) {
    console.error('Failed to load user profile:', err)
    alert('Failed to load user profile')
  }
}

const closeProfileModal = () => {
  showProfileModal.value = false
  selectedUserProfile.value = null
  isEditingProfile.value = false
}

const cancelEditProfile = () => {
  isEditingProfile.value = false
  profileFormData.value = {
    firstName: selectedUserProfile.value.First_Name,
    surName: selectedUserProfile.value.SurName,
    email: selectedUserProfile.value.Email,
    jobTitle: selectedUserProfile.value.Job_Title || ''
  }
}

const updateUserProfile = async () => {
  try {
    await api.put(`/users/${selectedUserProfile.value.User_ID}`, {
      firstName: profileFormData.value.firstName,
      surName: profileFormData.value.surName,
      email: profileFormData.value.email,
      jobTitle: profileFormData.value.jobTitle
    })
    
    // Reload the profile
    const res = await api.get(`/users/${selectedUserProfile.value.User_ID}`)
    selectedUserProfile.value = res.data
    isEditingProfile.value = false
    alert('User profile updated successfully')
  } catch (err) {
    console.error('Failed to update user profile:', err)
    alert('Failed to update user profile: ' + (err.response?.data?.error || err.message))
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadEmployees(),
    loadInvitations(),
    loadDepartments(),
    loadNotifications()
  ])
  
  // Refresh notifications every 3 seconds for real-time updates
  notifRefreshInterval.value = setInterval(() => {
    loadNotifications()
  }, 3000)
})

onBeforeUnmount(() => {
  if (notifRefreshInterval.value) {
    clearInterval(notifRefreshInterval.value)
  }
})

// Load notifications
const loadNotifications = async () => {
  try {
    const res = await getNotifications(20)
    notifications.value = res.data || []
    
    // Also get unread count
    const countRes = await getUnreadNotificationCount()
    unreadCount.value = countRes.data?.unreadCount || 0
  } catch (err) {
    console.error('Failed to load notifications:', err)
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

// ============================================================================
// NEW ADVANCED EMPLOYEE MANAGEMENT METHODS
// ============================================================================

// Role name mapping
const getRoleName = (roleId) => {
  const roles = {
    1: 'Admin',
    2: 'Manager',
    3: 'Staff',
    5: 'Supervisor'
  }
  return roles[roleId] || 'Unknown'
}

// Department name mapping
const getDepartmentName = (deptId) => {
  const dept = departments.value.find(d => d.Depart_ID === deptId)
  return dept ? dept.Depart_Name : null
}

// Get last active time
const getLastActive = (userId) => {
  // Mock data - in production, fetch from backend
  const times = ['30 mins ago', '2 hours ago', 'Today', 'Yesterday', '3 days ago']
  return times[Math.floor(Math.random() * times.length)]
}

// Toggle select employee
const toggleSelectEmployee = (userId) => {
  const index = selectedEmployees.value.indexOf(userId)
  if (index > -1) {
    selectedEmployees.value.splice(index, 1)
  } else {
    selectedEmployees.value.push(userId)
  }
}

// Toggle select all
const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedEmployees.value = []
  } else {
    selectedEmployees.value = filteredEmployees.value.map(emp => emp.User_ID)
  }
}

// Bulk change status
const bulkChangeStatus = async () => {
  if (selectedEmployees.value.length === 0) return
  const confirmed = await showConfirm({
    title: 'Activate Employees?',
    message: `This will activate ${selectedEmployees.value.length} selected employees`,
    type: 'info',
    confirmText: 'Activate',
    cancelText: 'Cancel'
  })
  if (!confirmed) return
  
  try {
    for (const userId of selectedEmployees.value) {
      await api.put(`/users/${userId}`, { isActive: 1 })
    }
    selectedEmployees.value = []
    await loadEmployees()
    await showSuccess(`${selectedEmployees.value.length} employees activated`)
  } catch (err) {
    console.error('Failed to change employee status:', err)
    await showError('Failed to activate employees')
  }
}}

// Bulk assign department
const bulkAssignDepartment = async () => {
  if (selectedEmployees.value.length === 0) return
  const deptId = prompt('Enter department ID:')
  if (!deptId) return
  try {
    for (const userId of selectedEmployees.value) {
      await api.put(`/users/${userId}`, { departmentId: deptId })
    }
    selectedEmployees.value = []
    await loadEmployees()
  } catch (err) {
    console.error('Failed to assign department:', err)
  }
}

// Bulk delete
const bulkDelete = async () => {
  if (selectedEmployees.value.length === 0) return
  const confirmed = await showDeleteConfirm(`${selectedEmployees.value.length} Employees`, async () => {
    try {
      for (const userId of selectedEmployees.value) {
        await api.delete(`/users/${userId}`)
      }
      selectedEmployees.value = []
      await loadEmployees()
    } catch (err) {
      console.error('Failed to delete employees:', err)
      throw err
    }
  })
}
    console.error('Failed to delete employees:', err)
  }
}

// Export to CSV
const exportToCSV = () => {
  const csvData = [
    ['Name', 'Email', 'Role', 'Department', 'Status', 'Phone', 'Address'],
    ...filteredEmployees.value.map(emp => [
      `${emp.First_Name} ${emp.SurName}`,
      emp.Email,
      getRoleName(emp.User_Type_ID),
      getDepartmentName(emp.Depart_ID) || '-',
      emp.Is_Active ? 'Active' : 'Inactive',
      emp.Phone_Number || '-',
      emp.Address || '-'
    ])
  ]
  
  const csvContent = csvData.map(row => 
    row.map(cell => `\"${cell}\"`).join(',')
  ).join('\\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `employee-directory-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// Assign shift
const assignShift = (userId) => {
  alert(`Shift assignment for user ${userId} - Feature coming soon!`)
  // TODO: Implement shift assignment modal
}

// Send message
const sendMessage = (userId) => {
  alert(`Message to user ${userId} - Feature coming soon!`)
  // TODO: Implement messaging modal
}

// Toggle employee status
const toggleEmployeeStatus = async (userId) => {
  try {
    const emp = employees.value.find(e => e.User_ID === userId)
    if (!emp) return
    
    await api.put(`/users/${userId}`, { isActive: !emp.Is_Active })
    emp.Is_Active = !emp.Is_Active
  } catch (err) {
    console.error('Failed to toggle employee status:', err)
  }
}

// Get check-in time
const getCheckInTime = (userId) => {
  // Mock data - in production, fetch from attendance table
  const times = ['09:05 AM', '08:45 AM', '10:15 AM', null]
  return times[userId % times.length]
}

// Get check-out time
const getCheckOutTime = (userId) => {
  // Mock data - in production, fetch from attendance table
  const times = ['05:30 PM', '06:00 PM', null, null]
  return times[userId % times.length]
}

// Get attendance status
const getAttendanceStatus = (userId) => {
  const checkIn = getCheckInTime(userId)
  if (!checkIn) return 'Absent'
  const [time, period] = checkIn.split(' ')
  const [hours] = time.split(':')
  const is24Hour = parseInt(hours) > 12
  const hour = is24Hour ? parseInt(hours) : parseInt(hours)
  return hour >= 9 ? 'Present' : 'Late'
}

// Get hours worked
const getHoursWorked = (userId) => {
  // Mock data - in production, calculate from check-in/check-out
  const hours = [8, 8.5, 7.5, 0, 8.2]
  return hours[userId % hours.length]
}

// Edit schedule
const editSchedule = (userId) => {
  alert(`Edit schedule for user ${userId} - Feature coming soon!`)
  // TODO: Implement schedule editor modal
}

// ============================================================================
// LIVE NOTIFICATION & ACTIVITY LOG METHODS
// ============================================================================

const showLiveNotification = (message, type = 'info') => {
  const notification = {
    message,
    type // success, error, info, warning
  }
  liveNotifications.value.push(notification)
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    removeLiveNotification(liveNotifications.value.length - 1)
  }, 4000)
}

const removeLiveNotification = (index) => {
  liveNotifications.value.splice(index, 1)
}

const addActivityLog = (action, details, icon = '📝') => {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  
  const logEntry = {
    action,
    details,
    icon,
    timestamp: timeStr
  }
  
  // Add to the beginning of the log
  activityLog.value.unshift(logEntry)
  
  // Keep only last 20 entries
  if (activityLog.value.length > 20) {
    activityLog.value.pop()
  }
}

// Override bulk action methods to add notifications

const bulkChangeStatusOriginal = bulkChangeStatus
const bulkChangeStatus = async () => {
  if (selectedEmployees.value.length === 0) return
  const newStatus = confirm('Activate all selected employees?') ? 1 : 0
  try {
    for (const userId of selectedEmployees.value) {
      await api.put(`/users/${userId}`, { isActive: newStatus })
    }
    const count = selectedEmployees.value.length
    showLiveNotification(`✅ Updated status for ${count} employee${count > 1 ? 's' : ''}`, 'success')
    addActivityLog(`Status Updated`, `Changed status for ${count} employee(s) to ${newStatus ? 'Active' : 'Inactive'}`, '🔄')
    selectedEmployees.value = []
    await loadEmployees()
  } catch (err) {
    showLiveNotification(`❌ Failed to update employee status`, 'error')
    addActivityLog(`Status Update Failed`, err.message, '⚠️')
  }
}

const bulkAssignDepartmentOriginal = bulkAssignDepartment
const bulkAssignDepartment = async () => {
  if (selectedEmployees.value.length === 0) return
  const deptId = prompt('Enter department ID:')
  if (!deptId) return
  try {
    for (const userId of selectedEmployees.value) {
      await api.put(`/users/${userId}`, { departmentId: deptId })
    }
    const count = selectedEmployees.value.length
    const deptName = getDepartmentName(parseInt(deptId)) || `Dept ${deptId}`
    showLiveNotification(`✅ Assigned ${count} employee${count > 1 ? 's' : ''} to ${deptName}`, 'success')
    addActivityLog(`Department Assigned`, `Moved ${count} employee(s) to ${deptName}`, '🏢')
    selectedEmployees.value = []
    await loadEmployees()
  } catch (err) {
    showLiveNotification(`❌ Failed to assign department`, 'error')
    addActivityLog(`Department Assignment Failed`, err.message, '⚠️')
  }
}

const bulkDeleteOriginal = bulkDelete
const bulkDelete = async () => {
  if (selectedEmployees.value.length === 0) return
  if (!confirm(`Delete ${selectedEmployees.value.length} selected employees?`)) return
  try {
    for (const userId of selectedEmployees.value) {
      await api.delete(`/users/${userId}`)
    }
    const count = selectedEmployees.value.length
    showLiveNotification(`✅ Deleted ${count} employee${count > 1 ? 's' : ''} successfully`, 'success')
    addActivityLog(`Employees Deleted`, `Permanently deleted ${count} employee(s)`, '🗑️')
    selectedEmployees.value = []
    await loadEmployees()
  } catch (err) {
    showLiveNotification(`❌ Failed to delete employees`, 'error')
    addActivityLog(`Delete Failed`, err.message, '⚠️')
  }
}

const toggleEmployeeStatusOriginal = toggleEmployeeStatus
const toggleEmployeeStatus = async (userId) => {
  try {
    const emp = employees.value.find(e => e.User_ID === userId)
    if (!emp) return
    
    const newStatus = !emp.Is_Active
    await api.put(`/users/${userId}`, { isActive: newStatus })
    emp.Is_Active = newStatus
    
    const statusText = newStatus ? 'Activated' : 'Deactivated'
    showLiveNotification(`✅ ${emp.First_Name} ${emp.SurName} ${statusText}`, 'success')
    addActivityLog(`Employee Status Changed`, `${emp.First_Name} ${emp.SurName} - Now ${newStatus ? 'Active' : 'Inactive'}`, newStatus ? '✅' : '❌')
  } catch (err) {
    showLiveNotification(`❌ Failed to update employee status`, 'error')
    addActivityLog(`Status Update Failed`, err.message, '⚠️')
  }
}

// Initialize with sample activity on load
onMounted(() => {
  addActivityLog(`Dashboard Opened`, `Employee Management console loaded`, '🚀')
})
</script>