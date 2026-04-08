<template>
  <div class="feedback-management bg-white rounded-lg shadow-lg p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <MessageCircle class="w-6 h-6 text-indigo-600" />
        <h2 class="text-2xl font-bold text-gray-900">Feedback Management</h2>
      </div>
      <div class="text-sm text-gray-500">
        {{ feedback.length }} total feedback items
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-primary-50 rounded-lg p-4 border-l-4 border-primary-500">
        <p class="text-sm text-gray-600 mb-1">Total Feedback</p>
        <p class="text-2xl font-bold text-primary-600">{{ stats.totalFeedback }}</p>
      </div>
      <div class="bg-accent-50 rounded-lg p-4 border-l-4 border-accent-500">
        <p class="text-sm text-gray-600 mb-1">Open</p>
        <p class="text-2xl font-bold text-accent-600">{{ stats.status.open }}</p>
      </div>
      <div class="bg-primary-50 rounded-lg p-4 border-l-4 border-primary-500">
        <p class="text-sm text-gray-600 mb-1">Responded</p>
        <p class="text-2xl font-bold text-primary-600">{{ stats.status.responded }}</p>
      </div>
      <div class="bg-primary-50 rounded-lg p-4 border-l-4 border-primary-500">
        <p class="text-sm text-gray-600 mb-1">Avg Rating</p>
        <p class="text-2xl font-bold text-primary-600">{{ stats.rating.average }}/5.0</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-4 mb-6">
      <select
        v-model="selectedStatus"
        @change="loadFeedback()"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Statuses</option>
        <option value="open">Open</option>
        <option value="responded">Responded</option>
        <option value="closed">Closed</option>
      </select>

      <select
        v-model="selectedCategory"
        @change="loadFeedback()"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Categories</option>
        <option value="suggestion">Suggestion</option>
        <option value="complaint">Complaint</option>
        <option value="praise">Praise</option>
        <option value="question">Question</option>
      </select>

      <select
        v-model="selectedOrg"
        @change="loadFeedback()"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Organizations</option>
        <option v-for="org in organizations" :key="org.Org_ID" :value="org.Org_ID">
          {{ org.Org_Name }}
        </option>
      </select>

      <button
        @click="loadFeedback()"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
      >
        <RefreshCw class="w-4 h-4" />
        Refresh
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block">
        <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
      <p class="text-gray-500 mt-4">Loading feedback...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="feedback.length === 0" class="text-center py-12">
      <MessageCircle class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500">No feedback found</p>
    </div>

    <!-- Feedback List -->
    <div v-else class="space-y-4">
      <div
        v-for="item in feedback"
        :key="item.Feedback_ID"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-gray-900">{{ item.Title }}</h3>
            <p class="text-sm text-gray-500">
              From {{ item.First_Name }} {{ item.SurName }} • {{ item.Org_Name }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <!-- Status Badge -->
            <span
              :class="{
                'bg-yellow-100 text-yellow-800': item.Status === 'open',
                'bg-primary-100 text-primary-800': item.Status === 'responded',
                'bg-primary-100 text-primary-800': item.Status === 'closed'
              }"
              class="px-2 py-1 rounded text-xs font-medium"
            >
              {{ item.Status }}
            </span>

            <!-- Rating Stars -->
            <div class="flex gap-1">
              <Star
                v-for="i in 5"
                :key="i"
                class="w-4 h-4"
                :class="i <= item.Rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'"
              />
            </div>
          </div>
        </div>

        <!-- Message -->
        <p class="text-gray-700 mb-4 text-sm">{{ item.Message }}</p>

        <!-- Category & Date -->
        <div class="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b">
          <span class="bg-gray-100 px-2 py-1 rounded">{{ item.Category }}</span>
          <span>{{ formatDate(item.Created_at) }}</span>
        </div>

        <!-- Response (if exists) -->
        <div v-if="item.Response" class="bg-gray-50 rounded p-3 mb-4">
          <p class="text-xs font-semibold text-gray-700 mb-1">Response from {{ item.Responded_By }}</p>
          <p class="text-sm text-gray-700">{{ item.Response }}</p>
          <p class="text-xs text-gray-500 mt-2">Responded {{ formatDate(item.Responded_at) }}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            v-if="item.Status === 'open'"
            @click="openResponseModal(item)"
            class="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition flex items-center gap-1"
          >
            <Send class="w-3 h-3" />
            Respond
          </button>

          <select
            v-model="item.Status"
            @change="handleUpdateFeedbackStatus(item.Feedback_ID, item.Status)"
            class="px-3 py-1 text-sm border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="open">Mark Open</option>
            <option value="responded">Mark Responded</option>
            <option value="closed">Mark Closed</option>
          </select>

          <button
            @click="deleteFeedbackItem(item.Feedback_ID, item.Title)"
            class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition flex items-center gap-1"
          >
            <Trash2 class="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Response Modal -->
    <div v-if="showResponseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div class="border-b p-6 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">Respond to Feedback</h3>
          <button
            @click="showResponseModal = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <!-- Feedback Preview -->
          <div class="bg-gray-50 rounded p-4 border border-gray-200">
            <p class="text-sm font-semibold text-gray-700">Original Feedback:</p>
            <p class="font-medium text-gray-900 mt-1">{{ currentFeedback?.Title }}</p>
            <p class="text-sm text-gray-600 mt-2">{{ currentFeedback?.Message }}</p>
          </div>

          <!-- Response Textarea -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
            <textarea
              v-model="responseText"
              placeholder="Write your response here..."
              rows="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
            <p class="text-xs text-gray-500 mt-2">{{ responseText.length }}/500 characters</p>
          </div>
        </div>

        <div class="border-t p-6 flex justify-end gap-3">
          <button
            @click="showResponseModal = false"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            @click="submitResponse()"
            :disabled="!responseText.trim() || isSubmittingResponse"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send class="w-4 h-4" />
            Send Response
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  MessageCircle,
  Star,
  Send,
  Trash2,
  X,
  RefreshCw
} from 'lucide-vue-next'
import {
  getFeedback,
  getFeedbackStats,
  respondToFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getOrganizations
} from '@/services/superadminApi'
import { showDeleteConfirm, showSuccess, showError } from '@/utils/dialog'

