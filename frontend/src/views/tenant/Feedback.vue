<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Send us your Feedback</h1>
        <p class="text-slate-600 mt-2">Help us improve TrackTimi by sharing your thoughts and suggestions</p>
      </div>

      <!-- Feedback Form -->
      <div class="bg-white rounded-lg shadow p-8 mb-8">
        <form @submit.prevent="submitFeedback" class="space-y-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-bold text-slate-900 mb-2">
              Feedback Title *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="e.g., Feature Request, Bug Report, Suggestion"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <!-- Category -->
          <div>
            <label for="category" class="block text-sm font-bold text-slate-900 mb-2">
              Category
            </label>
            <select
              id="category"
              v-model="form.category"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="feature">Feature Request</option>
              <option value="bug">Bug Report</option>
              <option value="improvement">Improvement Suggestion</option>
              <option value="performance">Performance Issue</option>
              <option value="usability">Usability Concern</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Message -->
          <div>
            <label for="message" class="block text-sm font-bold text-slate-900 mb-2">
              Your Feedback *
            </label>
            <textarea
              id="message"
              v-model="form.message"
              placeholder="Please provide detailed feedback..."
              rows="6"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
              required
            ></textarea>
            <p class="text-xs text-slate-500 mt-1">{{ form.message.length }}/500 characters</p>
          </div>

          <!-- Rating -->
          <div>
            <label class="block text-sm font-bold text-slate-900 mb-3">
              How satisfied are you with TrackTimi?
            </label>
            <div class="flex items-center space-x-3">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="form.rating = star"
                class="focus:outline-none transition-transform hover:scale-110"
              >
                <svg
                  :class="{
                    'text-yellow-400': star <= form.rating,
                    'text-slate-300': star > form.rating
                  }"
                  class="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
              <span class="text-sm text-slate-600 ml-4">
                {{ ratingText[form.rating] }}
              </span>
            </div>
          </div>

          <!-- Submit -->
          <div class="flex space-x-4 pt-6">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 px-6 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <span v-if="!isSubmitting">Submit Feedback</span>
              <span v-else class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
                Submitting...
              </span>
            </button>
            <button
              type="button"
              @click="resetForm"
              class="px-6 py-3 bg-slate-200 text-slate-900 font-bold rounded-lg hover:bg-slate-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <!-- Success Message -->
      <transition name="fade">
        <div v-if="showSuccess" class="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start space-x-4">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-green-900">Thank you for your feedback!</h3>
            <p class="text-green-800 text-sm mt-1">We appreciate your input and will review it shortly.</p>
          </div>
        </div>
      </transition>

      <!-- Previous Feedback Section -->
      <div v-if="userFeedback.length > 0" class="mt-12">
        <h2 class="text-2xl font-bold text-slate-900 mb-6">Your Previous Feedback</h2>
        <div class="space-y-4">
          <div
            v-for="item in userFeedback"
            :key="item.Feedback_ID"
            class="bg-white rounded-lg shadow p-6 border-l-4"
            :class="item.Status === 'responded' ? 'border-green-500' : 'border-slate-300'"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-bold text-slate-900">{{ item.Title }}</h3>
                <p class="text-xs text-slate-500 mt-1">{{ formatDate(item.Created_at) }}</p>
              </div>
              <span
                class="px-3 py-1 rounded-full text-xs font-bold"
                :class="{
                  'bg-green-100 text-green-700': item.Status === 'responded',
                  'bg-yellow-100 text-yellow-700': item.Status === 'pending',
                  'bg-gray-100 text-gray-700': item.Status === 'closed'
                }"
              >
                {{ item.Status }}
              </span>
            </div>
            <p class="text-slate-700 text-sm mb-4">{{ item.Message }}</p>

            <!-- Rating -->
            <div class="flex items-center space-x-1 mb-4">
              <span v-for="i in 5" :key="i" class="text-lg">
                {{ i <= item.Rating ? '⭐' : '☆' }}
              </span>
            </div>

            <!-- Response -->
            <div v-if="item.Response" class="bg-slate-50 rounded p-4 border-l-2 border-primary-600">
              <p class="text-xs font-bold text-primary-700 uppercase mb-2">Response from Support</p>
              <p class="text-slate-700 text-sm">{{ item.Response }}</p>
              <p class="text-xs text-slate-500 mt-2">{{ formatDate(item.Responded_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/utils/api'
import { useRoute } from 'vue-router'

const route = useRoute()
const orgSlug = computed(() => route.params.orgSlug)

const form = ref({
  title: '',
  message: '',
  category: 'feedback',
  rating: 5
})

const ratingText = {
  1: '😞 Very Dissatisfied',
  2: '😐 Dissatisfied',
  3: '😐 Neutral',
  4: '😊 Satisfied',
  5: '😍 Very Satisfied'
}

const isSubmitting = ref(false)
const showSuccess = ref(false)
const userFeedback = ref([])

const submitFeedback = async () => {
  if (!form.value.title.trim() || !form.value.message.trim()) {
    alert('Please fill in all required fields')
    return
  }

  if (form.value.message.length > 500) {
    alert('Feedback cannot exceed 500 characters')
    return
  }

  isSubmitting.value = true
  try {
    const res = await api.post('/feedback', {
      title: form.value.title,
      message: form.value.message,
      category: form.value.category,
      rating: form.value.rating
    })

    if (res.data.success) {
      showSuccess.value = true
      resetForm()
      fetchUserFeedback()

      // Hide success message after 5 seconds
      setTimeout(() => {
        showSuccess.value = false
      }, 5000)
    }
  } catch (err) {
    console.error('Failed to submit feedback:', err)
    alert('Failed to submit feedback. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    message: '',
    category: 'feedback',
    rating: 5
  }
}

const fetchUserFeedback = async () => {
  try {
    const res = await api.get('/feedback')
    userFeedback.value = res.data.feedback || []
  } catch (err) {
    console.error('Failed to fetch feedback:', err)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Fetch feedback on mount
onMounted(() => {
  fetchUserFeedback()
})

import { onMounted } from 'vue'
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
