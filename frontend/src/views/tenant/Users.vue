<template>
  <div class="p-6 lg:p-10 max-w-7xl mx-auto min-h-screen bg-[#FDFDFD] space-y-10 animate-in fade-in duration-700">
    
    <!-- 1. Header & Quick Stats -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-4">
        <div class="space-y-1">
          <p class="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Team Management</p>
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">Employee Directory</h1>
        </div>
        
        <!-- Mini Stats Strip -->
        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-2">
            <span class="text-xl font-black text-slate-900">{{ users.length }}</span>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Employees</span>
          </div>
          <div class="w-px h-4 bg-slate-200"></div>
          <div class="flex items-center space-x-2">
            <span class="text-xl font-black text-green-600">{{ activeCount }}</span>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Now</span>
          </div>
        </div>
      </div>

      <button @click="showCreateModal = true" class="px-8 py-4 bg-primary-600 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 active:scale-95 flex items-center">
        <PlusIcon class="w-4 h-4 mr-2" />
        Invite Member
      </button>
    </div>

    <!-- 2. Search & Filter Bar -->
    <div class="flex flex-col md:flex-row gap-4">
      <div class="relative flex-1 group">
        <SearchIcon class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-600 transition-colors" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by name, email, or employee ID..." 
          class="w-full pl-12 pr-6 py-4 bg-primary-50 border border-primary-200 rounded-lg text-sm font-medium focus:ring-4 focus:ring-primary-100 outline-none transition-all shadow-sm"
        />
      </div>
      <select v-model="filterStatus" class="px-6 py-4 bg-primary-50 border border-primary-200 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 outline-none shadow-sm">
        <option value="all">All Status</option>
        <option value="active">Active Only</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <!-- 3. Live Grid / Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Skeleton Loader -->
      <div v-for="i in 6" :key="i" class="bg-primary-50 h-64 rounded-2xl animate-pulse"></div>
    </div>

    <div v-else class="space-y-0 bg-primary-50 rounded-2xl border border-primary-200 shadow-sm overflow-hidden">
      <!-- Empty State -->
      <div v-if="filteredUsers.length === 0" class="py-32 text-center space-y-4">
        <div class="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto">
          <UsersIcon class="w-8 h-8 text-primary-300" />
        </div>
        <p class="text-sm font-black text-slate-400 uppercase tracking-widest">No employees found</p>
      </div>

      <!-- List Header -->
      <div v-if="filteredUsers.length > 0" class="grid grid-cols-12 gap-4 px-8 py-5 bg-primary-100 border-b border-primary-200 sticky top-0">
        <div class="col-span-4 text-xs font-black text-slate-400 uppercase tracking-widest">Employee</div>
        <div class="col-span-3 text-xs font-black text-slate-400 uppercase tracking-widest">Email</div>
        <div class="col-span-2 text-xs font-black text-slate-400 uppercase tracking-widest">Department</div>
        <div class="col-span-2 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</div>
        <div class="col-span-1 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</div>
      </div>

      <!-- User List Items -->
      <div v-for="(user, idx) in filteredUsers" :key="user.User_ID" 
        class="grid grid-cols-12 gap-4 px-8 py-6 border-b border-primary-100 hover:bg-primary-100/50 transition-colors items-center"
        :class="idx === filteredUsers.length - 1 ? 'border-b-0' : ''">
        
        <!-- Name & Avatar -->
        <div class="col-span-4 flex items-center space-x-3">
          <div v-if="user?.avatar" class="w-10 h-10 bg-slate-900 text-white rounded-xl overflow-hidden flex-shrink-0">
            <img :src="`data:${user.avatarMimeType};base64,${user.avatar}`" :alt="`${user.firstName} ${user.surName}`" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0">
            {{ user?.firstName?.[0] || '?' }}{{ user?.surName?.[0] || '' }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-black text-slate-900 truncate">{{ user.firstName }} {{ user.surName }}</p>
            <p class="text-xs text-slate-400 font-bold">#{{ user.employeeId || 'PENDING' }}</p>
          </div>
        </div>

        <!-- Email -->
        <div class="col-span-3">
          <p class="text-sm text-slate-500 font-medium truncate">{{ user.email }}</p>
        </div>

        <!-- Department -->
        <div class="col-span-2">
          <p class="text-xs font-black text-primary-600 uppercase tracking-tight">{{ user.jobTitle || 'Team Member' }}</p>
        </div>

        <!-- Status -->
        <div class="col-span-2 flex justify-center">
          <div class="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span class="text-xs font-black text-green-700 uppercase">Active</span>
          </div>
        </div>

        <!-- Action Menu -->
        <div class="col-span-1 flex justify-end">
          <div class="relative group/menu pointer-events-auto">
            <button @click.stop="toggleUserMenu(user.User_ID)" class="p-2 text-slate-300 hover:text-primary-600 transition-colors cursor-pointer pointer-events-auto">
              <MoreHorizontalIcon class="w-5 h-5" />
            </button>
            <!-- Dropdown Menu -->
            <div v-if="activeUserMenu === user.User_ID" 
              @click.stop="e => e.stopPropagation()"
              class="absolute right-0 top-full mt-2 w-48 bg-primary-50 rounded-xl shadow-lg border border-primary-200 z-50 pointer-events-auto">
              <button @click.stop="viewUserProfile(user)" class="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-primary-100 flex items-center gap-2 border-b border-primary-100 transition-colors cursor-pointer pointer-events-auto">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                View Profile
              </button>
              <button @click.stop="editUserProfile(user)" class="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-primary-100 flex items-center gap-2 border-b border-primary-100 transition-colors cursor-pointer pointer-events-auto">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
              <button @click.stop="openDeleteModal(user)" class="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer pointer-events-auto">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <Transition name="modal">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="showCreateModal = false"></div>
        <div class="bg-primary-50 rounded-2xl p-12 max-w-xl w-full shadow-2xl relative z-10 animate-in zoom-in duration-300">
           <div class="flex justify-between items-start mb-10">
             <div class="space-y-1">
               <h2 class="text-3xl font-black text-slate-900 tracking-tight">Invite Member</h2>
               <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Send invitation email to new team member</p>
             </div>
             <button @click="showCreateModal = false" class="p-2 hover:bg-primary-100 rounded-xl transition-colors">
               <XIcon class="w-6 h-6 text-slate-400" />
             </button>
           </div>
           <AdminUserCreate @success="handleUserCreated" />
        </div>
      </div>
    </Transition>

    <!-- User Profile Modal -->
    <Transition name="modal">
      <div v-if="showProfileModal" class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="closeProfileModal"></div>
        <div class="bg-primary-50 rounded-2xl p-12 max-w-2xl w-full shadow-2xl relative z-10 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-10">
            <div class="space-y-2">
              <h2 class="text-3xl font-black text-slate-900 tracking-tight">{{ selectedUser?.firstName }} {{ selectedUser?.surName }}</h2>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ selectedUser?.email }}</p>
            </div>
            <button @click="closeProfileModal" class="p-2 hover:bg-primary-100 rounded-xl transition-colors">
              <XIcon class="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <!-- Tabs -->
          <div class="mb-6 flex border-b border-primary-200">
            <button @click="profileTab = 'view'"
                    :class="profileTab === 'view' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-600'"
                    class="px-4 py-2 font-medium text-sm">
              Profile
            </button>
            <button @click="profileTab = 'avatar'"
                    :class="profileTab === 'avatar' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-600'"
                    class="px-4 py-2 font-medium text-sm">
              Avatar
            </button>
            <button @click="profileTab = 'edit'"
                    :class="profileTab === 'edit' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-600'"
                    class="px-4 py-2 font-medium text-sm">
              Edit Profile
            </button>
            <button @click="profileTab = 'password'"
                    :class="profileTab === 'password' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-600'"
                    class="px-4 py-2 font-medium text-sm">
              Change Password
            </button>
            <button @click="openShiftTab"
                    :class="profileTab === 'shift' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-600'"
                    class="px-4 py-2 font-medium text-sm">
              Manage Shift
            </button>
          </div>

          <!-- View Profile Tab -->
          <div v-if="profileTab === 'view'" class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-primary-100 p-4 rounded-xl">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">First Name</p>
                <p class="text-sm font-black text-slate-900">{{ selectedUser?.firstName }}</p>
              </div>
              <div class="bg-primary-100 p-4 rounded-xl">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Last Name</p>
                <p class="text-sm font-black text-slate-900">{{ selectedUser?.surName }}</p>
              </div>
            </div>
            <div class="bg-primary-100 p-4 rounded-xl">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
              <p class="text-sm font-black text-slate-900">{{ selectedUser?.email }}</p>
            </div>
            <div class="bg-primary-100 p-4 rounded-xl">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Job Title</p>
              <p class="text-sm font-black text-slate-900">{{ selectedUser?.jobTitle || 'N/A' }}</p>
            </div>
            <div class="bg-primary-100 p-4 rounded-xl">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Employee ID</p>
              <p class="text-sm font-black text-slate-900">{{ selectedUser?.employeeId || 'PENDING' }}</p>
            </div>
            <div class="flex gap-3 pt-4">
              <button @click="closeProfileModal" class="flex-1 py-3 bg-primary-200 text-primary-800 rounded-xl font-bold hover:bg-primary-300 transition">
                Close
              </button>
            </div>
          </div>

          <!-- Avatar Tab -->
          <div v-if="profileTab === 'avatar'" class="space-y-6">
            <!-- Current Avatar -->
            <div class="flex flex-col items-center mb-6">
              <div v-if="selectedUser?.avatar" class="w-32 h-32 rounded-lg overflow-hidden shadow-lg mb-4">
                <img :src="`data:${selectedUser.avatarMimeType};base64,${selectedUser.avatar}`" :alt="`${selectedUser.firstName} ${selectedUser.surName}`" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-32 h-32 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-5xl shadow-lg mb-4">
                {{ selectedUser?.firstName?.[0] }}{{ selectedUser?.surName?.[0] }}
              </div>
              <p class="text-sm text-slate-600 text-center">Current Avatar</p>
            </div>

            <!-- Preview Mode -->
            <div v-if="!avatarPreview" class="space-y-4">
              <div class="bg-primary-100 p-8 rounded-xl border-2 border-dashed border-primary-300 text-center cursor-pointer hover:border-primary-600 hover:bg-primary-50 transition"
                   @click="$refs.avatarInput.click()">
                <svg class="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <p class="text-sm font-bold text-slate-700">Click to upload or drag and drop</p>
                <p class="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 2MB</p>
                <input 
                  ref="avatarInput"
                  type="file" 
                  accept="image/*" 
                  class="hidden"
                  @change="handleAvatarFileSelect"
                />
              </div>
            </div>

            <!-- Resize/Crop Mode -->
            <div v-if="avatarPreview" class="space-y-4">
              <!-- Image Display with Crop Area -->
              <div class="bg-primary-100 rounded-xl overflow-hidden relative cursor-crosshair">
                <img 
                  :src="avatarPreview"
                  :style="{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain'
                  }"
                  class="w-full"
                  @mousedown="startCropDrag"
                  @mousemove="handleCropDrag"
                  @mouseup="endCropDrag"
                  @mouseleave="endCropDrag"
                />
              </div>

              <!-- Crop Info -->
              <div class="bg-blue-50 p-3 rounded-xl border border-primary-200">
                <p class="text-xs text-blue-700 font-bold">Drag on the image to select the area you want to use as your avatar</p>
              </div>

              <!-- Preview Size Info -->
              <div v-if="avatarFileSize" class="bg-primary-100 p-3 rounded-xl border border-primary-200">
                <p class="text-xs text-slate-700 font-bold">Original: {{ (avatarFileSize / 1024).toFixed(2) }} KB</p>
              </div>

              <!-- Preview Canvas (Hidden but used for processing) -->
              <canvas 
                ref="avatarCanvas"
                width="256"
                height="256"
                class="hidden"
              />
              <div class="w-full h-32 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl border-2 border-primary-200 overflow-hidden flex items-center justify-center">
                <div class="text-center">
                  <p class="text-xs font-bold text-slate-600 mb-2">Preview (256x256)</p>
                  <div id="previewBox" class="w-24 h-24 bg-primary-50 rounded-lg shadow-md border-2 border-primary-300 overflow-hidden"></div>
                </div>
              </div>

              <!-- Error Display -->
              <div v-if="avatarError" class="bg-red-50 p-4 rounded-xl border border-red-200">
                <p class="text-sm text-red-700 font-bold">{{ avatarError }}</p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4">
                <button @click="cancelAvatarUpload" class="flex-1 py-3 bg-primary-200 text-primary-800 rounded-xl font-bold hover:bg-primary-300 transition">
                  Cancel
                </button>
                <button @click="saveAvatarUpload" :disabled="loading" class="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition disabled:opacity-50">
                  {{ loading ? 'Saving...' : 'Save Avatar' }}
                </button>
              </div>
            </div>

            <!-- Default Buttons -->
            <div v-if="!avatarPreview" class="flex gap-3 pt-4">
              <button @click="profileTab = 'view'" class="flex-1 py-3 bg-primary-200 text-primary-800 rounded-xl font-bold hover:bg-primary-300 transition">
                Back
              </button>
            </div>
          </div>

          <!-- Edit Profile Tab -->
          <form v-if="profileTab === 'edit'" @submit.prevent="saveProfileChanges" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">First Name</label>
                <input v-model="editFormData.firstName" type="text" class="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Last Name</label>
                <input v-model="editFormData.surName" type="text" class="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <div>
              <label class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Email</label>
              <input v-model="editFormData.email" type="email" class="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Job Title</label>
              <input v-model="editFormData.jobTitle" type="text" class="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div class="flex gap-3 pt-4">
              <button type="button" @click="profileTab = 'view'" class="flex-1 py-3 bg-primary-200 text-primary-800 rounded-xl font-bold hover:bg-primary-300 transition">
                Cancel
              </button>
              <button type="submit" class="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition">
                Save Changes
              </button>
            </div>
          </form>

          <!-- Change Password Tab -->
          <form v-if="profileTab === 'password'" @submit.prevent="changePassword" class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-xl border border-primary-200">
              <p class="text-sm text-blue-900 font-bold">Changing password for {{ selectedUser?.firstName }} {{ selectedUser?.surName }}</p>
            </div>
            <div>
              <label class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">New Password</label>
              <input v-model="passwordData.newPassword" type="password" placeholder="Enter new password" class="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Confirm Password</label>
              <input v-model="passwordData.confirmPassword" type="password" placeholder="Confirm new password" class="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div v-if="passwordError" class="bg-red-50 p-3 rounded-xl border border-red-200">
              <p class="text-sm text-red-700 font-bold">{{ passwordError }}</p>
            </div>
            <div class="flex gap-3 pt-4">
              <button type="button" @click="profileTab = 'view'" class="flex-1 py-3 bg-primary-200 text-primary-800 rounded-xl font-bold hover:bg-primary-300 transition">
                Cancel
              </button>
              <button type="submit" :disabled="passwordLoading" class="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50">
                {{ passwordLoading ? 'Updating...' : 'Change Password' }}
              </button>
            </div>
          </form>

          <!-- Manage Shift Tab -->
          <div v-if="profileTab === 'shift'" class="space-y-6">
            <!-- Current Shift Display -->
            <div v-if="userShift" class="bg-gradient-to-br from-primary-50 to-blue-50 p-6 rounded-xl border border-primary-200 space-y-4">
              <p class="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">✅ Schedule Assigned</p>
              <div class="space-y-3">
                <div class="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span class="text-sm font-medium text-slate-600">Shift Date:</span>
                  <span class="text-sm font-black text-slate-900">{{ userShift.Shift_Date }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span class="text-sm font-medium text-slate-600">Start Time:</span>
                  <span class="text-sm font-black text-primary-600">{{ userShift.Shift_Start_Time }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span class="text-sm font-medium text-slate-600">End Time:</span>
                  <span class="text-sm font-black text-primary-600">{{ userShift.Shift_End_Time }}</span>
                </div>
              </div>
            </div>

            <div v-else class="bg-primary-100 p-6 rounded-xl border border-dashed border-primary-300 text-center">
              <p class="text-sm text-primary-600 font-medium">No schedule assigned to this user</p>
              <p class="text-xs text-slate-400 mt-1">Assign a schedule from the admin panel to enable scheduling</p>
            </div>

            <!-- Update/Remove Buttons (Only if schedule exists) -->
            <div v-if="userShift" class="space-y-4">
              <!-- Edit Schedule Form -->
              <form @submit.prevent="saveShift" class="space-y-4 p-4 bg-primary-100 rounded-xl border border-primary-200">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Edit Schedule Details</p>
                
                <div>
                  <label class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Shift Date</label>
                  <input v-model="shiftForm.shiftDate" type="date" class="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" required />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Start Time</label>
                    <input v-model="shiftForm.shiftStartTime" type="time" class="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" required />
                  </div>
                  <div>
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">End Time</label>
                    <input v-model="shiftForm.shiftEndTime" type="time" class="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" required />
                  </div>
                </div>

                <div v-if="shiftError" class="bg-red-50 p-3 rounded-xl border border-red-200">
                  <p class="text-sm text-red-700 font-bold">{{ shiftError }}</p>
                </div>

                <div class="flex gap-3 pt-4">
                  <button type="button" @click="profileTab = 'view'" class="flex-1 py-3 bg-primary-200 text-primary-800 rounded-xl font-bold hover:bg-primary-300 transition">
                    Cancel
                  </button>
                  <button type="submit" :disabled="shiftLoading" class="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition disabled:opacity-50">
                    {{ shiftLoading ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>

              <!-- Remove Button -->
              <button type="button" @click="removeShift" :disabled="shiftLoading" class="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition disabled:opacity-50">
                {{ shiftLoading ? 'Removing...' : '🗑️ Remove Schedule Assignment' }}
              </button>
            </div>

            <!-- Info Message when no shift -->
            <div v-else class="bg-blue-50 p-4 rounded-xl border border-primary-200">
              <p class="text-sm text-blue-700 font-medium">
                💡 <span class="font-bold">Tip:</span> Once a schedule is assigned from the administrative panel, it will appear here for management and updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="closeDeleteModal"></div>
        <div class="bg-primary-50 rounded-2xl p-12 max-w-md w-full shadow-2xl relative z-10 animate-in zoom-in duration-300">
          <div class="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0v2M6 12h12"/>
            </svg>
          </div>
          <h3 class="text-lg font-black text-slate-900 text-center mb-2">Delete User</h3>
          <p class="text-sm text-slate-600 text-center mb-6">
            Are you sure you want to delete <strong>{{ deletingUser?.firstName }} {{ deletingUser?.surName }}</strong>? This action cannot be undone.
          </p>
          <div class="flex gap-3 pt-6">
            <button @click="closeDeleteModal" class="flex-1 py-3 bg-primary-200 text-primary-800 rounded-xl font-bold hover:bg-primary-300 transition">
              Cancel
            </button>
            <button @click="confirmDeleteUser" :disabled="loading" class="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50">
              {{ loading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Close menu overlay -->
    <div v-if="activeUserMenu" @click="activeUserMenu = null" class="fixed inset-0 z-10"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import AdminUserCreate from '@/components/AdminUserCreate.vue'
import { 
  PlusIcon, SearchIcon, UsersIcon, 
  MoreHorizontalIcon, XIcon, ShieldCheckIcon 
} from 'lucide-vue-next'

const authStore = useAuthStore()
const users = ref([])
const loading = ref(true)
const showCreateModal = ref(false)
const searchQuery = ref('')
const filterStatus = ref('all')
const activeUserMenu = ref(null)

// Profile modal states
const showProfileModal = ref(false)
const selectedUser = ref(null)
const profileTab = ref('view')

// Delete modal state
const showDeleteModal = ref(false)
const deletingUser = ref(null)

// Edit form data
const editFormData = ref({
  firstName: '',
  surName: '',
  email: '',
  jobTitle: ''
})

// Password change data
const passwordData = ref({
  newPassword: '',
  confirmPassword: ''
})
const passwordError = ref(null)
const passwordLoading = ref(false)

// Shift management state
const userShift = ref(null)
const shiftForm = ref({
  shiftDate: '',
  shiftStartTime: '',
  shiftEndTime: ''
})
const shiftError = ref(null)
const shiftLoading = ref(false)

// Avatar upload state
const avatarError = ref(null)
const avatarPreview = ref(null)
const avatarScale = ref(100)
const avatarFileSize = ref(null)
const avatarCanvas = ref(null)
const avatarImage = ref(null)
const cropX = ref(0)
const cropY = ref(0)
const cropSize = ref(200)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// Compute Metrics
const activeCount = computed(() => users.value.filter(u => u.Is_Active !== 0).length)

// Advanced Filtering Logic
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const name = `${user.firstName} ${user.surName}`.toLowerCase()
    const email = user.email.toLowerCase()
    const query = searchQuery.value.toLowerCase()
    
    const matchesSearch = name.includes(query) || email.includes(query) || (user.employeeId && user.employeeId.toLowerCase().includes(query))
    const matchesStatus = filterStatus.value === 'all' ? true : (filterStatus.value === 'active' ? user.Is_Active !== 0 : user.Is_Active === 0)
    
    return matchesSearch && matchesStatus
  })
})

const fetchUsers = async () => {
  loading.value = true
  try {
    console.log('📥 Fetching users from /org/users...')
    const res = await api.get('/org/users')
    console.log('📦 Received users:', res.data)
    
    // Log avatar status
    if (res.data && res.data.length > 0) {
      const withAvatars = res.data.filter(u => u.avatar).length
      console.log(`👤 Total users: ${res.data.length}, With avatars: ${withAvatars}`)
      res.data.forEach(u => {
        if (u.avatar) {
          console.log(`  ✅ ${u.firstName} ${u.surName} - avatar: ${u.avatar.substring(0, 30)}...`)
        }
      })
    }
    
    users.value = res.data || []
  } catch (err) {
    console.error("❌ Directory sync failed", err)
  } finally {
    loading.value = false
  }
}

// Toggle user action menu
const toggleUserMenu = (userId) => {
  if (activeUserMenu.value === userId) {
    activeUserMenu.value = null
  } else {
    activeUserMenu.value = userId
  }
}

// View user profile
const viewUserProfile = (user) => {
  selectedUser.value = user
  profileTab.value = 'view'
  editFormData.value = {
    firstName: user.firstName,
    surName: user.surName,
    email: user.email,
    jobTitle: user.jobTitle || ''
  }
  passwordData.value = { newPassword: '', confirmPassword: '' }
  passwordError.value = null
  shiftError.value = null
  userShift.value = null
  shiftForm.value = { shiftDate: '', shiftStartTime: '', shiftEndTime: '' }
  showProfileModal.value = true
  activeUserMenu.value = null
}

// Edit user profile
const editUserProfile = (user) => {
  viewUserProfile(user)
  profileTab.value = 'edit'
}

// Close profile modal
const closeProfileModal = () => {
  showProfileModal.value = false
  selectedUser.value = null
  profileTab.value = 'view'
  passwordError.value = null
  passwordData.value = { newPassword: '', confirmPassword: '' }
  shiftError.value = null
  userShift.value = null
  shiftForm.value = { shiftDate: '', shiftStartTime: '', shiftEndTime: '' }
}

// Save profile changes
const saveProfileChanges = async () => {
  try {
    loading.value = true
    await api.put(`/org/users/${selectedUser.value.User_ID}`, {
      firstName: editFormData.value.firstName,
      surName: editFormData.value.surName,
      email: editFormData.value.email,
      jobTitle: editFormData.value.jobTitle
    })
    
    // Update local user data
    const index = users.value.findIndex(u => u.User_ID === selectedUser.value.User_ID)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        ...editFormData.value
      }
      selectedUser.value = users.value[index]
    }
    
    profileTab.value = 'view'
  } catch (err) {
    console.error('Error saving changes:', err)
    alert('Failed to save changes: ' + (err.response?.data?.error || err.message))
  } finally {
    loading.value = false
  }
}

