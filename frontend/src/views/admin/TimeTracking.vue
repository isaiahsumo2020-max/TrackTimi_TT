<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Time Tracking Report</h1>
            <p class="text-gray-500 mt-1">Monitor employee clock-in, clock-out, and break activities</p>
          </div>
          <button
            @click="exportToCSV"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            📥 Export CSV
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <!-- Total Present -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Present Today</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ summary.presentCount }}</p>
            </div>
            <div class="text-4xl">👥</div>
          </div>
        </div>

        <!-- Active Shifts -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Active Now</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ summary.activeShifts }}</p>
            </div>
            <div class="text-4xl">⏱️</div>
          </div>
        </div>

        <!-- Late Arrivals -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Late Arrivals</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ summary.lateCount }}</p>
            </div>
            <div class="text-4xl">⏰</div>
          </div>
        </div>

        <!-- Absent -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Absent</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ summary.absentCount }}</p>
            </div>
            <div class="text-4xl">❌</div>
          </div>
        </div>

        <!-- Avg Shift Hours -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Avg Shift</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ summary.averageShiftHours }}h</p>
            </div>
            <div class="text-4xl">📊</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🔍 Filters</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Date From -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="loadReport"
            />
          </div>

          <!-- Date To -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              v-model="filters.endDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="loadReport"
            />
          </div>

          <!-- Employee Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
            <input
              v-model="filters.searchEmployee"
              type="text"
              placeholder="Search by name..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="applyFilters"
            />
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="loadReport"
            >
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="active">Active</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>

          <!-- Clear Filters -->
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-12 text-center">
        <div class="inline-block">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p class="text-gray-600 mt-4">Loading time tracking data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-700 font-medium">⚠️ {{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredReport.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
        <p class="text-gray-500 text-lg">📭 No time tracking records found for the selected filters.</p>
      </div>

      <!-- Data Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Employee</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Clock In</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Clock Out</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Duration</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Breaks</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="record in filteredReport" :key="record.attendId" class="hover:bg-gray-50 transition">
                <!-- Employee -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div>
                    <p class="font-medium text-gray-900">{{ record.fullName }}</p>
                    <p class="text-gray-500 text-xs">{{ record.email }}</p>
                  </div>
                </td>

                <!-- Date -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ formatDate(record.date) }}
                </td>

                <!-- Clock In -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span v-if="record.clockInTime" class="text-gray-900">{{ record.clockInTime }}</span>
                  <span v-else class="text-gray-400">—</span>
                </td>

                <!-- Clock Out -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span v-if="record.clockOutTime && record.clockOutTime !== 'Active'" class="text-gray-900">{{ record.clockOutTime }}</span>
                  <span v-else class="text-blue-600 font-medium">⏱️ Active</span>
                </td>

                <!-- Duration -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span v-if="record.totalShiftMinutes > 0" class="text-gray-900">
                    {{ formatDuration(record.totalShiftMinutes) }}
                  </span>
                  <span v-else class="text-gray-400">—</span>
                </td>

                <!-- Breaks -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex items-center gap-2">
                    <span v-if="record.totalBreaks > 0" class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                      ☕ {{ record.totalBreaks }} ({{ record.totalBreakMinutes }}m)
                    </span>
                    <span v-else class="text-gray-400">—</span>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="{
                      'bg-green-100 text-green-800': record.status === 'present',
                      'bg-blue-100 text-blue-800': record.status === 'active',
                      'bg-red-100 text-red-800': record.status === 'absent',
                      'bg-orange-100 text-orange-800': record.status === 'late'
                    }"
                    class="px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {{ formatStatus(record.status) }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    @click="viewDetails(record)"
                    class="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Info -->
        <div class="bg-gray-50 px-6 py-4 flex items-center justify-between text-sm text-gray-600">
          <span>Showing {{ filteredReport.length }} of {{ report.length }} records</span>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="showDetailModal = false"></div>

      <!-- Modal -->
      <div class="relative min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6" @click.stop>
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Time Tracking Details</h2>
            <button
              @click="showDetailModal = false"
              class="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div v-if="selectedRecord" class="space-y-6">
            <!-- Employee Info -->
            <div class="border-b pb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Employee Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-gray-600 text-sm">Name</p>
                  <p class="text-gray-900 font-medium">{{ selectedRecord.fullName }}</p>
                </div>
                <div>
                  <p class="text-gray-600 text-sm">Email</p>
                  <p class="text-gray-900 font-medium">{{ selectedRecord.email }}</p>
                </div>
                <div>
                  <p class="text-gray-600 text-sm">Department</p>
                  <p class="text-gray-900 font-medium">{{ selectedRecord.department }}</p>
                </div>
                <div>
                  <p class="text-gray-600 text-sm">Employee ID</p>
                  <p class="text-gray-900 font-medium">{{ selectedRecord.employeeId }}</p>
                </div>
              </div>
            </div>

            <!-- Time Summary -->
            <div class="border-b pb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">📅 Time Summary</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-gray-600 text-sm">Date</p>
                  <p class="text-gray-900 font-medium">{{ formatDate(selectedRecord.date) }}</p>
                </div>
                <div>
                  <p class="text-gray-600 text-sm">Status</p>
                  <span
                    :class="{
                      'bg-green-100 text-green-800': selectedRecord.status === 'present',
                      'bg-blue-100 text-blue-800': selectedRecord.status === 'active',
                      'bg-red-100 text-red-800': selectedRecord.status === 'absent',
                      'bg-orange-100 text-orange-800': selectedRecord.status === 'late'
                    }"
                    class="px-3 py-1 rounded-full text-sm font-medium inline-block"
                  >
                    {{ formatStatus(selectedRecord.status) }}
                  </span>
                </div>
                <div>
                  <p class="text-gray-600 text-sm">Clock In</p>
                  <p class="text-gray-900 font-medium">{{ selectedRecord.clockInTime || '—' }}</p>
                </div>
                <div>
                  <p class="text-gray-600 text-sm">Clock Out</p>
                  <p class="text-gray-900 font-medium">{{ selectedRecord.clockOutTime }}</p>
                </div>
                <div>
                  <p class="text-gray-600 text-sm">Total Duration</p>
                  <p class="text-gray-900 font-medium text-lg">{{ formatDuration(selectedRecord.totalShiftMinutes) }}</p>
                </div>
                <div v-if="selectedRecord.isLate">
                  <p class="text-gray-600 text-sm">Minutes Late</p>
                  <p class="text-orange-600 font-medium">⏰ {{ selectedRecord.minutesLate }} min</p>
                </div>
              </div>
            </div>

            <!-- Breaks Taken -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">☕ Breaks Taken</h3>
              <div v-if="selectedRecord.breaks && selectedRecord.breaks.length > 0">
                <div class="space-y-3">
                  <div
                    v-for="(breakRecord, idx) in selectedRecord.breaks"
                    :key="idx"
                    class="bg-orange-50 border border-orange-200 rounded-lg p-4"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-gray-900">
                          {{ formatBreakType(breakRecord.type) }} {{ breakRecord.type }}
                        </p>
                        <p class="text-sm text-gray-600">Started: {{ breakRecord.startTime }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-lg font-bold text-orange-600">{{ breakRecord.duration }}m</p>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4 bg-gray-100 rounded p-3">
                    <p class="text-sm text-gray-600">Total Breaks</p>
                    <p class="text-2xl font-bold text-gray-900">{{ selectedRecord.totalBreakMinutes }} minutes</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 text-center py-4">No breaks recorded</div>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="showDetailModal = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/utils/api';

// State
const loading = ref(true);
const error = ref(null);
const report = ref([]);
const summary = ref({
  totalRecords: 0,
  presentCount: 0,
  absentCount: 0,
  lateCount: 0,
  activeShifts: 0,
  averageShiftHours: 0,
  totalBreakTime: 0,
  uniqueEmployees: 0
});

const filters = ref({
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
  endDate: new Date().toISOString().split('T')[0], // Today
  searchEmployee: '',
  status: ''
});

const showDetailModal = ref(false);
const selectedRecord = ref(null);

// Computed
const filteredReport = computed(() => {
  return report.value.filter(record => {
    const matchesSearch = !filters.value.searchEmployee || 
      record.fullName.toLowerCase().includes(filters.value.searchEmployee.toLowerCase()) ||
      record.email.toLowerCase().includes(filters.value.searchEmployee.toLowerCase());
    
    return matchesSearch;
  });
});

// Methods
const loadReport = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const params = {
      startDate: filters.value.startDate,
      endDate: filters.value.endDate,
      ...(filters.value.status && { status: filters.value.status })
    };

    const response = await api.get('/org/time-tracking-report', { params });
    
    if (response.data.success) {
      report.value = response.data.report;
      summary.value = response.data.summary;
    } else {
      error.value = 'Failed to load time tracking data';
    }
  } catch (err) {
    console.error('Load Report Error:', err);
    error.value = err.response?.data?.error || 'Failed to load time tracking report';
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  // Real-time filter as user types
};

