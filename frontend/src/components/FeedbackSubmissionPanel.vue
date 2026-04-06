<template>
  <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 lg:p-10">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-8">
      <MessageSquare class="w-6 h-6 text-primary-600" />
      <h3 class="text-2xl font-black text-slate-900">Send Feedback</h3>
    </div>

    <!-- Description -->
    <p class="text-sm text-slate-600 mb-6">
      Help us improve TrackTimi by sharing your feedback, suggestions, or concerns. Your input is valuable to our development team.
    </p>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Category Selection -->
      <div>
        <label class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3">
          Category
        </label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            @click="selectedCategory = cat.id"
            :class="{
              'bg-primary-600 text-white border-primary-600': selectedCategory === cat.id,
              'bg-white text-slate-700 border-slate-200 hover:border-primary-300': selectedCategory !== cat.id
            }"
            class="px-4 py-2 rounded-lg border-2 font-bold text-sm transition-all"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- Title -->
      <div>
        <label class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
          Subject / Title <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          placeholder="What is this feedback about?"
          class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
          maxlength="150"
          required
        />
        <p class="text-xs text-slate-500 mt-1">{{ form.title.length }}/150 characters</p>
      </div>

      <!-- Message -->
      <div>
        <label class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
          Message <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="form.message"
          placeholder="Provide details about your feedback..."
          rows="5"
          class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all resize-none"
          maxlength="500"
          required
        ></textarea>
        <p class="text-xs text-slate-500 mt-1">{{ form.message.length }}/500 characters</p>
      </div>

      <!-- Rating (for complaints/feedback) -->
      <div v-if="selectedCategory !== 'suggestion'">
        <label class="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3">
          How satisfied are you?
        </label>
        <div class="flex gap-2">
          <button
            v-for="i in 5"
            :key="i"
            type="button"
            @click="form.rating = i"
            class="transition-transform hover:scale-110"
          >
            <Star
              :class="{
                'fill-yellow-400 text-yellow-400': i <= form.rating,
                'text-slate-300': i > form.rating
              }"
              class="w-8 h-8 transition-all"
            />
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          :disabled="isSubmitting || !form.title.trim() || !form.message.trim()"
          class="flex-1 px-6 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send v-if="!isSubmitting" class="w-4 h-4" />
          <span v-if="isSubmitting" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isSubmitting ? 'Submitting...' : 'Send Feedback' }}
        </button>
        <button
          type="button"
          @click="resetForm"
          class="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-all"
        >
          Clear
        </button>
      </div>
    </form>

    <!-- Success Message -->
    <Transition name="fade">
      <div v-if="showSuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
        <CheckCircle2 class="w-5 h-5 shrink-0" />
        <div>
          <p class="font-bold">Thank you for your feedback!</p>
          <p class="text-sm">Your feedback has been sent to the development team.</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MessageSquare, Star, Send, CheckCircle2 } from 'lucide-vue-next'
import * as feedbackApi from '@/services/feedbackApi'

// State
const selectedCategory = ref('suggestion')
const form = ref({
  title: '',
  message: '',
  category: 'suggestion',
  rating: 5
})
const isSubmitting = ref(false)
const showSuccess = ref(false)

const categories = [
  { id: 'suggestion', label: 'Suggestion' },
  { id: 'complaint', label: 'Complaint' },
  { id: 'praise', label: 'Praise' },
  { id: 'question', label: 'Question' }
]

const emit = defineEmits(['feedback-sent', 'error'])

const handleSubmit = async () => {
  if (!form.value.title.trim() || !form.value.message.trim()) {
    return
  }

  isSubmitting.value = true
  try {
    await feedbackApi.submitFeedback({
      title: form.value.title,
      message: form.value.message,
      category: selectedCategory.value,
      rating: form.value.rating
    })

    // Show success message
    showSuccess.value = true
    
    // Emit event to parent for notifications
    emit('feedback-sent', {
      title: form.value.title,
      category: selectedCategory.value
    })
    
    resetForm()

    // Hide success after 5 seconds
    setTimeout(() => {
      showSuccess.value = false
    }, 5000)
  } catch (error) {
    console.error('Error submitting feedback:', error)
    emit('error', error.response?.data?.error || 'Failed to submit feedback')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    message: '',
    category: 'suggestion',
    rating: 5
  }
  selectedCategory.value = 'suggestion'
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