// Change password
const changePassword = async () => {
  passwordError.value = null
  
  // Validation
  if (!passwordData.value.newPassword) {
    passwordError.value = 'New password is required'
    return
  }
  if (passwordData.value.newPassword.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    passwordError.value = 'Passwords do not match'
    return
  }

  try {
    passwordLoading.value = true
    await api.put(`/org/users/${selectedUser.value.User_ID}/change-password`, {
      newPassword: passwordData.value.newPassword
    })
    
    profileTab.value = 'view'
    passwordData.value = { newPassword: '', confirmPassword: '' }
    alert('Password changed successfully')
  } catch (err) {
    passwordError.value = err.response?.data?.error || 'Failed to change password'
    console.error('Error changing password:', err)
  } finally {
    passwordLoading.value = false
  }
}

// Open delete modal
const openDeleteModal = (user) => {
  deletingUser.value = user
  showDeleteModal.value = true
  activeUserMenu.value = null
}

// Close delete modal
const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingUser.value = null
}

// Confirm delete user
const confirmDeleteUser = async () => {
  if (!deletingUser.value) return

  try {
    loading.value = true
    await api.delete(`/org/users/${deletingUser.value.User_ID}`)
    await fetchUsers()
    closeDeleteModal()
  } catch (err) {
    console.error('Error deleting user:', err)
    alert('Failed to delete user: ' + (err.response?.data?.error || err.message))
  } finally {
    loading.value = false
  }
}

