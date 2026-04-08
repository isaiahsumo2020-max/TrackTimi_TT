<template>
  <div class="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden selection:bg-[#1B8B3C]/20 selection:text-[#1B8B3C]">
    
    <!-- 1. NOTIFICATION TOAST -->
    <Transition name="toast">
      <div v-if="notification.show" :class="[
        'fixed top-6 right-6 z-[200] px-6 py-4 rounded-lg font-black text-white flex items-center space-x-3 shadow-2xl animate-in slide-in-from-top',
        notification.type === 'success' ? 'bg-[#1B8B3C]' : 'bg-red-500'
      ]">
        <CheckIcon v-if="notification.type === 'success'" class="w-5 h-5" />
        <XCircleIcon v-else class="w-5 h-5" />
        <span class="text-sm uppercase tracking-widest">{{ notification.message }}</span>
      </div>
    </Transition>

    <!-- 2. NAVIGATION SIDEBAR -->
    <aside 
      :class="[sidebarOpen ? 'w-72' : 'w-20', 'bg-[#1B8B3C] text-white shadow-2xl transition-all duration-500 ease-in-out flex flex-col z-40']"
    >
      <div class="p-6 border-b border-[#156B2E] flex items-center justify-between h-24">
        <div v-if="sidebarOpen" class="flex items-center space-x-3 animate-in fade-in">
          <div class="w-10 h-10 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B35]/20">
            <ZapIcon class="w-6 h-6 text-white fill-white" />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-black tracking-tighter uppercase leading-none italic">TrackTimi</span>
            <span class="text-[8px] font-black text-[#4ADE80] uppercase tracking-[0.4em] mt-1">Platform Admin</span>
          </div>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-xl bg-[#156B2E] hover:bg-[#0F5124] border border-[#156B2E] transition-all">
          <MenuIcon v-if="!sidebarOpen" class="w-5 h-5 text-green-200" />
          <ChevronLeftIcon v-else class="w-5 h-5 text-green-200" />
        </button>
      </div>

      <nav class="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex items-center space-x-4 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all group"
          :class="[$route.path === item.path ? 'bg-[#FF6B35] text-white shadow-xl shadow-[#FF6B35]/40' : 'text-green-100 hover:bg-[#156B2E] hover:text-white']"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- 3. MAIN WORKSPACE -->
    <main class="flex-1 flex flex-col min-w-0 relative">
      <header class="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20">
        <div>
          <h1 class="text-2xl font-black text-[#1B8B3C] tracking-tight italic uppercase">Organization Management</h1>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Create, Edit & Manage All Organizations</p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="relative group">
            <SearchIcon class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#1B8B3C] transition-colors" />
            <input v-model="searchQuery" placeholder="Filter by Name or Domain..." 
              class="pl-14 pr-6 py-4 bg-slate-50 border-none rounded-lg text-[11px] font-bold shadow-sm w-80 focus:ring-4 focus:ring-[#1B8B3C]/20 transition-all outline-none" />
          </div>
          <button @click="loadOrganizations" :disabled="loading" class="p-4 bg-[#1B8B3C] text-white rounded-lg hover:bg-[#156B2E] transition-all active:scale-90 shadow-lg">
             <RefreshCwIcon :class="{'animate-spin': loading}" class="w-5 h-5" />
          </button>
          <button @click="showCreateModal = true" class="px-6 py-4 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E55A25] font-black text-xs uppercase tracking-widest flex items-center space-x-2 shadow-lg active:scale-95">
            <PlusIcon class="w-5 h-5" />
            <span>New Organization</span>
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar animate-in fade-in duration-1000">
        
        <div class="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white border-b border-slate-50">
                  <th class="px-10 py-6">Organization</th>
                  <th class="px-10 py-6">Domain</th>
                  <th class="px-10 py-6 text-center">Members</th>
                  <th class="px-10 py-6 text-center">Status</th>
                  <th class="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="org in filteredOrgs" :key="org.Org_ID" class="group hover:bg-[#1B8B3C]/5 transition-all duration-300">
                  <td class="px-10 py-8">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 bg-[#1B8B3C] text-white rounded-lg flex items-center justify-center font-black text-lg shadow-xl group-hover:rotate-6 transition-transform uppercase">
                        {{ org.Org_Name[0] }}
                      </div>
                      <div>
                        <p class="text-sm font-black text-[#000000] leading-none mb-1.5">{{ org.Org_Name }}</p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase">ID: ORG-{{ org.Org_ID }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-10 py-8 font-mono text-[11px] font-black text-[#1B8B3C] uppercase tracking-tighter">
                    {{ org.Org_Domain }}.tracktimi.com
                  </td>
                  <td class="px-10 py-8">
                    <div class="flex flex-col items-center space-y-2">
                       <span class="text-xs font-black text-[#000000]">{{ org.userCount || 0 }} Members</span>
                       <div class="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div class="h-full bg-[#1B8B3C]" :style="{ width: Math.min((org.userCount/50)*100, 100) + '%' }"></div>
                       </div>
                    </div>
                  </td>
                  <td class="px-10 py-8 text-center">
                    <div v-if="org.Is_Active" class="inline-flex items-center px-4 py-2 bg-[#1B8B3C]/10 text-[#1B8B3C] rounded-full border border-[#1B8B3C]/20">
                      <div class="w-1.5 h-1.5 bg-[#1B8B3C] rounded-full mr-2 animate-pulse"></div>
                      <span class="text-[9px] font-black uppercase tracking-widest">Active</span>
                    </div>
                    <div v-else class="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-full border border-red-100">
                      <span class="text-[9px] font-black uppercase tracking-widest">Inactive</span>
                    </div>
                  </td>
                  <td class="px-10 py-8 text-right">
                    <div class="flex items-center justify-end space-x-2">
                      <button @click="startEditOrg(org)" class="px-4 py-3 bg-slate-100 text-[#1B8B3C] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1B8B3C] hover:text-white transition-all active:scale-95">
                        <EditIcon class="w-4 h-4" />
                      </button>
                      <button @click="loadOrgDetails(org.Org_ID)" class="px-6 py-3 bg-[#FF6B35] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#E55A25] transition-all active:scale-95 shadow-lg">
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="organizations.length === 0" class="py-32 text-center opacity-30 italic text-sm font-black uppercase tracking-[0.4em]">No Organizations</div>
        </div>
      </div>

      <!-- 4. CREATE ORGANIZATION MODAL -->
      <Transition name="modal">
        <div v-if="showCreateModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-in zoom-in-95 duration-300">
            <div class="mb-8">
              <h2 class="text-2xl font-black text-[#1B8B3C] uppercase tracking-tight mb-2">Create Organization</h2>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Add a new customer organization</p>
            </div>
            
            <div class="space-y-5 mb-8">
              <div>
                <label class="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3">Organization Name *</label>
                <input v-model="newOrgForm.Org_Name" placeholder="Enter organization name" 
                  class="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-[#1B8B3C] focus:ring-4 focus:ring-[#1B8B3C]/10 outline-none transition-all font-semibold" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3">Domain *</label>
                <input v-model="newOrgForm.Org_Domain" placeholder="subdomain" 
                  class="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-[#1B8B3C] focus:ring-4 focus:ring-[#1B8B3C]/10 outline-none transition-all font-semibold" />
                <p class="text-[9px] text-slate-400 mt-2"><span class="font-black">{{ newOrgForm.Org_Domain }}.tracktimi.com</span></p>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3">Theme Color</label>
                <div class="flex items-center space-x-3">
                  <input v-model="newOrgForm.Theme_Color" type="color" class="w-16 h-12 rounded-xl cursor-pointer border-2 border-slate-200" />
                  <span class="text-[11px] font-mono font-bold text-slate-600">{{ newOrgForm.Theme_Color || '#1B8B3C' }}</span>
                </div>
              </div>
            </div>

            <div class="flex space-x-3">
              <button @click="showCreateModal = false" class="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button @click="handleCreateSubmit" :disabled="operationLoading" class="flex-1 px-4 py-3 bg-[#FF6B35] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#E55A25] active:scale-95 transition-all disabled:opacity-50">
                {{ operationLoading ? 'Creating...' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 5. EDIT ORGANIZATION MODAL -->
      <Transition name="modal">
        <div v-if="showEditModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-in zoom-in-95 duration-300">
            <div class="mb-8">
              <h2 class="text-2xl font-black text-[#1B8B3C] uppercase tracking-tight mb-2">Edit Organization</h2>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Update organization details</p>
            </div>
            
            <div class="space-y-5 mb-8">
              <div>
                <label class="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3">Organization Name</label>
                <input v-model="editOrgForm.Org_Name" placeholder="Enter organization name" 
                  class="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-[#1B8B3C] focus:ring-4 focus:ring-[#1B8B3C]/10 outline-none transition-all font-semibold" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3">Domain</label>
                <input v-model="editOrgForm.Org_Domain" placeholder="subdomain" 
                  class="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:border-[#1B8B3C] focus:ring-4 focus:ring-[#1B8B3C]/10 outline-none transition-all font-semibold" />
                <p class="text-[9px] text-slate-400 mt-2"><span class="font-black">{{ editOrgForm.Org_Domain }}.tracktimi.com</span></p>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3">Theme Color</label>
                <div class="flex items-center space-x-3">
                  <input v-model="editOrgForm.Theme_Color" type="color" class="w-16 h-12 rounded-xl cursor-pointer border-2 border-slate-200" />
                  <span class="text-[11px] font-mono font-bold text-slate-600">{{ editOrgForm.Theme_Color }}</span>
                </div>
              </div>
            </div>

            <div class="flex space-x-3">
              <button @click="showEditModal = false" class="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button @click="handleEditSubmit" :disabled="operationLoading" class="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50">
                {{ operationLoading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 6. ORGANIZATION MANAGEMENT DRAWER -->
      <Transition name="drawer">
        <div v-if="showManagementDrawer && selectedOrg" class="absolute inset-y-0 right-0 w-[700px] bg-white shadow-[-50px_0_100px_rgba(0,0,0,0.3)] z-50 flex flex-col border-l border-slate-100">
          <div class="h-40 bg-[#1B8B3C] text-white flex items-center justify-between px-10 relative overflow-hidden shrink-0">
            <div class="relative z-10">
              <span class="text-[9px] font-black text-[#4ADE80] uppercase tracking-[0.5em] mb-2 block">Organization Management</span>
              <h2 class="text-3xl font-black tracking-tighter uppercase">{{ selectedOrg.info.Org_Name }}</h2>
              <div class="flex items-center space-x-3 mt-3">
                 <span class="text-[10px] font-bold text-white/80 font-mono tracking-tighter">{{ selectedOrg.info.Org_Domain }}.tracktimi.com</span>
                 <div :class="selectedOrg.info.Is_Active ? 'bg-[#4ADE80]' : 'bg-red-500'" class="w-2.5 h-2.5 rounded-full"></div>
              </div>
            </div>
            <button @click="showManagementDrawer = false" class="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all relative z-10">
                <XIcon class="w-6 h-6 text-white" />
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
            <!-- Control Buttons -->
            <div class="grid grid-cols-2 gap-4">
              <button @click="handleToggleStatus(selectedOrg.info.Org_ID, selectedOrg.info.Is_Active)" :disabled="operationLoading"
                :class="selectedOrg.info.Is_Active ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-[#1B8B3C]/10 text-[#1B8B3C] border-[#1B8B3C]/20 hover:bg-[#1B8B3C]/20'"
                class="py-5 rounded-lg font-black text-[10px] uppercase tracking-widest border transition-all disabled:opacity-50">
                {{ selectedOrg.info.Is_Active ? '🚫 Deactivate' : '✅ Activate' }}
              </button>
              <button @click="handleDeleteOrg(selectedOrg.info.Org_ID)" :disabled="operationLoading" class="bg-red-600 text-white py-5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50">
                🗑️ Delete Org
              </button>
            </div>

            <!-- Departments Section -->
            <section>
              <h3 class="text-xs font-black text-[#000000] uppercase tracking-widest mb-6 flex items-center">
                <LayoutGridIcon class="w-4 h-4 mr-2 text-[#1B8B3C]" /> Departments
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="dept in selectedOrg.departments" :key="dept.Dep_ID" class="p-6 bg-[#1B8B3C]/5 rounded-3xl border border-[#1B8B3C]/20 hover:border-[#1B8B3C]/40 transition-all">
                   <p class="text-xs font-black text-[#000000] truncate uppercase">{{ dept.Depart_Name }}</p>
                   <p class="text-[9px] font-bold text-slate-400 uppercase mt-1">{{ dept.staff_count }} Personnel</p>
                </div>
                <div v-if="selectedOrg.departments.length === 0" class="col-span-2 text-center py-10 bg-slate-50 rounded-3xl opacity-30 italic text-xs">No departments</div>
              </div>
            </section>

            <!-- Members Section -->
            <section>
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xs font-black text-[#000000] uppercase tracking-widest flex items-center">
                  <UsersIcon class="w-4 h-4 mr-2 text-[#1B8B3C]" /> Members
                </h3>
              </div>
              
              <!-- Add User Section -->
              <div class="mb-6 p-5 bg-[#1B8B3C]/5 rounded-lg border border-[#1B8B3C]/20">
                <label class="block text-[9px] font-black text-slate-700 uppercase tracking-widest mb-3">Assign User to Organization</label>
                <div class="flex space-x-2">
                  <input v-model="selectedUserToAdd" placeholder="User ID" type="number"
                    class="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#1B8B3C] outline-none text-sm font-semibold" />
                  <button @click="handleAssignUser" :disabled="operationLoading || !selectedUserToAdd" class="px-5 py-3 bg-[#1B8B3C] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#156B2E] active:scale-95 transition-all disabled:opacity-50">
                    <UserPlusIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Users List -->
              <div class="space-y-3">
                <div v-for="user in selectedOrg.users" :key="user.User_ID" class="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-lg hover:border-[#1B8B3C]/40 transition-all group">
                  <div class="flex items-center space-x-4 flex-1 min-w-0">
                    <div class="w-10 h-10 bg-[#1B8B3C] text-white rounded-xl flex items-center justify-center font-black text-xs shrink-0">{{ user.First_Name[0] }}</div>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-black text-[#000000] truncate">{{ user.First_Name }} {{ user.SurName }}</p>
                      <p class="text-[9px] font-medium text-slate-400 truncate">{{ user.Email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-3 ml-4 shrink-0">
                    <span class="text-[9px] font-black text-[#1B8B3C] uppercase tracking-widest">{{ user.Job_Title || 'Staff' }}</span>
                    <button @click="handleRemoveUser(user.User_ID)" :disabled="operationLoading" class="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all active:scale-90 disabled:opacity-50 opacity-0 group-hover:opacity-100">
                      <UserMinusIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div v-if="selectedOrg.users.length === 0" class="text-center py-8 bg-slate-50 rounded-lg opacity-30 italic text-xs">No members assigned</div>
              </div>
            </section>
          </div>
        </div>
      </Transition>

      <!-- Loading Overlay -->
      <div v-if="loading && !showManagementDrawer" class="fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
       <div class="bg-[#1B8B3C] p-6 rounded-3xl shadow-3xl flex items-center space-x-4 text-white border border-white/10 animate-in zoom-in">
          <RefreshCwIcon class="w-5 h-5 animate-spin text-[#FF6B35]" />
          <span class="text-[10px] font-black uppercase tracking-[0.4em]">Loading Organizations</span>
       </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  ZapIcon, MenuIcon, ChevronLeftIcon, BuildingIcon, 
  UsersIcon, SearchIcon, RefreshCwIcon, XIcon, LayoutGridIcon,
  PlusIcon, EditIcon, TrashIcon, CheckIcon, XCircleIcon, UserPlusIcon, UserMinusIcon
} from 'lucide-vue-next'
import {
  getOrganizations, getOrgDetails, createOrganization, updateOrganization, 
  deleteOrganization, toggleOrgStatus, assignUserToOrg, removeUserFromOrg
} from '@/services/superadminApi'

const sidebarOpen = ref(true)
const loading = ref(false)
const searchQuery = ref('')
const organizations = ref([])
const selectedOrg = ref(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showManagementDrawer = ref(false)
const operationLoading = ref(false)
const notification = ref({ show: false, message: '', type: 'success' })

// Form states
const newOrgForm = ref({ Org_Name: '', Org_Domain: '', Theme_Color: '' })
const editOrgForm = ref({ Org_ID: '', Org_Name: '', Org_Domain: '', Theme_Color: '' })
const selectedUserToAdd = ref('')
const availableUsers = ref([])

const navItems = [
  { name: 'Dashboard', path: '/superadmin', icon: ZapIcon },
  { name: 'Network Tenants', path: '/superadmin/organizations', icon: BuildingIcon },
]

const filteredOrgs = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return organizations.value.filter(o => o.Org_Name.toLowerCase().includes(query) || o.Org_Domain.toLowerCase().includes(query))
})

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => notification.value.show = false, 3000)
}

const loadOrganizations = async () => {
  loading.value = true
  try {
    const res = await getOrganizations()
    organizations.value = res.organizations || []
  } catch (err) {
    showNotification('Failed to load organizations: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}

const loadOrgDetails = async (id) => {
  loading.value = true
  try {
    const res = await getOrgDetails(id)
    selectedOrg.value = res
    showManagementDrawer.value = true
  } catch (err) {
    showNotification('Failed to load org details: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}

const handleCreateSubmit = async () => {
  if (!newOrgForm.value.Org_Name || !newOrgForm.value.Org_Domain) {
    showNotification('Organization name and domain are required', 'error')
    return
  }
  
  operationLoading.value = true
  try {
    await createOrganization({
      Org_Name: newOrgForm.value.Org_Name,
      Org_Domain: newOrgForm.value.Org_Domain,
      Theme_Color: newOrgForm.value.Theme_Color || '#D97A2B'
    })
    showNotification('Organization created successfully', 'success')
    newOrgForm.value = { Org_Name: '', Org_Domain: '', Theme_Color: '' }
    showCreateModal.value = false
    await loadOrganizations()
  } catch (err) {
    showNotification('Creation failed: ' + err.message, 'error')
  } finally {
    operationLoading.value = false
  }
}

const startEditOrg = (org) => {
  editOrgForm.value = {
    Org_ID: org.Org_ID,
    Org_Name: org.Org_Name,
    Org_Domain: org.Org_Domain,
    Theme_Color: org.Theme_Color || '#D97A2B'
  }
  showEditModal.value = true
}

const handleEditSubmit = async () => {
  operationLoading.value = true
  try {
    await updateOrganization(editOrgForm.value.Org_ID, {
      Org_Name: editOrgForm.value.Org_Name,
      Org_Domain: editOrgForm.value.Org_Domain,
      Theme_Color: editOrgForm.value.Theme_Color
    })
    showNotification('Organization updated successfully', 'success')
    showEditModal.value = false
    await loadOrganizations()
    if (selectedOrg.value?.info.Org_ID === editOrgForm.value.Org_ID) {
      await loadOrgDetails(editOrgForm.value.Org_ID)
    }
  } catch (err) {
    showNotification('Update failed: ' + err.message, 'error')
  } finally {
    operationLoading.value = false
  }
}

const handleToggleStatus = async (id, current) => {
  if (!confirm('Are you sure you want to ' + (current ? 'deactivate' : 'activate') + ' this organization?')) return
  
  operationLoading.value = true
  try {
    await toggleOrgStatus(id, !current)
    showNotification('Organization status updated', 'success')
    await loadOrganizations()
    if (selectedOrg.value?.info.Org_ID === id) {
      await loadOrgDetails(id)
    }
  } catch (err) {
    showNotification('Status update failed: ' + err.message, 'error')
  } finally {
    operationLoading.value = false
  }
}

const handleDeleteOrg = async (id) => {
  if (!confirm('⚠️ Are you sure? This will permanently delete the organization and all its data.')) return
  
  operationLoading.value = true
  try {
    await deleteOrganization(id)
    showNotification('Organization deleted successfully', 'success')
    selectedOrg.value = null
    showManagementDrawer.value = false
    await loadOrganizations()
  } catch (err) {
    showNotification('Delete failed: ' + err.message, 'error')
  } finally {
    operationLoading.value = false
  }
}

const handleAssignUser = async () => {
  if (!selectedUserToAdd.value) {
    showNotification('Please select a user', 'error')
    return
  }
  
  operationLoading.value = true
  try {
    await assignUserToOrg(selectedOrg.value.info.Org_ID, selectedUserToAdd.value)
    showNotification('User assigned to organization', 'success')
    selectedUserToAdd.value = ''
    await loadOrgDetails(selectedOrg.value.info.Org_ID)
  } catch (err) {
    showNotification('Assignment failed: ' + err.message, 'error')
  } finally {
    operationLoading.value = false
  }
}

const handleRemoveUser = async (userId) => {
  if (!confirm('Remove this user from the organization?')) return
  
  operationLoading.value = true
  try {
    await removeUserFromOrg(selectedOrg.value.info.Org_ID, userId)
    showNotification('User removed from organization', 'success')
    await loadOrgDetails(selectedOrg.value.info.Org_ID)
  } catch (err) {
    showNotification('Removal failed: ' + err.message, 'error')
  } finally {
    operationLoading.value = false
  }
}

onMounted(loadOrganizations)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

/* Drawer Transitions */
.drawer-enter-active, .drawer-leave-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); opacity: 0; }

/* Modal Transitions */
.modal-enter-active, .modal-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-enter-from, .modal-leave-to { transform: scale(0.95); opacity: 0; }

/* Toast Transitions */
.toast-enter-active, .toast-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.toast-enter-from, .toast-leave-to { transform: translateY(-100%); opacity: 0; }
</style>
