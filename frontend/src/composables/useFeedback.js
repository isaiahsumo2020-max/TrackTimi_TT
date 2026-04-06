import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useFeedback = () => {
  const feedback = ref([])
  const selectedFeedback = ref(null)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const stats = ref({
    total: 0,
    pending: 0,
    responded: 0,
    avg_rating: 0
  })

  // Fetch all feedback
  const fetchFeedback = async (limit = 50) => {
    isLoading.value = true
    try {
      const res = await api.get('/feedback', { params: { limit } })
      feedback.value = res.data.feedback || []
      stats.value = res.data.stats || {}
      return feedback.value
    } catch (err) {
      console.error('Failed to fetch feedback:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get feedback by category
  const getFeedbackByCategory = async (category) => {
    try {
      const res = await api.get(`/feedback/category/${category}`)
      return res.data.feedback || []
    } catch (err) {
      console.error('Failed to fetch feedback by category:', err)
      throw err
    }
  }

  // Get feedback by status
  const getFeedbackByStatus = async (status) => {
    try {
      const res = await api.get(`/feedback/status/${status}`)
      return res.data.feedback || []
    } catch (err) {
      console.error('Failed to fetch feedback by status:', err)
      throw err
    }
  }

  // Get single feedback
  const getFeedback = async (feedbackId) => {
    try {
      const res = await api.get(`/feedback/${feedbackId}`)
      selectedFeedback.value = res.data.feedback
      return res.data.feedback
    } catch (err) {
      console.error('Failed to fetch feedback:', err)
      throw err
    }
  }

  // Submit feedback
  const submitFeedback = async (feedbackData) => {
    isSubmitting.value = true
    try {
      const res = await api.post('/feedback', feedbackData)
      if (res.data.success) {
        await fetchFeedback()
        return res.data.feedback
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err)
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  // Respond to feedback
  const respondToFeedback = async (feedbackId, response) => {
    try {
      const res = await api.put(`/feedback/${feedbackId}/respond`, { response })
      if (res.data.success) {
        await fetchFeedback()
      }
      return res.data
    } catch (err) {
      console.error('Failed to respond to feedback:', err)
      throw err
    }
  }

  // Update feedback status
  const updateFeedbackStatus = async (feedbackId, status) => {
    try {
      const res = await api.put(`/feedback/${feedbackId}/status`, { status })
      if (res.data.success) {
        await fetchFeedback()
      }
      return res.data
    } catch (err) {
      console.error('Failed to update feedback status:', err)
      throw err
    }
  }

  // Delete feedback
  const deleteFeedback = async (feedbackId) => {
    try {
      const res = await api.delete(`/feedback/${feedbackId}`)
      if (res.data.success) {
        await fetchFeedback()
      }
      return res.data
    } catch (err) {
      console.error('Failed to delete feedback:', err)
      throw err
    }
  }

  // Get feedback stats
  const getStats = computed(() => stats.value)

  // Get pending feedback
  const pendingFeedback = computed(() => 
    feedback.value.filter(f => f.Status === 'pending')
  )

  // Get responded feedback
  const respondedFeedback = computed(() => 
    feedback.value.filter(f => f.Status === 'responded')
  )

  return {
    feedback,
    selectedFeedback,
    isLoading,
    isSubmitting,
    stats: getStats,
    pendingFeedback,
    respondedFeedback,
    fetchFeedback,
    getFeedbackByCategory,
    getFeedbackByStatus,
    getFeedback,
    submitFeedback,
    respondToFeedback,
    updateFeedbackStatus,
    deleteFeedback
  }
}