// Shift management functions
const openShiftTab = async () => {
  profileTab.value = 'shift'
  shiftError.value = null
  await fetchUserShift()
}

const fetchUserShift = async () => {
  try {
    console.log('🔄 Fetching shift for user:', selectedUser.value.User_ID)
    const res = await api.get(`/shifts/user/${selectedUser.value.User_ID}`)
    console.log('📋 Shift response:', res.data)
    
    if (res.data && res.data.length > 0) {
      userShift.value = res.data[0]
      shiftForm.value = {
        shiftDate: res.data[0].Shift_Date || '',
        shiftStartTime: res.data[0].Shift_Start_Time || '',
        shiftEndTime: res.data[0].Shift_End_Time || ''
      }
      console.log('✅ Shift found:', userShift.value)
    } else {
      console.log('ℹ️ No shift found for user')
      userShift.value = null
      shiftForm.value = { shiftDate: '', shiftStartTime: '', shiftEndTime: '' }
    }
  } catch (err) {
    console.error('❌ Error fetching user shift:', err)
    shiftError.value = 'Failed to load shift: ' + (err.response?.data?.error || err.message)
  }
}

const saveShift = async () => {
  shiftError.value = null
  
  if (!shiftForm.value.shiftDate || !shiftForm.value.shiftStartTime || !shiftForm.value.shiftEndTime) {
    shiftError.value = 'All fields are required'
    return
  }

  try {
    shiftLoading.value = true
    
    if (userShift.value) {
      // Update existing shift
      await api.put(`/shifts/user/${selectedUser.value.User_ID}`, {
        shiftDate: shiftForm.value.shiftDate,
        shiftStartTime: shiftForm.value.shiftStartTime,
        shiftEndTime: shiftForm.value.shiftEndTime
      })
    } else {
      // Create new shift
      await api.post('/shifts', {
        userId: selectedUser.value.User_ID,
        shiftDate: shiftForm.value.shiftDate,
        shiftStartTime: shiftForm.value.shiftStartTime,
        shiftEndTime: shiftForm.value.shiftEndTime
      })
    }
    
    await fetchUserShift()
    alert('Shift saved successfully')
  } catch (err) {
    shiftError.value = err.response?.data?.error || 'Failed to save shift'
    console.error('Error saving shift:', err)
  } finally {
    shiftLoading.value = false
  }
}

