<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="handleCancel"
    ></div>

    <!-- Dialog -->
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in fade-in scale-95 duration-200">
      <!-- Icon -->
      <div v-if="icon" class="mb-6 flex justify-center">
        <div :class="`w-16 h-16 rounded-full flex items-center justify-center ${iconBgClass}`">
          <component :is="icon" :class="`w-8 h-8 ${iconColorClass}`" />
        </div>
      </div>

      <!-- Title -->
      <h3 class="text-xl font-bold text-gray-900 text-center mb-3">
        {{ title }}
      </h3>

      <!-- Message -->
      <p v-if="message" class="text-gray-600 text-center mb-8 leading-relaxed">
        {{ message }}
      </p>

      <!-- Custom Content -->
      <div v-if="$slots.default" class="mb-8">
        <slot></slot>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 justify-center">
        <button
          @click="handleCancel"
          :class="`
            px-6 py-2.5 rounded-lg font-semibold transition-all duration-200
            ${cancelButtonClass}
          `"
        >
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
          :disabled="isLoading"
          :class="`
            px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2
            ${confirmButtonClass}
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
          `"
        >
          <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Info,
  Trash2
} from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'danger', 'question'],
    default: 'question'
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
  question: HelpCircle
}

const icon = computed(() => iconMap[props.type])

const iconBgClass = computed(() => {
  const classes = {
    info: 'bg-primary-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
    question: 'bg-primary-100'
  }
  return classes[props.type]
})

const iconColorClass = computed(() => {
  const classes = {
    info: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    question: 'text-primary-600'
  }
  return classes[props.type]
})

const confirmButtonClass = computed(() => {
  const base = 'text-white font-semibold hover:shadow-lg'
  const classes = {
    info: 'bg-primary-600 hover:bg-primary-700',
    success: 'bg-primary-600 hover:bg-primary-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    danger: 'bg-red-600 hover:bg-red-700',
    question: 'bg-primary-600 hover:bg-primary-700'
  }
  return `${base} ${classes[props.type]}`
})

const cancelButtonClass = 'bg-gray-200 text-gray-900 hover:bg-gray-300'

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-in {
  animation: fadeIn 0.2s ease-out;
}

.scale-95 {
  transform: scale(0.95);
}

.duration-200 {
  transition-duration: 200ms;
}
</style>
