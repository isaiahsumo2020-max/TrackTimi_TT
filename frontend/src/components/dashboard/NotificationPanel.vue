<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-200">
        <div>
          <h2 class="text-2xl font-black text-slate-900">Notifications</h2>
          <p class="text-xs text-slate-500 mt-1">{{ totalNotifications }} notifications • {{ unreadCount }} unread</p>
        </div>
        <button 
          @click="close"
          class="text-slate-400 hover:text-slate-900 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2 px-6 pt-4 border-b border-slate-200 overflow-x-auto">
        <button
          v-for="filter in filters"
          :key="filter.id"
          @click="activeFilter = filter.id"
          :class="[
            activeFilter === filter.id 
              ? 'bg-primary-100 text-primary-700 border-primary-400' 
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          ]"
          class="px-4 py-2 rounded-lg text-sm font-bold border transition-colors whitespace-nowrap"
        >
          {{ filter.label }}
          <span v-if="filter.count" class="ml-2 text-xs font-bold">{{ filter.count }}</span>
        </button>
      </div>

      <!-- Notifications List -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div v-if="filteredNotifications.length === 0" class="flex flex-col items-center justify-center h-full py-12">
          <svg class="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <p class="text-slate-600 font-bold">No notifications</p>
          <p class="text-xs text-slate-500 mt-1">You're all caught up!</p>
        </div>

        <div v-else class="divide-y divide-slate-200">
          <div 
            v-for="notif in filteredNotifications" 
            :key="notif.Notify_ID"
            @click="selectNotification(notif)"
            :class="[
              notif.Is_Read ? 'bg-white hover:bg-slate-50' : 'bg-primary-50',
              'p-4 cursor-pointer transition-colors border-l-4',
              getCategoryBorderColor(notif.Category)
            ]"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <component :is="getNotificationIcon(notif.Type)" class="w-5 h-5 flex-shrink-0" />
                  <h3 class="font-bold text-slate-900">{{ notif.Title }}</h3>
                  <span v-if="!notif.Is_Read" class="w-2 h-2 bg-primary-600 rounded-full"></span>
                </div>
                <p class="text-sm text-slate-600 line-clamp-2">{{ notif.Message }}</p>
                <div class="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>
                    <component :is="getCategoryIcon(notif.Category)" class="w-4 h-4 inline mr-1" />
                    {{ getCategoryLabel(notif.Category) }}
                  </span>
                  <span>{{ formatTime(notif.Created_at) }}</span>
                </div>
              </div>
              <button
                @click.stop="removeNotification(notif.Notify_ID)"
                class="text-slate-300 hover:text-red-500 transition-colors ml-4"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex gap-3 p-6 border-t border-slate-200">
        <button
          @click="markAllAsRead"
          :disabled="unreadCount === 0"
          class="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
        >
          Mark All as Read
        </button>
        <button
          @click="close"
          class="flex-1 px-4 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CheckCircleIcon, AlertCircleIcon, AlertTriangleIcon, InfoIcon,
  CoffeeIcon, ClockIcon, BarChart3Icon, BuildingIcon, UsersIcon,
  BriefcaseIcon, MapPinIcon, ActivityIcon, SettingsIcon, ShoppingCartIcon
} from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  notifications: {
    type: Array,
    default: () => []
  },
  unreadCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'mark-as-read', 'delete', 'mark-all-read'])

const activeFilter = ref('all')
const selectedNotif = ref(null)

const filters = computed(() => [
  { id: 'all', label: 'All', count: props.notifications.length },
  { id: 'unread', label: 'Unread', count: props.notifications.filter(n => !n.Is_Read).length },
  { id: 'organization', label: 'Organizations', count: props.notifications.filter(n => n.Category === 'organization').length },
  { id: 'user', label: 'Users', count: props.notifications.filter(n => n.Category === 'user').length },
  { id: 'department', label: 'Departments', count: props.notifications.filter(n => n.Category === 'department').length },
  { id: 'location', label: 'Locations', count: props.notifications.filter(n => n.Category === 'location').length },
  { id: 'attendance', label: 'Attendance', count: props.notifications.filter(n => n.Category === 'attendance').length },
  { id: 'system', label: 'System', count: props.notifications.filter(n => n.Category === 'system').length },
])

const filteredNotifications = computed(() => {
  let filtered = props.notifications;

  if (activeFilter.value === 'unread') {
    filtered = filtered.filter(n => !n.Is_Read);
  } else if (activeFilter.value !== 'all') {
    filtered = filtered.filter(n => n.Category === activeFilter.value);
  }

  // Sort by date, newest first
  return filtered.sort((a, b) => new Date(b.Created_at) - new Date(a.Created_at));
})

const totalNotifications = computed(() => props.notifications.length)

// Methods
const close = () => emit('close')

const selectNotification = (notif) => {
  if (!notif.Is_Read) {
    emit('mark-as-read', notif.Notify_ID)
  }
  selectedNotif.value = notif
}

const removeNotification = (notifyId) => {
  emit('delete', notifyId)
}

const markAllAsRead = () => {
  emit('mark-all-read')
}

const getNotificationIcon = (type) => {
  const icons = {
    success: CheckCircleIcon,
    error: AlertCircleIcon,
    warning: AlertTriangleIcon,
    info: InfoIcon,
    break: CoffeeIcon,
    shift: ClockIcon,
    analytics: BarChart3Icon
  }
  return icons[type] || InfoIcon
}

const getCategoryIcon = (category) => {
  const icons = {
    organization: BuildingIcon,
    user: UsersIcon,
    department: BriefcaseIcon,
    location: MapPinIcon,
    attendance: BarChart3Icon,
    system: SettingsIcon,
    billing: ShoppingCartIcon,
    general: InfoIcon
  }
  return icons[category] || InfoIcon
}

const getCategoryLabel = (category) => {
  const labels = {
    organization: 'Organization',
    user: 'User',
    department: 'Department',
    location: 'Location',
    attendance: 'Attendance',
    system: 'System',
    billing: 'Billing',
    general: 'General'
  }
  return labels[category] || category
}

const getCategoryBorderColor = (category) => {
  const colors = {
    organization: 'border-blue-400',
    user: 'border-accent-400',
    department: 'border-primary-400',
    location: 'border-orange-400',
    attendance: 'border-yellow-400',
    system: 'border-red-400',
    billing: 'border-pink-400'
  }
  return colors[category] || 'border-slate-400'
}

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
