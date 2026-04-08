<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Organization Feedback Management</h1>
        <p class="text-slate-600 mt-2">View and respond to feedback from organization members</p>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm">Total Feedback</p>
              <p class="text-3xl font-bold text-slate-900">{{ stats.total }}</p>
            </div>
            <svg class="w-10 h-10 text-primary-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm">Pending</p>
              <p class="text-3xl font-bold text-accent-600">{{ stats.pending }}</p>
            </div>
            <svg class="w-10 h-10 text-accent-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm">Responded</p>
              <p class="text-3xl font-bold text-primary-600">{{ stats.responded }}</p>
            </div>
            <svg class="w-10 h-10 text-primary-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm">Avg Rating</p>
              <p class="text-3xl font-bold text-accent-600">{{ stats.avg_rating?.toFixed(1) || 'N/A' }}</p>
            </div>
            <div class="text-3xl">⭐</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-900 mb-2">Filter by Status</label>
            <select
              v-model="filterStatus"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-900 mb-2">Filter by Category</label>
            <select
              v-model="filterCategory"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Bug Report</option>
              <option value="improvement">Improvement</option>
              <option value="performance">Performance</option>
              <option value="usability">Usability</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-900 mb-2">Search</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search feedback..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <!-- Feedback List -->
      <div class="space-y-4" v-if="filteredFeedback.length > 0">
        <div
          v-for="feedback in filteredFeedback"
          :key="feedback.Feedback_ID"
          class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="selectedFeedback = feedback"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h3 class="text-lg font-bold text-slate-900">{{ feedback.Title }}</h3>
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold"
                  :class="{
                    'bg-accent-100 text-accent-700': feedback.Status === 'pending',
                    'bg-primary-100 text-primary-700': feedback.Status === 'responded'
                  }"
                >
                  {{ feedback.Status }}
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {{ feedback.Category }}
                </span>
              </div>
              <p class="text-sm text-slate-600">From: {{ feedback.First_Name }} {{ feedback.SurName }} ({{ feedback.Email }})</p>
              <p class="text-xs text-slate-500 mt-1">{{ formatDate(feedback.Created_at) }}</p>
            </div>

            <!-- Rating -->
            <div class="text-right">
              <div class="flex items-center justify-end space-x-1 mb-2">
                <span v-for="i in 5" :key="i" class="text-lg">
                  {{ i <= feedback.Rating ? '⭐' : '☆' }}
                </span>
              </div>
              <p class="text-sm font-bold text-slate-900">{{ feedback.Rating }}/5</p>
            </div>
          </div>

          <p class="text-slate-700 line-clamp-2">{{ feedback.Message }}</p>
        </div>
      </div>

      <div v-else class="bg-white rounded-lg shadow p-12 text-center">
        <p class="text-slate-600">No feedback found matching your filters</p>
      </div>
    </div>

    <!-- Feedback Detail Modal -->
    <transition name="modal">
      <div v-if="selectedFeedback" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90-vh overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
            <div>
              <h2 class="text-2xl font-bold text-slate-900">{{ selectedFeedback.Title }}</h2>
              <p class="text-sm text-slate-600 mt-1">
                From: <span class="font-semibold">{{ selectedFeedback.First_Name }} {{ selectedFeedback.SurName }}</span>
              </p>
            </div>
            <button
              @click="selectedFeedback = null"
              class="text-slate-400 hover:text-slate-600"
            >
              <XIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Metadata -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p class="text-xs text-slate-600 uppercase font-bold">Status</p>
                <span
                  class="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold"
                  :class="{
                    'bg-accent-100 text-accent-700': selectedFeedback.Status === 'pending',
                    'bg-primary-100 text-primary-700': selectedFeedback.Status === 'responded'
                  }"
                >
                  {{ selectedFeedback.Status }}
                </span>
              </div>

              <div>
                <p class="text-xs text-slate-600 uppercase font-bold">Category</p>
                <p class="mt-1 text-sm font-semibold text-slate-900">{{ selectedFeedback.Category }}</p>
              </div>

              <div>
                <p class="text-xs text-slate-600 uppercase font-bold">Rating</p>
                <div class="mt-1 flex items-center space-x-1">
                  <span v-for="i in 5" :key="i" class="text-lg">
                    {{ i <= selectedFeedback.Rating ? '⭐' : '☆' }}
                  </span>
                </div>
              </div>

              <div>
                <p class="text-xs text-slate-600 uppercase font-bold">Submitted</p>
                <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatDate(selectedFeedback.Created_at) }}</p>
              </div>
            </div>

            <!-- Message -->
            <div class="bg-slate-50 rounded-lg p-4">
              <p class="text-xs font-bold text-slate-600 uppercase mb-2">Feedback Message</p>
              <p class="text-slate-700 whitespace-pre-wrap">{{ selectedFeedback.Message }}</p>
            </div>

            <!-- Response Section -->
            <div>
              <p class="text-sm font-bold text-slate-900 mb-4">Response</p>

              <div v-if="selectedFeedback.Response" class="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                <p class="text-xs font-bold text-primary-700 uppercase mb-2">Your Response</p>
                <p class="text-slate-700 mb-2">{{ selectedFeedback.Response }}</p>
                <p class="text-xs text-slate-500">{{ formatDate(selectedFeedback.Responded_at) }}</p>
              </div>

              <div v-if="selectedFeedback.Status === 'pending'" class="space-y-3">
                <textarea
                  v-model="responseText"
                  placeholder="Type your response here..."
                  rows="4"
                  class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                ></textarea>
                <button
                  @click="respondToFeedback"
                  :disabled="isResponding || !responseText.trim()"
                  class="w-full px-4 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <span v-if="!isResponding">Send Response</span>
                  <span v-else>Sending...</span>
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-4 border-t border-slate-200">
              <button
                @click="deleteFeedback"
                class="w-full px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'
