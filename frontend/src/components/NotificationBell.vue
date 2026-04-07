<template>
  <div class="notification-bell-container">
    <!-- Bell Icon Button -->
    <div class="relative">
      <button
        @click="toggleDropdown"
        class="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 focus:outline-none"
        :class="{ 'text-blue-600': isOpen }"
        aria-label="Notifications"
      >
        <!-- Bell Icon -->
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        <!-- Unread Badge -->
        <transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="scale-0"
          leave-to-class="scale-0"
        >
          <span
            v-if="unreadCount > 0"
            class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        </transition>
      </button>

      <!-- Dropdown Panel -->
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
        >
          <!-- Header -->
          <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">Notifications</h3>
            <div class="flex items-center gap-2">
              <button
                v-if="unreadCount > 0"
                @click="markAllAsRead"
                class="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all read
              </button>
              <button
                @click="toggleDropdown"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Notifications List -->
          <div class="max-h-96 overflow-y-auto">
            <div v-if="isLoading" class="px-4 py-8 text-center">
              <div class="inline-block">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>

            <div v-else-if="notifications.length === 0" class="px-4 py-8 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p class="mt-2 text-sm text-gray-500">No notifications yet</p>
            </div>

            <div v-else class="divide-y divide-gray-100">
              <transition-group name="list" tag="div">
                <div
                  v-for="notification in notifications"
                  :key="notification.Notify_ID"
                  @click="handleNotificationClick(notification)"
                  :class="[
                    'px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150',
                    { 'bg-blue-50': !notification.Is_Read }
                  ]"
                >
                  <!-- Notification Content -->
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <!-- Icon & Title -->
                      <div class="flex items-center gap-2">
                        <div
                          :class="[
                            'w-2 h-2 rounded-full flex-shrink-0',
                            {
                              'bg-blue-600': !notification.Is_Read,
                              'bg-gray-300': notification.Is_Read
                            }
                          ]"
                        ></div>
                        <h4 class="font-semibold text-gray-900 text-sm truncate">
                          {{ notification.Title }}
                        </h4>
                      </div>

                      <!-- Message -->
                      <p class="text-gray-600 text-sm mt-1 line-clamp-2">
                        {{ notification.Message }}
                      </p>

                      <!-- Metadata -->
                      <div class="flex items-center gap-2 mt-2">
                        <span class="text-xs text-gray-500">
                          {{ formatTime(notification.Created_at) }}
                        </span>
                        <span
                          v-if="notification.Category"
                          :class="[
                            'text-xs px-2 py-0.5 rounded-full',
                            getCategoryStyles(notification.Category)
                          ]"
                        >
                          {{ notification.Category }}
                        </span>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-1 ml-2 flex-shrink-0">
                      <button
                        v-if="!notification.Is_Read"
                        @click.stop="markAsRead(notification.Notify_ID)"
                        class="p-1 text-gray-400 hover:text-blue-600"
                        title="Mark as read"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        @click.stop="deleteNotification(notification.Notify_ID)"
                        class="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3H4v2h16V7h-3.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>
          </div>

          <!-- Footer -->
          <div v-if="notifications.length > 0" class="px-4 py-3 border-t border-gray-200">
            <router-link
              to="/notifications"
              class="text-sm text-center text-blue-600 hover:text-blue-700 font-medium block"
            >
              View all notifications →
            </router-link>
          </div>
        </div>
      </transition>
    </div>

    <!-- Click outside to close -->
    <div
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNotifications } from '@/composables/useNotifications'

const {
  notifications,
  unreadCount,
  isLoading,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  fetchNotifications
} = useNotifications()

const isOpen = ref(false)

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    fetchNotifications()
  }
}

// Format time
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}

// Get category styles
const getCategoryStyles = (category) => {
  const styles = {
    organization: 'bg-blue-100 text-blue-800',
    employee: 'bg-blue-100 text-blue-800',
    department: 'bg-purple-100 text-purple-800',
    location: 'bg-orange-100 text-orange-800',
    announcement: 'bg-red-100 text-red-800',
    user: 'bg-indigo-100 text-indigo-800',
    test: 'bg-gray-100 text-gray-800'
  }
  return styles[category] || 'bg-gray-100 text-gray-800'
}

// Handle notification click (navigate if has action URL)
const handleNotificationClick = (notification) => {
  if (notification.Action_URL) {
    useRouter().push(notification.Action_URL)
    isOpen.value = false
  }
}

// Close dropdown when clicking on link
watch(isOpen, (newVal) => {
  if (!newVal) {
    // Cleanup if needed
  }
})
</script>

<style scoped>
.notification-bell-container {
  position: relative;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
