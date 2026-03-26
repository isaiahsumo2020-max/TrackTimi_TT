<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ userName }}'s Dashboard</h1>
      <p class="text-xl text-gray-600">Your personal schedule & check-ins</p>
    </div>

    <!-- Today's Status -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-200">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <span class="text-2xl text-white">📍</span>
          </div>
          <div>
            <p class="text-sm font-medium text-green-700 uppercase tracking-wide">Today</p>
            <p class="text-3xl font-bold text-green-900">{{ todayStatus }}</p>
          </div>
        </div>
        <p class="text-green-800 text-sm">{{ todayTime }}</p>
      </div>

      <!-- Upcoming Shifts -->
      <div class="lg:col-span-2 p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <h3 class="text-xl font-bold mb-6 flex items-center space-x-2">
          <span>📅</span>
          <span>Upcoming Shifts</span>
        </h3>
        <div v-if="shifts.length" class="space-y-4">
          <div v-for="shift in shifts" :key="shift.Shift_ID" class="p-6 bg-gray-50 rounded-xl border-l-4 border-blue-500">
            <div class="flex justify-between items-start mb-2">
              <span class="font-bold text-lg">{{ shift.Shift_Title }}</span>
              <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">
                {{ shift.Depart_Name }}
              </span>
            </div>
            <p class="text-gray-600 mb-3">{{ shift.Shift_Description }}</p>
            <div class="flex space-x-6 text-sm text-gray-500">
              <span>{{ formatDate(shift.Start_Time) }}</span>
              <span>→</span>
              <span>{{ formatDate(shift.End_Time) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12 text-gray-500">
          <span class="text-4xl mb-4 block">📭</span>
          <p>No shifts scheduled</p>
        </div>
      </div>
    </div>

    <!-- Recent Check-ins -->
    <div class="p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
      <h3 class="text-xl font-bold mb-6">📍 Recent Check-ins</h3>
      <div v-if="checkins.length" class="space-y-4">
        <div v-for="checkin in checkins" :key="checkin.Attend_ID" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
              {{ checkin.initials }}
            </div>
            <div>
              <p class="font-semibold">{{ checkin.Check_Type }}</p>
              <p class="text-sm text-gray-500">{{ formatDateTime(checkin.Check_in_time) }}</p>
            </div>
          </div>
          <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
            {{ checkin.Depart_Name }}
          </span>
        </div>
      </div>
      <div v-else class="text-center py-12 text-gray-500">
        <span class="text-4xl mb-4 block">⏰</span>
        <p>No check-ins yet</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

const userName = computed(() => `${authStore.user?.firstName || ''} ${authStore.user?.lastName || ''}`.trim() || 'User')
const todayStatus = ref('Checked Out')
const todayTime = ref('--:--')
const shifts = ref([])
const checkins = ref([])

onMounted(async () => {
  await loadUserData()
})

const loadUserData = async () => {
  try {
    // My shifts
    const shiftsRes = await fetch(`/api/org/shifts/my`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    shifts.value = await shiftsRes.json()

    // My checkins
    const checkinsRes = await fetch(`/api/org/checkins/my`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const checkinsData = await checkinsRes.json()
    checkins.value = checkinsData.map(c => ({
      ...c,
      initials: (c.First_Name[0] + c.SurName[0]).toUpperCase()
    }))

    // Today status
    if (checkins.value.length) {
      const today = checkins.value[0]
      todayStatus.value = today.Check_Type === 'IN' ? 'Checked In' : 'Checked Out'
      todayTime.value = new Date(today.Check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  } catch (error) {
    console.error('User data load error:', error)
  }
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString()
const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString()
</script>