const removeShift = async () => {
  if (!confirm('Are you sure you want to remove this shift?')) return

  try {
    shiftLoading.value = true
    await api.delete(`/shifts/user/${selectedUser.value.User_ID}`)
    await fetchUserShift()
    alert('Shift removed successfully')
  } catch (err) {
    shiftError.value = err.response?.data?.error || 'Failed to remove shift'
    console.error('Error removing shift:', err)
  } finally {
    shiftLoading.value = false
  }
}

const handleUserCreated = () => {
  showCreateModal.value = false
  fetchUsers()
}

// Handle avatar file selection
const handleAvatarFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  avatarError.value = null
  avatarFileSize.value = file.size

  // Validate file type
  if (!file.type.startsWith('image/')) {
    avatarError.value = 'Please select a valid image file'
    return
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    avatarError.value = 'Image size must be less than 2MB'
    return
  }

  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const img = new Image()
      img.onload = () => {
        avatarPreview.value = e.target?.result
        avatarImage.value = img
        cropX.value = 0
        cropY.value = 0
        cropSize.value = Math.min(img.width, img.height)
        drawCropPreview()
      }
      img.onerror = () => {
        avatarError.value = 'Failed to load image'
      }
      img.src = e.target?.result
    }
    reader.readAsDataURL(file)
  } catch (err) {
    avatarError.value = 'Error processing image'
    console.error('Error processing image:', err)
  }
}

