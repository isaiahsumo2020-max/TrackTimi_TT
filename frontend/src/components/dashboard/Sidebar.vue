<template>
  <aside :class="[open ? 'w-72' : 'w-20', 'bg-primary-600 text-white shadow-lg transition-all duration-500 ease-in-out flex flex-col z-20']">
    <!-- Header Logo -->
    <div class="p-6 border-b border-primary-700 flex items-center justify-between h-24">
      <div v-if="open" class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center shadow-md shadow-accent-500/20">
          <ZapIcon class="w-6 h-6 text-white fill-white" />
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-black tracking-tighter uppercase leading-none">TrackTimi</span>
          <span class="text-[8px] font-black text-primary-200 uppercase tracking-[0.4em] mt-1">Admin Portal</span>
        </div>
      </div>
      <button 
        @click="$emit('toggle-sidebar')" 
        class="p-2 rounded-lg bg-primary-700 hover:bg-primary-800 border border-primary-700 transition-all"
      >
        <MenuIcon v-if="!open" class="w-5 h-5 text-primary-200" />
        <ChevronLeftIcon v-else class="w-5 h-5 text-primary-200" />
      </button>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
      <p v-if="open" class="text-[10px] font-black uppercase px-4 mb-6 tracking-[0.2em] text-primary-200">Navigation</p>
      
      <!-- Categories -->
      <div v-for="category in categories" :key="category.id" class="space-y-1">
        <!-- Category Header -->
        <button
          @click="toggleCategory(category.id)"
          class="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all text-primary-100 hover:bg-primary-700"
        >
          <component :is="category.icon" class="w-4 h-4 shrink-0" />
          <span v-if="open" class="flex-1 text-left">{{ category.name }}</span>
          <ChevronDownIcon 
            v-if="open"
            class="w-4 h-4 transition-transform duration-300"
            :class="expandedCategories[category.id] ? 'rotate-180' : ''"
          />
        </button>

        <!-- Category Items -->
        <transition-group
          v-if="expandedCategories[category.id]"
          tag="div"
          name="slide-fade"
          class="space-y-1 pl-4"
        >
          <button
            v-for="item in category.items"
            :key="item.id"
            @click="selectSection(item.id)"
            class="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
            :class="[
              isActive(item.id)
                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/40'
                : 'text-primary-100 hover:bg-primary-700 hover:text-white'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4 shrink-0" />
            <span v-if="open">{{ item.name }}</span>
          </button>
        </transition-group>
      </div>
    </nav>

    <!-- Admin Profile Card -->
    <div class="p-6 border-t border-primary-700">
      <div class="flex items-center space-x-3 bg-primary-700/50 p-4 rounded-lg border border-primary-700 group hover:border-accent-500/50 transition-all">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center font-black shadow-md text-white bg-accent-500">
          SA
        </div>
        <div v-if="open" class="flex-1 min-w-0">
          <div class="font-bold text-xs truncate text-white">TrackTimi Admin</div>
          <div class="text-[9px] font-black uppercase text-primary-200">Administrator</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  ZapIcon, MenuIcon, ChevronLeftIcon, BuildingIcon, 
  UsersIcon, ClockIcon, BarChart3Icon, ShieldAlertIcon,
  LayoutDashboardIcon, ActivityIcon, SettingsIcon,
  AlertCircleIcon, MapPinIcon, FileTextIcon, BriefcaseIcon,
  TrendingUpIcon, ChevronDownIcon, MessageCircleIcon
} from 'lucide-vue-next'

const props = defineProps({
  open: Boolean,
  activeSection: String
})

const emit = defineEmits(['toggle-sidebar', 'select-section'])

const expandedCategories = ref({
  overview: true,
  management: true,
  operations: false,
  settings: false
})

const toggleCategory = (category) => {
  expandedCategories.value[category] = !expandedCategories.value[category]
}

const categories = [
  {
    id: 'overview',
    name: 'Overview',
    icon: LayoutDashboardIcon,
    items: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboardIcon },
      { id: 'analytics', name: 'Analytics', icon: BarChart3Icon },
      { id: 'system-status', name: 'System Status', icon: ActivityIcon }
    ]
  },
  {
    id: 'management',
    name: 'Management',
    icon: BriefcaseIcon,
    items: [
      { id: 'organizations', name: 'Organizations', icon: BuildingIcon },
      { id: 'users', name: 'Users', icon: UsersIcon },
      { id: 'departments', name: 'Departments', icon: BriefcaseIcon }
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: ClockIcon,
    items: [
      { id: 'attendance', name: 'Attendance', icon: ClockIcon },
      { id: 'geofences', name: 'Geofences', icon: MapPinIcon },
      { id: 'alerts', name: 'Alerts', icon: AlertCircleIcon },
      { id: 'feedback', name: 'Feedback', icon: MessageCircleIcon }
    ]
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: SettingsIcon,
    items: [
      { id: 'audit-logs', name: 'Audit Logs', icon: FileTextIcon },
      { id: 'system-config', name: 'Configuration', icon: SettingsIcon }
    ]
  }
]

const isActive = (itemId) => props.activeSection === itemId

const selectSection = (itemId) => {
  emit('select-section', itemId)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(2, 132, 199, 0.3); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(2, 132, 199, 0.5); }

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}
</style>
