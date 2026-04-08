<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Schedule Management</h1>
            <p class="text-sm text-gray-600 mt-1">Manage shift types and employee schedules</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Tabs -->
      <div class="flex space-x-1 mb-8 bg-white rounded-lg shadow p-1">
        <button
          @click="activeTab = 'shift-types'"
          :class="[
            'flex-1 px-4 py-2 rounded-md font-medium transition-colors',
            activeTab === 'shift-types'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Shift Types
        </button>
        <button
          @click="activeTab = 'schedules'"
          :class="[
            'flex-1 px-4 py-2 rounded-md font-medium transition-colors',
            activeTab === 'schedules'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Employee Schedules
        </button>
      </div>

      <!-- ============= SHIFT TYPES TAB ============= -->
      <div v-if="activeTab === 'shift-types'" class="space-y-8">
        <!-- Add Shift Type Button -->
        <div class="flex justify-end">
          <button @click="openShiftTypeModal()"
                  class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <PlusIcon class="w-5 h-5" />
            Add Shift Type
          </button>
        </div>

        <!-- Shift Types Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="shiftType in shiftTypes" :key="shiftType.ShiftType_ID"
               class="bg-primary-50 rounded-lg shadow p-6 border-l-4 border-primary-400">
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="text-lg font-bold text-gray-900">{{ shiftType.ShiftType_Name }}</h3>
                <p class="text-sm text-gray-600">{{ shiftType.Description || 'No description' }}</p>
              </div>
              <div class="flex gap-2">
                <button @click="editShiftType(shiftType)" class="text-primary-600 hover:text-primary-900">
                  <EditIcon class="w-5 h-5" />
                </button>
                <button @click="deleteShiftType(shiftType.ShiftType_ID)" class="text-red-600 hover:text-red-900">
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
            <div class="bg-primary-100 p-3 rounded-lg">
              <div class="flex justify-between text-sm">
                <span class="text-slate-600">Start:</span>
                <span class="font-semibold text-slate-900">{{ shiftType.Start_Time }}</span>
              </div>
              <div class="flex justify-between text-sm mt-2">
                <span class="text-slate-600">End:</span>
                <span class="font-semibold text-slate-900">{{ shiftType.End_Time }}</span>
              </div>
            </div>
          </div>

          <div v-if="shiftTypes.length === 0" class="col-span-full text-center py-12 text-gray-500">
            <p>No shift types yet. Create one to get started!</p>
          </div>
        </div>
      </div>

      <!-- ============= SCHEDULES TAB ============= -->
      <div v-if="activeTab === 'schedules'" class="space-y-8">
        <!-- Add Schedule Button -->
        <div class="flex justify-end">
          <button @click="openScheduleModal()"
                  class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <PlusIcon class="w-5 h-5" />
            Create Schedule
          </button>
        </div>

        <!-- Schedules List -->
        <div class="space-y-4">
          <div v-for="schedule in schedules" :key="schedule.Schedule_ID"
               class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="p-6 border-l-4 border-primary-400 bg-primary-50">
              <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                  <h3 class="text-lg font-bold text-gray-900">{{ schedule.Schedule_Name }}</h3>
                  <p class="text-sm text-gray-600">{{ schedule.Description || 'No description' }}</p>
                </div>
                <div class="flex gap-2">
                  <button @click="editSchedule(schedule)" class="text-primary-600 hover:text-primary-900">
                    <EditIcon class="w-5 h-5" />
                  </button>
                  <button @click="deleteSchedule(schedule.Schedule_ID)" class="text-red-600 hover:text-red-900">
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-primary-100 rounded-lg">
                <div>
                  <p class="text-xs text-gray-600 uppercase">Shift Type</p>
                  <p class="text-sm font-semibold text-gray-900">{{ schedule.ShiftType_Name }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 uppercase">Time Range</p>
                  <p class="text-sm font-semibold text-gray-900">{{ schedule.Start_Time }} - {{ schedule.End_Time }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 uppercase">Period</p>
                  <p class="text-sm font-semibold text-gray-900">{{ formatDate(schedule.Start_Date) }} to {{ formatDate(schedule.End_Date) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600 uppercase">Employees</p>
                  <p class="text-sm font-semibold text-gray-900">{{ schedule.employees.length }}</p>
                </div>
              </div>

              <!-- Employees List -->
              <div class="border-t pt-4">
                <p class="text-xs font-semibold text-gray-600 uppercase mb-2">Assigned Employees</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="emp in schedule.employees" :key="emp.User_ID"
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {{ emp.First_Name }} {{ emp.SurName }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="schedules.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            <p>No schedules yet. Create one to get started!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============= SHIFT TYPE MODAL ============= -->
    <div v-if="showShiftTypeModal"
         class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
         @click="closeShiftTypeModal">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white"
           @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingShiftType ? 'Edit Shift Type' : 'Create New Shift Type' }}
          </h3>

          <form @submit.prevent="saveShiftType" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Shift Type Name *</label>
              <input v-model="shiftTypeForm.name" type="text" required placeholder="e.g., Morning Shift"
                     class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <input v-model="shiftTypeForm.startTime" type="time" required
                       class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                <input v-model="shiftTypeForm.endTime" type="time" required
                       class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea v-model="shiftTypeForm.description" placeholder="Optional description"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"></textarea>
            </div>

            <div v-if="error" class="bg-red-50 p-3 rounded-xl border border-red-200">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button type="button" @click="closeShiftTypeModal"
                      class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">
                Cancel
              </button>
              <button type="submit" :disabled="loading"
                      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-400">
                {{ loading ? 'Saving...' : editingShiftType ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ============= SCHEDULE MODAL ============= -->
    <div v-if="showScheduleModal"
         class="fixed inset-0 bg-slate-900/60 backdrop-blur-md overflow-y-auto h-full w-full z-50"
         @click="closeScheduleModal">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-2xl bg-primary-50"
           @click.stop>
        <div class="mt-3 max-h-screen overflow-y-auto">
          <h3 class="text-lg font-medium text-slate-900 mb-4">
            {{ editingSchedule ? 'Edit Schedule' : 'Create New Schedule' }}
          </h3>

          <form @submit.prevent="saveSchedule" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Schedule Name *</label>
              <input v-model="scheduleForm.name" type="text" required placeholder="e.g., Weekly Morning Shift"
                     class="w-full bg-white border border-primary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Select Shift Type *</label>
              <select v-model="scheduleForm.shiftTypeId" required
                      class="w-full bg-white border border-primary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Choose a shift type</option>
                <option v-for="shift in shiftTypes" :key="shift.ShiftType_ID" :value="shift.ShiftType_ID">
                  {{ shift.ShiftType_Name }} ({{ shift.Start_Time }} - {{ shift.End_Time }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
                <input v-model="scheduleForm.startDate" type="date" required
                       class="w-full bg-white border border-primary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Month</label>
                <input v-model="scheduleForm.month" type="text" disabled
                       class="w-full bg-primary-100 border border-primary-200 rounded-lg px-3 py-2 text-slate-600">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">End Date *</label>
                <input v-model="scheduleForm.endDate" type="date" required
                       class="w-full bg-white border border-primary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea v-model="scheduleForm.description" placeholder="Optional description"
                        class="w-full bg-white border border-primary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 h-16"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Select Employees *</label>
              <div class="border border-primary-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                <div v-for="emp in employees" :key="emp.User_ID" class="flex items-center mb-2">
                  <input :id="`emp-${emp.User_ID}`" v-model="scheduleForm.employeeIds" :value="emp.User_ID" type="checkbox"
                         class="h-4 w-4 text-primary-600 rounded cursor-pointer">
                  <label :for="`emp-${emp.User_ID}`" class="ml-3 text-sm text-slate-700 cursor-pointer">
                    {{ emp.First_Name }} {{ emp.SurName }} ({{ emp.Employee_ID || 'N/A' }})
                  </label>
                </div>
              </div>
              <p class="mt-1 text-xs text-slate-600">Selected: {{ scheduleForm.employeeIds.length }} employee(s)</p>
            </div>

            <div v-if="error" class="bg-red-50 p-3 rounded-lg border border-red-200">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t border-primary-200">
              <button type="button" @click="closeScheduleModal"
                      class="px-4 py-2 border border-primary-200 rounded-lg text-slate-700 hover:bg-primary-100 font-medium">
                Cancel
              </button>
              <button type="submit" :disabled="loading || scheduleForm.employeeIds.length === 0"
                      class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:bg-slate-400">
                {{ loading ? 'Saving...' : editingSchedule ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-vue-next'
import api from '@/utils/api'

// State
const activeTab = ref('shift-types')
const shiftTypes = ref([])
const schedules = ref([])
const employees = ref([])
const loading = ref(false)
const error = ref('')

const showShiftTypeModal = ref(false)
const editingShiftType = ref(null)
const shiftTypeForm = ref({
  name: '',
  startTime: '',
  endTime: '',
  description: '',
  colorCode: '#3b82f6'
})

const showScheduleModal = ref(false)
const editingSchedule = ref(null)
const scheduleForm = ref({
  name: '',
  shiftTypeId: '',
  startDate: '',
  endDate: '',
  month: '',
  description: '',
  employeeIds: []
})

// Watch start date to update month
watch(() => scheduleForm.value.startDate, (newDate) => {
  if (newDate) {
    const date = new Date(newDate + 'T00:00:00')
    scheduleForm.value.month = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
})

// Lifecycle
onMounted(async () => {
  await loadData()
})

// Methods
const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [shiftsRes, schedulesRes, employeesRes] = await Promise.all([
      api.get('/org/shift-types'),
      api.get('/org/schedules'),
      api.get('/org/users')
    ])

    shiftTypes.value = shiftsRes.data || []
    schedules.value = schedulesRes.data || []

    // Normalize and filter employees
    const rawEmployees = employeesRes.data || []
    employees.value = rawEmployees
      .filter(emp => (emp.userTypeId || emp.User_Type_ID) !== 1)
      .map(emp => ({
        User_ID: emp.userId || emp.User_ID,
        First_Name: emp.firstName || emp.First_Name,
        SurName: emp.surName || emp.SurName,
        Email: emp.email || emp.Email,
        Employee_ID: emp.employeeId || emp.Employee_ID,
        User_Type_ID: emp.userTypeId || emp.User_Type_ID
      }))

    console.log('✅ Data loaded successfully')
  } catch (err) {
    console.error('❌ Failed to load data:', err)
    error.value = 'Failed to load data. Please refresh the page.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Shift Type Methods
const openShiftTypeModal = () => {
  editingShiftType.value = null
  resetShiftTypeForm()
  showShiftTypeModal.value = true
}

const editShiftType = (shiftType) => {
  editingShiftType.value = shiftType
  shiftTypeForm.value = {
    name: shiftType.ShiftType_Name,
    startTime: shiftType.Start_Time,
    endTime: shiftType.End_Time,
    description: shiftType.Description || '',
    colorCode: shiftType.Color_Code || '#3b82f6'
  }
  showShiftTypeModal.value = true
}

const closeShiftTypeModal = () => {
  showShiftTypeModal.value = false
  editingShiftType.value = null
  resetShiftTypeForm()
}

const resetShiftTypeForm = () => {
  shiftTypeForm.value = {
    name: '',
    startTime: '',
    endTime: '',
    description: '',
    colorCode: '#3b82f6'
  }
  error.value = ''
}

const saveShiftType = async () => {
  error.value = ''

  if (!shiftTypeForm.value.name || !shiftTypeForm.value.startTime || !shiftTypeForm.value.endTime) {
    error.value = 'Name, start time, and end time are required'
    return
  }

  loading.value = true

  try {
    const payload = {
      name: shiftTypeForm.value.name,
      startTime: shiftTypeForm.value.startTime,
      endTime: shiftTypeForm.value.endTime,
      description: shiftTypeForm.value.description,
      colorCode: shiftTypeForm.value.colorCode
    }

    if (editingShiftType.value) {
      await api.put(`/org/shift-types/${editingShiftType.value.ShiftType_ID}`, payload)
      console.log('✅ Shift type updated')
    } else {
      await api.post('/org/shift-types', payload)
      console.log('✅ Shift type created')
    }

    await loadData()
    closeShiftTypeModal()
  } catch (err) {
    console.error('❌ Failed to save shift type:', err)
    error.value = err.response?.data?.error || 'Failed to save shift type'
  } finally {
    loading.value = false
  }
}

const deleteShiftType = async (shiftTypeId) => {
  if (!confirm('Are you sure you want to delete this shift type?')) return

  loading.value = true

  try {
    await api.delete(`/org/shift-types/${shiftTypeId}`)
    console.log('✅ Shift type deleted')
    await loadData()
  } catch (err) {
    console.error('❌ Failed to delete shift type:', err)
    error.value = 'Failed to delete shift type'
  } finally {
    loading.value = false
  }
}

// Schedule Methods
const openScheduleModal = () => {
  editingSchedule.value = null
  resetScheduleForm()
  showScheduleModal.value = true
}

const editSchedule = (schedule) => {
  editingSchedule.value = schedule
  scheduleForm.value = {
    name: schedule.Schedule_Name,
    shiftTypeId: schedule.ShiftType_ID.toString(),
    startDate: schedule.Start_Date,
    endDate: schedule.End_Date,
    month: formatDate(schedule.Start_Date),
    description: schedule.Description || '',
    employeeIds: schedule.employees.map(e => e.User_ID)
  }
  showScheduleModal.value = true
}

const closeScheduleModal = () => {
  showScheduleModal.value = false
  editingSchedule.value = null
  resetScheduleForm()
}

const resetScheduleForm = () => {
  scheduleForm.value = {
    name: '',
    shiftTypeId: '',
    startDate: '',
    endDate: '',
    month: '',
    description: '',
    employeeIds: []
  }
  error.value = ''
}

const saveSchedule = async () => {
  error.value = ''

  if (!scheduleForm.value.name || !scheduleForm.value.shiftTypeId || !scheduleForm.value.startDate || !scheduleForm.value.endDate) {
    error.value = 'Schedule name, shift type, and date range are required'
    return
  }

  if (scheduleForm.value.employeeIds.length === 0) {
    error.value = 'At least one employee must be selected'
    return
  }

  loading.value = true

  try {
    const payload = {
      name: scheduleForm.value.name,
      shiftTypeId: parseInt(scheduleForm.value.shiftTypeId),
      startDate: scheduleForm.value.startDate,
      endDate: scheduleForm.value.endDate,
      description: scheduleForm.value.description,
      employeeIds: scheduleForm.value.employeeIds.map(id => parseInt(id))
    }

    if (editingSchedule.value) {
      await api.put(`/org/schedules/${editingSchedule.value.Schedule_ID}`, payload)
      console.log('✅ Schedule updated')
    } else {
      await api.post('/org/schedules', payload)
      console.log('✅ Schedule created')
    }

    await loadData()
    closeScheduleModal()
  } catch (err) {
    console.error('❌ Failed to save schedule:', err)
    error.value = err.response?.data?.error || 'Failed to save schedule'
  } finally {
    loading.value = false
  }
}

const deleteSchedule = async (scheduleId) => {
  if (!confirm('Are you sure you want to delete this schedule?')) return

  loading.value = true

  try {
    await api.delete(`/org/schedules/${scheduleId}`)
    console.log('✅ Schedule deleted')
    await loadData()
  } catch (err) {
    console.error('❌ Failed to delete schedule:', err)
    error.value = 'Failed to delete schedule'
  } finally {
    loading.value = false
  }
}
</script>