// Draw crop preview
const drawCropPreview = () => {
  if (!avatarImage.value || !avatarCanvas.value) return

  const canvas = avatarCanvas.value
  const ctx = canvas.getContext('2d')
  const img = avatarImage.value

  // Draw the cropped and resized image
  ctx.fillStyle = '#f1f5f9'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const size = Math.min(cropSize.value, Math.min(img.width, img.height))
  ctx.drawImage(img, 
    Math.max(0, cropX.value), 
    Math.max(0, cropY.value), 
    size, 
    size, 
    0, 
    0, 
    256, 
    256
  )

  // Update preview display
  const previewBox = document.getElementById('previewBox')
  if (previewBox) {
    previewBox.innerHTML = ''
    const previewCanvas = document.createElement('canvas')
    previewCanvas.width = 128
    previewCanvas.height = 128
    const previewCtx = previewCanvas.getContext('2d')
    previewCtx.drawImage(canvas, 0, 0, 256, 256, 0, 0, 128, 128)
    previewBox.appendChild(previewCanvas)
  }
}

// Start crop drag
const startCropDrag = (e) => {
  if (!avatarImage.value) return
  isDragging.value = true
  dragStart.value = { x: e.clientX, y: e.clientY }
}

// Handle crop drag
const handleCropDrag = (e) => {
  if (!isDragging.value || !avatarImage.value) return

  const deltaX = e.clientX - dragStart.value.x
  const deltaY = e.clientY - dragStart.value.y

  // Update crop position based on drag
  cropX.value = Math.max(0, Math.min(cropX.value + deltaX / 2, avatarImage.value.width - cropSize.value))
  cropY.value = Math.max(0, Math.min(cropY.value + deltaY / 2, avatarImage.value.height - cropSize.value))

  dragStart.value = { x: e.clientX, y: e.clientY }
  drawCropPreview()
}