import { XIcon } from 'lucide-vue-next'
import { showError, showDeleteConfirm } from '@/utils/dialog'

const allFeedback = ref([])
const selectedFeedback = ref(null)
const responseText = ref('')
const isResponding = ref(false)

const filterStatus = ref('')
const filterCategory = ref('')
const searchQuery = ref('')

const stats = ref({
  total: 0,
  pending: 0,
  responded: 0,
  avg_rating: 0
})

const filteredFeedback = computed(() => {
  return allFeedback.value.filter(f => {
    const statusMatch = !filterStatus.value || f.Status === filterStatus.value
    const categoryMatch = !filterCategory.value || f.Category === filterCategory.value
    const searchMatch = !searchQuery.value || 
      f.Title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      f.Message.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      `${f.First_Name} ${f.SurName}`.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    return statusMatch && categoryMatch && searchMatch
  })
})

const fetchFeedback = async () => {
  try {
    const res = await api.get('/feedback')
    allFeedback.value = res.data.feedback || []
    stats.value = res.data.stats || {}
  } catch (err) {
    console.error('Failed to fetch feedback:', err)
  }
}

const respondToFeedback = async () => {
  if (!responseText.value.trim()) {
    showError('Please type a response', 'Empty Response')
    return
  }

  isResponding.value = true
  try {
    const res = await api.put(`/feedback/${selectedFeedback.value.Feedback_ID}/respond`, {
      response: responseText.value
    })

    if (res.data.success) {
      selectedFeedback.value.Response = responseText.value
      selectedFeedback.value.Status = 'responded'
      selectedFeedback.value.Responded_at = new Date().toISOString()
      responseText.value = ''
      await fetchFeedback()
    }
  } catch (err) {
    console.error('Failed to send response:', err)
    showError('Failed to send response', 'Error')
  } finally {
    isResponding.value = false
  }
}

const deleteFeedback = async () => {
  showDeleteConfirm('Feedback', async () => {
    try {
      const res = await api.delete(`/feedback/${selectedFeedback.value.Feedback_ID}`)
      if (res.data.success) {
        selectedFeedback.value = null
        await fetchFeedback()
      }
    } catch (err) {
      console.error('Failed to delete feedback:', err)
      showError('Failed to delete feedback', 'Error')
    }
  })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchFeedback()
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.max-h-90-vh {
  max-height: 90vh;
}
</style>
