<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h3 class="text-2xl font-black text-primary-600 mb-2">Organizations</h3>
        <p class="text-sm text-slate-500">View and manage all organizations in the system</p>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-3">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search organizations..."
        class="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
      />
      
      <select
        v-model="filterStatus"
        class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
      <div class="flex items-center justify-center space-x-2">
        <div class="w-2 h-2 bg-[#FF6B35] rounded-full animate-pulse"></div>
        <p class="text-sm font-bold text-slate-600">Loading organizations...</p>
      </div>
    </div>

    <!-- Organizations Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="org in filteredOrganizations"
        :key="org.Org_ID"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6"
      >
        <!-- Organization Header -->
        <div class="flex items-start gap-4 mb-4">
          <!-- Logo/Status Box with Badge Overlay -->
          <div class="relative flex-shrink-0">
            <div v-if="org.Logo_Path" class="w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-200 bg-white shadow-md">
              <img 
                :src="formatLogoPath(org.Logo_Path)" 
                :alt="org.Org_Name" 
                class="w-full h-full object-cover" 
                @error="handleImageError"
              />
            </div>
            <div v-else class="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-lg flex items-center justify-center font-black text-3xl shadow-md">
              {{ org.Org_Name[0] }}
            </div>
            <!-- Status Badge in Corner -->
            <span
              :class="org.Is_Active ? 'bg-primary-600' : 'bg-red-600'"
              class="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg border border-white flex items-center gap-0.5"
              :title="org.Is_Active ? 'Active' : 'Inactive'"
            >
              <component :is="org.Is_Active ? CheckIcon : XIcon" class="w-3 h-3" />
              {{ org.Is_Active ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <!-- Org Info -->
          <div class="flex-1 min-w-0 flex flex-col justify-center">
            <h4 class="text-sm font-black text-slate-900 truncate">{{ org.Org_Name }}</h4>
            <p class="text-xs text-slate-500 truncate">{{ org.Org_Domain }}.tracktimi.com</p>
          </div>
        </div>

        <!-- Location & Contact Info -->
        <div v-if="org.Address || org.Phone_Num || org.Email" class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div class="space-y-2 text-xs">
            <div v-if="org.Address" class="flex items-start gap-2">
              <MapPinIcon class="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span class="text-slate-700 line-clamp-1">{{ org.Address }}</span>
            </div>
            <div v-if="org.Phone_Num" class="flex items-start gap-2">
              <PhoneIcon class="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span class="text-slate-700">{{ org.Phone_Num }}</span>
            </div>
            <div v-if="org.Email" class="flex items-start gap-2">
              <MailIcon class="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span class="text-slate-700 truncate">{{ org.Email }}</span>
            </div>
          </div>
        </div>

        <!-- Organization Stats -->
        <div class="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-slate-200">
          <div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Users</p>
            <p class="text-2xl font-black text-[#1B8B3C]">{{ org.userCount || 0 }}</p>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Created</p>
            <p class="text-sm font-bold text-slate-900">{{ formatDate(org.Created_at) }}</p>
          </div>
        </div>

        <!-- Actions -->
        <button
          @click="viewOrganizationDetails(org)"
          class="w-full px-3 py-2 bg-[#0ea5e9] text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#0284c7] transition-all"
        >
          <EyeIcon class="w-3 h-3 inline mr-1" />
          View Details
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredOrganizations.length === 0" class="col-span-full bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <BuildingIcon class="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p class="text-slate-500 font-bold">No organizations found</p>
      </div>
    </div>

    <!-- Organizations Table -->
    <div v-if="!loading && filteredOrganizations.length > 0" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <h4 class="text-lg font-black text-[#1B8B3C] mb-6">All Organizations</h4>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="px-6 py-3 text-left text-xs font-black text-slate-700 uppercase">Organization</th>
              <th class="px-6 py-3 text-left text-xs font-black text-slate-700 uppercase">Domain</th>
              <th class="px-6 py-3 text-left text-xs font-black text-slate-700 uppercase">Location</th>
              <th class="px-6 py-3 text-left text-xs font-black text-slate-700 uppercase">Contact</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Users</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Status</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Created</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="org in filteredOrganizations" :key="org.Org_ID" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <!-- Logo Display with Fallback -->
                  <div v-if="org.Logo_Path" class="w-12 h-12 rounded-lg overflow-hidden border-2 border-slate-200 bg-white flex-shrink-0 shadow-sm">
                    <img :src="formatLogoPath(org.Logo_Path)" :alt="org.Org_Name" class="w-full h-full object-cover" @error="handleImageError" />
                  </div>
                  <div v-else class="w-12 h-12 bg-gradient-to-br from-[#1B8B3C] to-[#0F5124] text-white rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm">
                    {{ org.Org_Name[0] }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900">{{ org.Org_Name }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-mono text-[#1B8B3C]">{{ org.Org_Domain }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-slate-700 line-clamp-2">{{ org.Address || '–' }}</p>
              </td>
              <td class="px-6 py-4">
                <div class="space-y-1 text-xs text-slate-700">
                  <p v-if="org.Phone_Num" class="font-mono">{{ org.Phone_Num }}</p>
                  <p v-if="org.Email" class="truncate">{{ org.Email }}</p>
                  <p v-if="!org.Phone_Num && !org.Email" class="text-slate-400">–</p>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-sm font-black text-slate-900">{{ org.userCount || 0 }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  :class="org.Is_Active ? 'bg-[#4ADE80]/20 text-[#1B8B3C]' : 'bg-red-100 text-red-600'"
                  class="px-3 py-1 rounded-full text-xs font-black uppercase"
                >
                  {{ org.Is_Active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <p class="text-sm font-bold text-slate-700">{{ formatDate(org.Created_at) }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex gap-2 justify-center">
                  <button
                    @click="openAdminPasswordModal(org)"
                    class="px-3 py-1 text-[#FF6B35] hover:bg-[#FF6B35]/10 rounded transition-all text-xs font-bold"
                    title="Reset Admin Password"
                  >
                    Reset Password
                  </button>
                  <button
                    @click="viewOrganizationDetails(org)"
                    class="px-3 py-1 text-[#1B8B3C] hover:bg-[#1B8B3C]/10 rounded transition-all text-xs font-bold"
                    title="View Organization Details"
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>



    <!-- Organization Details Modal - Comprehensive View -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-h-[95vh] w-full max-w-4xl overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-6 flex items-center justify-between shrink-0">
          <div>
            <h3 class="text-2xl font-black mb-1">Organization Details</h3>
            <p class="text-white/80 text-sm">Complete registration & settings information</p>
          </div>
          <button
            @click="showDetailsModal = false"
            class="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <XIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Content - Scrollable -->
        <div v-if="selectedOrgDetails" class="overflow-y-auto flex-1 p-8 space-y-6">
          <!-- TOP SECTION: Logo, Name, Domain, Status -->
          <div class="flex items-start gap-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
            <!-- Logo -->
            <div class="shrink-0 relative">
              <div v-if="selectedOrgDetails.info?.Logo_Path" class="w-28 h-28 rounded-xl border-2 border-slate-300 overflow-hidden bg-white shadow-md">
                <img :src="formatLogoPath(selectedOrgDetails.info.Logo_Path)" :alt="selectedOrgDetails.info.Org_Name" class="w-full h-full object-cover" @error="handleImageError" />
              </div>
              <div v-else class="w-28 h-28 rounded-xl border-2 border-slate-300 bg-gradient-to-br from-[#1B8B3C] to-[#0F5124] flex items-center justify-center text-white font-black text-4xl shadow-md">
                {{ selectedOrgDetails.info?.Org_Name?.[0] }}
              </div>
              <!-- Logo Upload/Delete Actions -->
              <div class="absolute -bottom-2 -right-2 flex gap-1">
                <label class="w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer text-xs font-bold transition-all shadow-md" title="Upload logo">
                  📤
                  <input 
                    type="file" 
                    accept="image/*" 
                    class="hidden" 
                    @change="handleLogoUpload($event, selectedOrgDetails.info.Org_ID)"
                  />
                </label>
                <button 
                  v-if="selectedOrgDetails.info?.Logo_Path"
                  @click="handleLogoDelete(selectedOrgDetails.info.Org_ID)"
                  class="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md"
                  title="Delete logo"
                >
                  <XIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
            <!-- Info -->
            <div class="flex-1">
              <h2 class="text-2xl font-black text-slate-900 mb-1">{{ selectedOrgDetails.info?.Org_Name }}</h2>
              <p class="text-sm font-mono text-[#1B8B3C] font-bold mb-4">{{ selectedOrgDetails.info?.Org_Domain }}.tracktimi.com</p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <span :class="selectedOrgDetails.info?.Is_Active ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-700'" class="inline-block px-3 py-1 rounded-full text-xs font-black">
                    {{ selectedOrgDetails.info?.Is_Active ? 'ACTIVE' : 'INACTIVE' }}
                  </span>
                </div>
                <div>
                  <p class="text-xs font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><BriefcaseIcon class="w-4 h-4" /> Workspace Capacity</p>
                  <p class="text-sm font-black text-slate-900">{{ selectedOrgDetails.info?.Workspace_Capacity || 'Not Set' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- REGISTRATION INFO Section -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border-2 border-blue-200">
            <h4 class="text-sm font-black text-blue-900 mb-4 flex items-center uppercase tracking-wider">
              <span class="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
              Registration Information
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <!-- Master Credentials (Admin User) -->
              <div class="bg-white rounded-lg p-4 border border-blue-100">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><LockIcon class="w-4 h-4" /> Master Credentials</p>
                <div class="space-y-1">
                  <p class="text-sm font-black text-blue-600">{{ selectedOrgDetails.info?.Master_Credentials?.name || '—' }}</p>
                  <p class="text-xs text-slate-600">{{ selectedOrgDetails.info?.Master_Credentials?.email || '—' }}</p>
                  <p class="text-xs text-slate-500" v-if="selectedOrgDetails.info?.Master_Credentials?.phone">{{ selectedOrgDetails.info?.Master_Credentials?.phone }}</p>
                </div>
              </div>
              <div class="bg-white rounded-lg p-4 border border-blue-100">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><BuildingIcon class="w-4 h-4" /> Organization Type</p>
                <p class="text-sm font-bold text-slate-900">{{ selectedOrgDetails.info?.Org_Type_Name || 'Not Set' }}</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-blue-100">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><MapPinIcon class="w-4 h-4" /> Region</p>
                <p class="text-sm font-bold text-slate-900">{{ selectedOrgDetails.info?.Region_Name || 'Not Set' }}</p>
              </div>
              <div class="md:col-span-2 bg-white rounded-lg p-4 border border-blue-100">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><PaletteIcon class="w-4 h-4" /> Theme Color</p>
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-lg border-2 border-blue-200 shadow-sm" :style="{ backgroundColor: selectedOrgDetails.info?.Theme_Color || '#1B8B3C' }"></div>
                  <p class="text-sm font-mono text-slate-900 font-bold">{{ selectedOrgDetails.info?.Theme_Color || '#1B8B3C' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- LOCATION & CONTACT Section -->
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-300">
            <h4 class="text-sm font-black text-amber-900 mb-4 flex items-center uppercase tracking-wider">
              <span class="w-3 h-3 bg-amber-600 rounded-full mr-2"></span>
              Location & Contact
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2 bg-white rounded-lg p-4 border border-amber-200">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><MapPinIcon class="w-4 h-4" /> Address</p>
                <p class="text-sm font-bold text-slate-900 leading-relaxed">{{ selectedOrgDetails.info?.Address || 'Not provided' }}</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-amber-200">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><PhoneIcon class="w-4 h-4" /> Phone</p>
                <p class="text-sm font-mono text-slate-900 font-bold">{{ selectedOrgDetails.info?.Phone_Num || '—' }}</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-amber-200">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><MailIcon class="w-4 h-4" /> Email</p>
                <p class="text-sm font-mono text-slate-900 font-bold truncate">{{ selectedOrgDetails.info?.Email || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- GEOFENCES Section -->
          <div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border-2 border-primary-300">
            <h4 class="text-sm font-black text-primary-900 mb-4 flex items-center uppercase tracking-wider">
              <span class="w-3 h-3 bg-primary-600 rounded-full mr-2"></span>
              Geofences ({{ selectedOrgDetails.geofences?.length || 0 }})
            </h4>
            <div v-if="selectedOrgDetails.geofences && selectedOrgDetails.geofences.length > 0" class="space-y-2 max-h-36 overflow-y-auto">
              <div v-for="geo in selectedOrgDetails.geofences" :key="geo.Geo_ID" class="bg-white rounded-lg p-3 border border-primary-200 flex items-center justify-between">
                <div class="flex-1">
                  <p class="font-bold text-slate-900 text-sm">{{ geo.Name }}</p>
                  <p class="text-xs text-slate-600 mt-1 font-mono">Lat: {{ geo.Latitude?.toFixed(4) }} | Lng: {{ geo.Longitude?.toFixed(4) }} | R: {{ geo.Radius }}m</p>
                </div>
                <span :class="geo.Is_Active ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-700'" class="px-2 py-1 rounded text-xs font-bold whitespace-nowrap ml-2 flex items-center gap-1">
                  <component :is="geo.Is_Active ? CheckIcon : XIcon" class="w-3 h-3" />
                  {{ geo.Is_Active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
            <div v-else class="text-center py-4 text-slate-500 text-sm bg-white rounded-lg border border-dashed border-primary-300">No geofences</div>
          </div>

          <!-- DEPARTMENTS Section -->
          <div class="bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-6 border-2 border-accent-300">
            <h4 class="text-sm font-black text-accent-900 mb-4 flex items-center uppercase tracking-wider">
              <span class="w-3 h-3 bg-accent-600 rounded-full mr-2"></span>
              Departments ({{ selectedOrgDetails.departments?.length || 0 }})
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-28 overflow-y-auto">
              <div v-for="dept in selectedOrgDetails.departments" :key="dept.Dep_ID" class="bg-white rounded-lg p-3 border border-accent-200 text-center">
                <p class="font-bold text-slate-900 text-xs truncate">{{ dept.Depart_Name }}</p>
                <p class="text-xs text-slate-600 mt-1 font-bold">{{ dept.staff_count }} staff</p>
              </div>
              <div v-if="!selectedOrgDetails.departments || selectedOrgDetails.departments.length === 0" class="col-span-full text-center text-slate-500 text-sm py-3 bg-white rounded-lg border border-dashed border-accent-300">
                No departments
              </div>
            </div>
          </div>

          <!-- USERS Section -->
          <div class="bg-gradient-to-br from-primary-50 to-primary-50 rounded-xl p-6 border-2 border-primary-200">
            <h4 class="text-sm font-black text-primary-900 mb-4 flex items-center uppercase tracking-wider">
              <span class="w-3 h-3 bg-primary-600 rounded-full mr-2"></span>
              Users ({{ selectedOrgDetails.users?.length || 0 }})
            </h4>
            <div class="space-y-2 max-h-28 overflow-y-auto">
              <div v-for="user in selectedOrgDetails.users" :key="user.User_ID" class="bg-white rounded-lg p-3 border border-primary-200 flex items-center justify-between text-xs">
                <div class="min-w-0 flex-1">
                  <p class="font-bold text-slate-900 truncate">{{ user.First_Name }} {{ user.SurName }}</p>
                  <p class="text-slate-600 truncate text-xs">{{ user.Email }}</p>
                </div>
                <span :class="user.Is_Active ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-600'" class="px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap ml-2 flex items-center gap-1">
                  <component :is="user.Is_Active ? CheckIcon : XIcon" class="w-3 h-3" />
                  {{ user.Is_Active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div v-if="!selectedOrgDetails.users || selectedOrgDetails.users.length === 0" class="text-center text-slate-500 text-sm py-3 bg-white rounded-lg border border-dashed border-primary-300">
                No users assigned
              </div>
            </div>
          </div>

          <!-- SUMMARY STATS -->
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-gradient-to-br from-[#1B8B3C]/10 to-[#1B8B3C]/5 rounded-lg p-4 border-2 border-[#1B8B3C]/30 text-center">
              <p class="text-xs font-black text-slate-600 uppercase tracking-wider">Check-ins Today</p>
              <p class="text-3xl font-black text-[#1B8B3C] mt-2">{{ selectedOrgDetails.stats?.checkinsToday || 0 }}</p>
            </div>
            <div class="bg-gradient-to-br from-accent-100 to-accent-50 rounded-lg p-4 border-2 border-accent-300 text-center">
              <p class="text-xs font-black text-slate-600 uppercase tracking-wider">Departments</p>
              <p class="text-3xl font-black text-accent-600 mt-2">{{ selectedOrgDetails.departments?.length || 0 }}</p>
            </div>
            <div class="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-4 border-2 border-blue-300 text-center">
              <p class="text-xs font-black text-slate-600 uppercase tracking-wider">Total Users</p>
              <p class="text-3xl font-black text-blue-600 mt-2">{{ selectedOrgDetails.users?.length || 0 }}</p>
            </div>
          </div>

          <!-- METADATA -->
          <div class="bg-slate-100 rounded-xl p-4 border-2 border-slate-300 text-xs text-slate-700">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="font-bold text-slate-800 flex items-center gap-1"><CalendarIcon class="w-4 h-4" /> Created:</p>
                <p>{{ formatDate(selectedOrgDetails.info?.Created_at) }}</p>
              </div>
              <div>
                <p class="font-bold text-slate-800 flex items-center gap-1"><PencilIcon class="w-4 h-4" /> Last Updated:</p>
                <p>{{ formatDate(selectedOrgDetails.info?.Updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer - Tab Navigation & Content -->
        <div class="border-t border-slate-200 shrink-0">
          <!-- Tab Bar -->
          <div class="flex border-b border-slate-200 bg-slate-50 px-8">
            <button
              @click="detailActionMode = 'password'"
              :class="detailActionMode === 'password' ? 'bg-white border-b-2 border-primary-500 text-primary-600' : 'text-slate-600 hover:text-slate-900'"
              class="px-4 py-3 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1"
            >
              <LockIcon class="w-4 h-4" /> Reset Admin Password
            </button>
            <button
              @click="detailActionMode = 'warning'"
              :class="detailActionMode === 'warning' ? 'bg-white border-b-2 border-yellow-500 text-yellow-600' : 'text-slate-600 hover:text-slate-900'"
              class="px-4 py-3 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1"
            >
              <AlertTriangleIcon class="w-4 h-4" />
              Warning
            </button>
            <button
              @click="detailActionMode = 'suspending'"
              :class="detailActionMode === 'suspending' ? 'bg-white border-b-2 border-primary-500 text-primary-600' : 'text-slate-600 hover:text-slate-900'"
              class="px-4 py-3 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1"
            >
              <PauseIcon class="w-4 h-4" />
              Suspending
            </button>
            <button
              @click="detailActionMode = 'delete'"
              :class="detailActionMode === 'delete' ? 'bg-white border-b-2 border-red-500 text-red-600' : 'text-slate-600 hover:text-slate-900'"
              class="px-4 py-3 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1"
            >
              <TrashIcon class="w-4 h-4" />
              Delete
            </button>
            <div class="flex-1"></div>
            <button
              @click="showDetailsModal = false"
              class="px-4 py-3 text-slate-600 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <XIcon class="w-4 h-4" /> Close
            </button>
          </div>

          <!-- Tab Content -->
          <div class="px-8 py-6 bg-white space-y-4">
            <!-- Message Display -->
            <div v-if="detailsErrorMessage || detailsSuccessMessage">
              <div v-if="detailsErrorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p class="text-sm font-bold text-red-700 flex items-center gap-1"><AlertCircleIcon class="w-4 h-4" /> {{ detailsErrorMessage }}</p>
              </div>
              <div v-if="detailsSuccessMessage" class="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-3">
                <p class="text-sm font-bold text-primary-700 flex items-center gap-1"><CheckCircleIcon class="w-4 h-4" /> {{ detailsSuccessMessage }}</p>
              </div>
            </div>

            <!-- Reset Admin Password Tab -->
            <div v-if="detailActionMode === 'password'" class="space-y-4">
              <h4 class="text-lg font-black text-primary-600 flex items-center gap-2"><LockIcon class="w-6 h-6" /> Reset Admin Password</h4>
              <div class="bg-primary-50 border-2 border-primary-200 rounded-lg p-4">
                <p class="text-sm font-bold text-primary-800 mb-3">Generate a new admin password for this organization's master account.</p>
                <button
                  @click="executeAdminPasswordReset"
                  :disabled="detailsActionLoading"
                  class="w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-bold uppercase tracking-widest hover:bg-primary-700 transition-all disabled:opacity-50"
                >
                  {{ detailsActionLoading ? 'Generating...' : 'Generate New Password' }}
                </button>
              </div>
            </div>

            <!-- Warning Tab -->
            <div v-if="detailActionMode === 'warning'" class="space-y-4">
              <h4 class="text-lg font-black text-yellow-700 flex items-center gap-2"><AlertTriangleIcon class="w-5 h-5" /> Send Warning</h4>
              <textarea
                v-model="detailActionData"
                placeholder="Enter warning message for this organization..."
                class="w-full px-4 py-2 rounded-lg border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                rows="3"
              ></textarea>
              <button
                @click="executeWarningAction"
                :disabled="detailsActionLoading"
                class="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold uppercase tracking-widest hover:bg-yellow-600 transition-all disabled:opacity-50"
              >
                {{ detailsActionLoading ? 'Sending...' : 'Send Warning' }}
              </button>
            </div>

            <!-- Suspending Tab -->
            <div v-if="detailActionMode === 'suspending'" class="space-y-4">
              <h4 class="text-lg font-black text-primary-700 flex items-center gap-2"><PauseIcon class="w-5 h-5" /> Suspension & Billing</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-lg p-4 border-2 border-primary-200">
                  <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Monthly Cost</p>
                  <p class="text-2xl font-black text-primary-600">${{ detailSpendingData?.monthlyCost || '0.00' }}</p>
                </div>
                <div class="bg-white rounded-lg p-4 border-2 border-blue-200">
                  <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Total Users</p>
                  <p class="text-2xl font-black text-blue-600">{{ detailSpendingData?.totalUsers || '0' }}</p>
                </div>
                <div class="bg-white rounded-lg p-4 border-2 border-accent-200">
                  <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Subscription</p>
                  <p class="text-sm font-bold text-slate-900">{{ detailSpendingData?.subscriptionType || 'Basic' }}</p>
                </div>
                <div class="bg-white rounded-lg p-4 border-2 border-amber-200">
                  <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Since Date</p>
                  <p class="text-xs font-bold text-slate-900">{{ formatDate(detailSpendingData?.subscriptionDate) }}</p>
                </div>
              </div>
            </div>

            <!-- Delete Tab -->
            <div v-if="detailActionMode === 'delete'" class="space-y-4">
              <h4 class="text-lg font-black text-red-700 flex items-center gap-2"><TrashIcon class="w-5 h-5" /> Delete Organization</h4>
              <div class="bg-red-100 border-2 border-red-300 rounded-lg p-4">
                <p class="text-sm font-bold text-red-800 flex items-start gap-2">
                  <AlertTriangleIcon class="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>This action is <span class="uppercase">PERMANENT</span> and cannot be undone!</span>
                </p>
                <p class="text-xs text-red-700 mt-2">All organization data, users, and records will be deleted.</p>
              </div>
              <button
                @click="executeDeleteAction"
                :disabled="detailsActionLoading"
                class="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-bold uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {{ detailsActionLoading ? 'Deleting...' : 'Yes, Delete Permanently' }}
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<style scoped>
table {
  width: 100%;
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { EyeIcon, KeyIcon, BuildingIcon, XIcon, MapPinIcon, PhoneIcon, MailIcon, BriefcaseIcon, PencilIcon, AlertCircleIcon, CheckCircleIcon, AlertTriangleIcon, CalendarIcon, PauseIcon, TrashIcon, CheckIcon, LockIcon, PaletteIcon } from 'lucide-vue-next'
import { superadminApi, uploadOrgLogo, deleteOrgLogo } from '@/services/superadminApi'
import { showDeleteConfirm, showSuccess, showError } from '@/utils/dialog'

// State
const loading = ref(true)
const organizations = ref([])
const showDetailsModal = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const selectedOrg = ref(null)
const selectedOrgDetails = ref(null)
const detailsActionLoading = ref(false)
const detailActionMode = ref(null) // 'password', 'warning', 'suspending', 'delete', or null
const detailActionData = ref('')
const detailSpendingData = ref(null)
const detailsErrorMessage = ref('')
const detailsSuccessMessage = ref('')

// Fetch organizations
const fetchOrganizations = async () => {
  try {
    loading.value = true
    console.log('Fetching organizations from backend...')
    console.log('Token:', localStorage.getItem('superAdminToken') ? 'Present' : 'Missing')
    
    const response = await superadminApi.get('/organizations')
    console.log('Organizations response:', response)
    organizations.value = response.data?.data || response.data?.organizations || response.data || []
  } catch (error) {
    console.error('Failed to fetch organizations - Full error:', error)
    console.error('Error response:', error.response)
    console.error('Error message:', error.message)
    
    let errorMsg = 'Error fetching organizations'
    if (error.response?.status === 401) {
      errorMsg += ': Unauthorized - Token may be expired'
    } else if (error.response?.data?.error) {
      errorMsg += ': ' + error.response.data.error
    } else {
      errorMsg += ': ' + (error.message || 'Unknown error')
    }
    console.error(errorMsg)
    alert(errorMsg)
  } finally {
    loading.value = false
  }
}

// Fetch organization details (departments, users, stats, geofences)
const fetchOrganizationDetails = async (orgId) => {
  try {
    // Fetch organization details (now includes geofences)
    const detailsResponse = await superadminApi.get(`/organizations/${orgId}/details`)
    const data = detailsResponse.data
    
    selectedOrgDetails.value = {
      info: data.info,
      departments: data.departments || [],
      users: data.users || [],
      geofences: data.geofences || [],
      stats: data.stats || { checkinsToday: 0 }
    }
  } catch (error) {
    console.error('Failed to fetch organization details:', error)
    alert('Error fetching organization details: ' + error.response?.data?.error || error.message)
  }
}

// Filter organizations
const filteredOrganizations = computed(() => {
  return organizations.value.filter((org) => {
    const matchesSearch =
      org.Org_Name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      org.Org_Domain.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus =
      filterStatus.value === '' ||
      (filterStatus.value === 'active' && org.Is_Active) ||
      (filterStatus.value === 'inactive' && !org.Is_Active)

    return matchesSearch && matchesStatus
  })
})

// Open admin password modal
const openAdminPasswordModal = (org) => {
  selectedOrg.value = org
  viewOrganizationDetails(org)
  setTimeout(() => {
    detailActionMode.value = 'password'
  }, 300)
}

// Execute admin password reset
const executeAdminPasswordReset = async () => {
  try {
    detailsActionLoading.value = true
    detailsErrorMessage.value = ''
    const response = await superadminApi.post(`/organizations/${selectedOrg.value.Org_ID}/reset-password`)
    detailsSuccessMessage.value = `Password reset successfully. New password: ${response.data.newPassword}`
    setTimeout(() => {
      detailsSuccessMessage.value = ''
      detailActionMode.value = null
    }, 5000)
  } catch (error) {
    console.error('Failed to reset password:', error)
    detailsErrorMessage.value = 'Could not reset admin password. Please try again.'
  } finally {
    detailsActionLoading.value = false
  }
}

// View organization details
const viewOrganizationDetails = async (org) => {
  selectedOrg.value = org
  selectedOrgDetails.value = null
  detailActionMode.value = null
  detailsErrorMessage.value = ''
  detailsSuccessMessage.value = ''
  showDetailsModal.value = true
  await fetchOrganizationDetails(org.Org_ID)
}

// View organization details with action mode pre-set
const viewOrganizationDetailsWithAction = async (org, actionMode) => {
  selectedOrg.value = org
  selectedOrgDetails.value = null
  detailActionMode.value = null
  detailsErrorMessage.value = ''
  detailsSuccessMessage.value = ''
  showDetailsModal.value = true
  await fetchOrganizationDetails(org.Org_ID)
  
  // Set action mode after details load
  setTimeout(() => {
    if (actionMode === 'warning') {
      triggerWarningAction()
    } else if (actionMode === 'suspending') {
      triggerSuspendingAction()
    } else if (actionMode === 'delete') {
      triggerDeleteAction()
    }
  }, 300)
}

// Open warning action in detail modal
const triggerWarningAction = () => {
  detailActionMode.value = 'warning'
  detailActionData.value = ''
  detailsErrorMessage.value = ''
  detailsSuccessMessage.value = ''
}

// Execute warning action
const executeWarningAction = async () => {
  if (!detailActionData.value.trim()) {
    detailsErrorMessage.value = 'Please enter a warning message'
    return
  }

  try {
    detailsActionLoading.value = true
    detailsErrorMessage.value = ''
    await superadminApi.post(`/organizations/${selectedOrg.value.Org_ID}/warning`, {
      message: detailActionData.value,
      sentAt: new Date().toISOString()
    })
    detailsSuccessMessage.value = 'Warning sent successfully'
    detailActionMode.value = null
    detailActionData.value = ''
  } catch (error) {
    console.error('Failed to send warning:', error)
    detailsErrorMessage.value = 'Could not send warning. Please try again.'
  } finally {
    detailsActionLoading.value = false
  }
}

// Open suspending action in detail modal
const triggerSuspendingAction = async () => {
  try {
    detailsActionLoading.value = true
    detailsErrorMessage.value = ''
    const response = await superadminApi.get(`/organizations/${selectedOrg.value.Org_ID}/spending`)
    detailSpendingData.value = response.data.spending
    detailActionMode.value = 'suspending'
  } catch (error) {
    console.error('Failed to fetch suspension data:', error)
    detailsErrorMessage.value = 'Could not load suspension data. Please try again.'
  } finally {
    detailsActionLoading.value = false
  }
}

// Open delete action in detail modal
const triggerDeleteAction = () => {
  detailActionMode.value = 'delete'
  detailsErrorMessage.value = ''
}

// Execute delete action
const executeDeleteAction = async () => {
  const confirmed = await showDeleteConfirm(`${selectedOrg.value.Org_Name} Organization`, async () => {
    try {
      detailsActionLoading.value = true
      detailsErrorMessage.value = ''
      await superadminApi.delete(`/organizations/${selectedOrg.value.Org_ID}`)
      detailsSuccessMessage.value = 'Organization deleted successfully'
      setTimeout(() => {
        showDetailsModal.value = false
        fetchOrganizations()
      }, 1500)
    } catch (error) {
      console.error('Failed to delete organization:', error)
      detailsErrorMessage.value = 'Could not delete organization. Please try again.'
      throw error
    } finally {
      detailsActionLoading.value = false
    }
  })
}

// Format date
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format logo path for display
const formatLogoPath = (logoPath) => {
  if (!logoPath) return null
  // If it's already a data URL, return as is
  if (logoPath.startsWith('data:')) {
    return logoPath
  }
  // If it's base64 without data: prefix, add it
  if (!logoPath.startsWith('http')) {
    return `data:image/png;base64,${logoPath}`
  }
  // Otherwise return as is (it's a URL)
  return logoPath
}

// Handle image load errors
const handleImageError = (event) => {
  console.error('Failed to load logo image')
  event.target.style.display = 'none'
}

// Handle logo upload
const handleLogoUpload = async (event, orgId) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    alert('Invalid image type. Allowed: PNG, JPEG, GIF, WebP')
    return
  }

  // Validate file size (max 500KB)
  if (file.size > 500 * 1024) {
    alert('Image size exceeds 500KB limit')
    return
  }

  try {
    // Convert file to base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const logoData = e.target.result
      
      try {
        await uploadOrgLogo(orgId, logoData, file.type)
        console.log('✅ Logo uploaded successfully')
        
        // Refresh the organization details
        await fetchOrganizationDetails(orgId)
        alert('Logo uploaded successfully!')
      } catch (error) {
        console.error('❌ Logo upload failed:', error)
        alert('Failed to upload logo: ' + (error.response?.data?.error || error.message))
      }
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('❌ Error processing logo:', error)
    alert('Error processing logo: ' + error.message)
  }
}

// Handle logo delete
const handleLogoDelete = async (orgId) => {
  if (!confirm('Are you sure you want to delete this logo?')) return

  try {
    await deleteOrgLogo(orgId)
    console.log('✅ Logo deleted successfully')
    
    // Refresh the organization details
    await fetchOrganizationDetails(orgId)
    alert('Logo deleted successfully!')
  } catch (error) {
    console.error('❌ Logo delete failed:', error)
    alert('Failed to delete logo: ' + (error.response?.data?.error || error.message))
  }
}

// Lifecycle
onMounted(() => {
  fetchOrganizations()
})
</script>
