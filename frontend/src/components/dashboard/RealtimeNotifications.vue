<template>
  <div v-if="notifications.length > 0" class="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-50 space-y-3 max-w-sm">
    <transition-group name="slide-fade" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="p-4 md:p-5 rounded-xl shadow-lg border-l-4 animate-in slide-in-from-right-4 fade-in"
        :class="notificationClasses(notification.type)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 flex-1">
            <div class="mt-0.5">
              <component :is="notificationIcon(notification.type)" class="w-5 h-5" />
            </div>
            <div class="flex-1">
              <p class="font-bold text-sm" :class="notificationTextColor(notification.type)">
                {{ notification.title || notification.message }}
              </p>
              <p v-if="notification.description" class="text-xs opacity-75 mt-1">
                {{ notification.description }}
              </p>
            </div>
          </div>
          <button
            @click="dismiss(notification.id)"
            class="text-lg leading-none opacity-50 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>

        <!-- Progress bar -->
        <div class="mt-3 h-1 bg-black/10 rounded-full overflow-hidden">
          <div
            class="h-full transition-all"
            :class="notificationProgressColor(notification.type)"
            :style="{ width: notification.progress + '%' }"
          ></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Bell, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-vue-next'

const props = defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['dismiss'])

const progress = ref({})

const notificationClasses = (type) => {
  const baseClasses = 'bg-white'
  const typeClasses = {
    success: 'border-primary-500 bg-primary-50',
    error: 'border-red-500 bg-red-50',
    warning: 'border-amber-500 bg-amber-50',
    info: 'border-blue-500 bg-blue-50',
    break: 'border-amber-500 bg-amber-50',
    shift: 'border-primary-500 bg-primary-50',
    analytics: 'border-accent-500 bg-accent-50',
  }
  return typeClasses[type] || 'border-slate-300'
}

const notificationIcon = (type) => {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertCircle,
    info: Bell,
    break: Clock,
    shift: Clock,
    analytics: TrendingUp,
  }
  return icons[type] || Bell
}

const notificationTextColor = (type) => {
  const colors = {
    success: 'text-primary-700',
    error: 'text-red-700',
    warning: 'text-amber-700',
    info: 'text-blue-700',
    break: 'text-amber-700',
    shift: 'text-primary-700',
    analytics: 'text-accent-700',
  }
  return colors[type] || 'text-slate-700'
}

const notificationProgressColor = (type) => {
  const colors = {
    success: 'bg-primary-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    break: 'bg-amber-500',
    shift: 'bg-primary-500',
    analytics: 'bg-accent-500',
  }
  return colors[type] || 'bg-slate-300'
}

const dismiss = (id) => {
  emit('dismiss', id)
}

const animateProgress = () => {
  props.notifications.forEach((notif) => {
    if (!progress.value[notif.id]) {
      progress.value[notif.id] = 100
    }
    progress.value[notif.id] = Math.max(0, progress.value[notif.id] - 2)

    if (progress.value[notif.id] <= 0) {
      dismiss(notif.id)
    }
  })
}

let animationInterval = null

onMounted(() => {
  animationInterval = setInterval(animateProgress, 50)
})

onBeforeUnmount(() => {
  if (animationInterval) clearInterval(animationInterval)
})

watch(
  () => props.notifications.length,
  (newLen, oldLen) => {
    if (newLen > oldLen) {
      // New notification added
      const newNotif = props.notifications[props.notifications.length - 1]
      if (!progress.value[newNotif.id]) {
        progress.value[newNotif.id] = 100
      }
    }
  }
)

const computedNotifications = computed(() => {
  return props.notifications.map((notif) => ({
    ...notif,
    progress: progress.value[notif.id] ?? 100,
  }))
})
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