// State
const feedback = ref([])
const stats = ref({
  totalFeedback: 0,
  status: { open: 0, responded: 0, closed: 0 },
  rating: { average: 0, distribution: {} }
})
const isLoading = ref(false)
const selectedStatus = ref('')
const selectedCategory = ref('')
const selectedOrg = ref('')
const organizations = ref([])
const showResponseModal = ref(false)
const currentFeedback = ref(null)
const responseText = ref('')
const isSubmittingResponse = ref(false)

// Load feedback
const loadFeedback = async () => {
  isLoading.value = true
  try {
    const response = await getFeedback({
      orgId: selectedOrg.value || undefined,
      status: selectedStatus.value || undefined,
      category: selectedCategory.value || undefined,
      limit: 50
    })

    feedback.value = response.data.feedback || []
  } catch (error) {
    console.error('Error loading feedback:', error)
    showError('Failed to load feedback')
  } finally {
    isLoading.value = false
  }
}

// Load stats
const loadStats = async () => {
  try {
    const response = await getFeedbackStats(selectedOrg.value || null)
    stats.value = response.data.stats || stats.value
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

// Load organizations
const loadOrganizations = async () => {
  try {
    const response = await getOrganizations()
    organizations.value = response.data.organizations || []
  } catch (error) {
    console.error('Error loading organizations:', error)
  }
}

// Open response modal
const openResponseModal = (item) => {
  currentFeedback.value = item
  responseText.value = ''
  showResponseModal.value = true
}

// Submit response
const submitResponse = async () => {
  if (!responseText.value.trim()) {
    showError('Please enter a response')
    return
  }

  isSubmittingResponse.value = true
  try {
    await respondToFeedback(currentFeedback.value.Feedback_ID, responseText.value)
    showSuccess('Response sent successfully')
    showResponseModal.value = false
    await loadFeedback()
    await loadStats()
  } catch (error) {
    console.error('Error submitting response:', error)
    showError(error.response?.data?.error || 'Failed to send response')
  } finally {
    isSubmittingResponse.value = false
  }
}

// Update feedback status
const handleUpdateFeedbackStatus = async (feedbackId, status) => {
  try {
    await updateFeedbackStatus(feedbackId, status)
    showSuccess(`Feedback marked as ${status}`)
    await loadStats()
  } catch (error) {
    console.error('Error updating feedback status:', error)
    showError('Failed to update status')
    await loadFeedback()
  }
}

// Delete feedback
const deleteFeedbackItem = async (feedbackId, title) => {
  showDeleteConfirm(title, async () => {
    try {
      await deleteFeedback(feedbackId)
      showSuccess('Feedback deleted successfully')
      await loadFeedback()
      await loadStats()
    } catch (error) {
      console.error('Error deleting feedback:', error)
      showError('Failed to delete feedback')
    }
  })
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Initialize
onMounted(async () => {
  await loadOrganizations()
  await loadFeedback()
  await loadStats()
})
</script>

<style scoped>
.feedback-management {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