// End crop drag
const endCropDrag = () => {
  isDragging.value = false
}

// Save the cropped avatar
const saveAvatarUpload = async () => {
  if (!avatarCanvas.value) return

  try {
    loading.value = true
    const canvasDataUrl = avatarCanvas.value.toDataURL('image/png')
    const base64Data = canvasDataUrl.split(',')[1]

    console.log('📤 Uploading avatar for user:', selectedUser.value.User_ID)
    console.log('📊 Avatar data size:', base64Data.length, 'chars')
    
    const response = await api.post(`/org/users/${selectedUser.value.User_ID}/avatar`, {
      avatarData: base64Data,
      avatarMimeType: 'image/png'
    })

    console.log('✅ Avatar upload response:', response.data)

    // Update local user data immediately in the users list
    const userIndex = users.value.findIndex(u => u.User_ID === selectedUser.value.User_ID)
    if (userIndex !== -1) {
      console.log('🔄 Updating users list index', userIndex)
      users.value[userIndex].avatar = base64Data
      users.value[userIndex].avatarMimeType = 'image/png'
      // Trigger reactivity
      users.value = [...users.value]
    }

    // Update selected user in modal
    selectedUser.value.avatar = base64Data
    selectedUser.value.avatarMimeType = 'image/png'

    // Update auth store if this is the current user
    if (authStore.user?.userId === selectedUser.value.User_ID) {
      console.log('👤 Updating auth store for current user')
      authStore.updateUserAvatar(base64Data, 'image/png')
    }

    // Switch to view tab to show updated avatar
    profileTab.value = 'view'
    
    console.log('🔄 Refreshing user list from server...')
    // Refresh from server to ensure persistence
    await fetchUsers()
    
    // Re-find and update selected user after refresh
    const refreshedUser = users.value.find(u => u.User_ID === selectedUser.value.User_ID)
    if (refreshedUser) {
      selectedUser.value = refreshedUser
      console.log('✅ Selected user refreshed from server')
    }
    
    console.log('✅ Avatar saved successfully!')
    alert('Avatar saved successfully!')
  } catch (err) {
    console.error('❌ Error saving avatar:', err)
    avatarError.value = 'Failed to save avatar: ' + (err.response?.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

// Cancel avatar upload
const cancelAvatarUpload = () => {
  avatarPreview.value = null
  avatarScale.value = 100
  avatarError.value = null
  avatarFileSize.value = null
  avatarImage.value = null
  cropX.value = 0
  cropY.value = 0
}

onMounted(() => {
  fetchUsers()
  
  // Close menu when clicking outside
  document.addEventListener('click', () => {
    activeUserMenu.value = null
  })
})
</script>

<style scoped>
/* Modal Transition Animation */
.modal-enter-active, .modal-leave-active { transition: opacity 0.4s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>