const clearFilters = () => {
  filters.value.searchEmployee = '';
  filters.value.status = '';
  filters.value.startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  filters.value.endDate = new Date().toISOString().split('T')[0];
  loadReport();
};

const viewDetails = (record) => {
  selectedRecord.value = record;
  showDetailModal.value = true;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatStatus = (status) => {
  const statusMap = {
    'present': '✅ Present',
    'active': '⏱️ Active',
    'absent': '❌ Absent',
    'late': '⏰ Late'
  };
  return statusMap[status] || status;
};

const formatBreakType = (type) => {
  const typeMap = {
    'lunch': '🍽️',
    'regular': '☕',
    'bathroom': '🚻',
    'restroom': '🚻'
  };
  return typeMap[type] || '☕';
};

const exportToCSV = () => {
  if (filteredReport.value.length === 0) {
    alert('No data to export');
    return;
  }

  // Prepare CSV header
  const headers = ['Employee', 'Email', 'Department', 'Date', 'Clock In', 'Clock Out', 'Duration', 'Breaks', 'Status'];
  
  // Prepare CSV rows
  const rows = filteredReport.value.map(record => [
    record.fullName,
    record.email,
    record.department,
    record.date,
    record.clockInTime || '—',
    record.clockOutTime,
    formatDuration(record.totalShiftMinutes),
    record.totalBreaks > 0 ? `${record.totalBreaks} breaks (${record.totalBreakMinutes}m)` : '—',
    record.status
  ]);

  // Combine header and rows
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Download
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
  element.setAttribute('download', `time-tracking-report-${new Date().toISOString().split('T')[0]}.csv`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Lifecycle
onMounted(() => {
  loadReport();
});
</script>

<style scoped>
/* Smooth transitions */
.transition {
  transition: all 0.3s ease;
}

/* Hover effects */
tr:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

/* Loading spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
