<template>
  <div class="min-h-screen bg-primary-50">
    <!-- Header -->
    <div class="bg-white border-b border-primary-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Time Tracking Report</h1>
            <p class="text-gray-500 mt-1">Monitor employee clock-in, clock-out, and break activities</p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Active Filters Badge -->
            <div class="flex items-center gap-2">
              <div
                v-if="hasActiveFilters"
                class="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
              >
                <FilterIcon class="w-4 h-4" />
                <span>{{ activeFilterCount }} filter{{ activeFilterCount !== 1 ? 's' : '' }} active</span>
              </div>
              <span v-if="filteredReport.length > 0" class="text-sm text-gray-600">
                Showing {{ filteredReport.length }} of {{ report.length }} records
              </span>
            </div>

            <!-- Export Dropdown Menu -->
            <div 
              class="relative"
              data-export-menu
            >
              <button
                @click.stop="showExportMenu = !showExportMenu"
                type="button"
                class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <DownloadIcon class="w-5 h-5 mr-2" />
                Export & Share
              </button>
              
              <!-- Export Menu -->
              <div v-if="showExportMenu" class="absolute right-0 mt-2 w-80 bg-primary-50 rounded-2xl shadow-xl border border-primary-200 py-2 z-50" @click.stop>
                <!-- Filter Summary -->
                <div v-if="hasActiveFilters" class="px-4 py-3 bg-primary-100 border-b border-primary-200">
                  <p class="text-xs font-semibold text-primary-900 uppercase mb-2">Active Filters - Export Scope:</p>
                  <div class="space-y-1 text-xs text-primary-800">
                    <div v-if="filters.value.searchEmployee" class="flex items-center gap-2">
                      <span class="inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                      <span>Employee: <strong>{{ filters.value.searchEmployee }}</strong></span>
                    </div>
                    <div v-if="filters.value.status" class="flex items-center gap-2">
                      <span class="inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                      <span>Status: <strong>{{ filters.value.status }}</strong></span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                      <span>Date Range: <strong>{{ filters.value.startDate }} to {{ filters.value.endDate }}</strong></span>
                    </div>
                    <div class="flex items-center gap-2 pt-1 border-t border-blue-200 mt-1">
                      <span class="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                      <span><strong>{{ filteredReport.length }}</strong> records will be exported</span>
                    </div>
                  </div>
                </div>
                
                <div v-else class="px-4 py-2 text-xs text-slate-500 border-b border-primary-200">
                  Exporting all {{ report.length }} records
                </div>

                <h4 class="px-4 py-2 text-sm font-black text-slate-900 uppercase">Export Format</h4>
                
                <!-- Export CSV -->
                <button @click.stop="exportToCSV()" class="w-full text-left px-4 py-2 hover:bg-primary-100 flex items-center gap-3 text-sm transition-colors">
                  <FileTextIcon class="w-4 h-4 text-primary-600" />
                  <div>
                    <p class="font-semibold text-slate-900">Export CSV</p>
                    <p class="text-[10px] text-slate-500">Lightweight, spreadsheet compatible</p>
                  </div>
                </button>
                
                <!-- Export Excel -->
                <button @click.stop="exportToExcel()" class="w-full text-left px-4 py-2 hover:bg-primary-100 flex items-center gap-3 text-sm transition-colors">
                  <TableIcon class="w-4 h-4 text-green-600" />
                  <div>
                    <p class="font-semibold text-slate-900">Export Excel</p>
                    <p class="text-[10px] text-slate-500">Formatted with styling</p>
                  </div>
                </button>
                
                <!-- Export PDF -->
                <button @click.stop="exportToPDF()" class="w-full text-left px-4 py-2 hover:bg-primary-100 flex items-center gap-3 text-sm transition-colors">
                  <FileIcon class="w-4 h-4 text-red-600" />
                  <div>
                    <p class="font-semibold text-slate-900">Export PDF</p>
                    <p class="text-[10px] text-slate-500">Professional report format</p>
                  </div>
                </button>
                
                <hr class="my-2 border-primary-200" />
                <h4 class="px-4 py-2 text-sm font-black text-slate-900 uppercase">Bulk Actions</h4>
                
                <!-- Individual Reports -->
                <button @click.stop="exportIndividualReports()" class="w-full text-left px-4 py-2 hover:bg-primary-100 flex items-center gap-3 text-sm transition-colors">
                  <UsersIcon class="w-4 h-4 text-primary-600" />
                  <div>
                    <p class="font-semibold text-slate-900">Individual Reports</p>
                    <p class="text-[10px] text-slate-500">Separate file per employee</p>
                  </div>
                </button>
                
                <!-- Share Report -->
                <button @click.stop="shareReport()" class="w-full text-left px-4 py-2 hover:bg-primary-100 flex items-center gap-3 text-sm transition-colors">
                  <ShareIcon class="w-4 h-4 text-primary-600" />
                  <div>
                    <p class="font-semibold text-slate-900">Share Report</p>
                    <p class="text-[10px] text-slate-500">Email or copy link</p>
                  </div>
                </button>

                <hr v-if="hasActiveFilters" class="my-2 border-primary-200" />
                
                <!-- Clear Filters -->
                <button v-if="hasActiveFilters" @click.stop="clearFilters()" class="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-sm">
                  <XCircleIcon class="w-4 h-4 text-red-600" />
                  <div>
                    <p class="font-semibold text-gray-900">Clear Filters</p>
                    <p class="text-[10px] text-gray-500">Reset and export all data</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <!-- Total Present -->
        <div class="bg-primary-50 rounded-xl shadow p-6 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium">Present Today</p>
              <p class="text-3xl font-bold text-slate-900 mt-2">{{ summary.presentCount }}</p>
            </div>
            <UsersIcon class="w-10 h-10 text-green-500 opacity-70" />
          </div>
        </div>

        <!-- Active Shifts -->
        <div class="bg-primary-50 rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium">Active Now</p>
              <p class="text-3xl font-bold text-slate-900 mt-2">{{ summary.activeShifts }}</p>
            </div>
            <TimerIcon class="w-10 h-10 text-blue-500 opacity-70" />
          </div>
        </div>

        <!-- Late Arrivals -->
        <div class="bg-primary-50 rounded-xl shadow p-6 border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium">Late Arrivals</p>
              <p class="text-3xl font-bold text-slate-900 mt-2">{{ summary.lateCount }}</p>
            </div>
            <ClockIcon class="w-10 h-10 text-orange-500 opacity-70" />
          </div>
        </div>

        <!-- Absent -->
        <div class="bg-primary-50 rounded-xl shadow p-6 border-l-4 border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium">Absent</p>
              <p class="text-3xl font-bold text-slate-900 mt-2">{{ summary.absentCount }}</p>
            </div>
            <XCircleIcon class="w-10 h-10 text-red-500 opacity-70" />
          </div>
        </div>

        <!-- Avg Shift Hours -->
        <div class="bg-primary-50 rounded-xl shadow p-6 border-l-4 border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium">Avg Shift</p>
              <p class="text-3xl font-bold text-slate-900 mt-2">{{ summary.averageShiftHours }}h</p>
            </div>
            <BarChart3Icon class="w-10 h-10 text-purple-500 opacity-70" />
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-primary-50 rounded-xl shadow p-6 mb-6 border border-primary-200">
        <h3 class="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FilterIcon class="w-5 h-5 text-primary-600" />
          Filters
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Date From -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">From Date</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full px-3 py-2 border border-primary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              @change="loadReport"
            />
          </div>

          <!-- Date To -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">To Date</label>
            <input
              v-model="filters.endDate"
              type="date"
              class="w-full px-3 py-2 border border-primary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              @change="loadReport"
            />
          </div>

          <!-- Employee Search -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Employee Name</label>
            <input
              v-model="filters.searchEmployee"
              type="text"
              placeholder="Search by name..."
              class="w-full px-3 py-2 border border-primary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              @input="applyFilters"
            />
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-primary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              class="w-full px-4 py-2 bg-primary-200 text-primary-700 rounded-lg hover:bg-primary-300 transition font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-primary-50 rounded-xl shadow p-12 text-center border border-primary-200">
        <div class="inline-block">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
        <p class="text-slate-600 mt-4">Loading time tracking data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-700 font-medium">⚠️ {{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredReport.length === 0" class="bg-primary-50 rounded-xl shadow p-12 text-center border border-primary-200">
        <p class="text-slate-500 text-lg">📭 No time tracking records found for the selected filters.</p>
      </div>

      <!-- Data Table -->
      <div v-else class="bg-white rounded-xl shadow overflow-hidden border border-primary-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-primary-200">
            <thead class="bg-primary-100">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">Employee</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">Clock In</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">Clock Out</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">Duration</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">Breaks</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-primary-200">
              <tr v-for="record in filteredReport" :key="record.attendId" class="hover:bg-primary-50 transition">
                <!-- Employee -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div>
                    <p class="font-medium text-slate-900">{{ record.fullName }}</p>
                    <p class="text-slate-500 text-xs">{{ record.email }}</p>
                  </div>
                </td>

                <!-- Date -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {{ formatDate(record.date) }}
                </td>

                <!-- Clock In -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span v-if="record.clockInTime" class="text-slate-900">{{ record.clockInTime }}</span>
                  <span v-else class="text-slate-400">—</span>
                </td>

                <!-- Clock Out -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span v-if="record.clockOutTime && record.clockOutTime !== 'Active'" class="text-slate-900">{{ record.clockOutTime }}</span>
                  <span v-else class="text-primary-600 font-medium">⏱️ Active</span>
                </td>

                <!-- Duration -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span v-if="record.totalShiftMinutes > 0" class="text-slate-900">
                    {{ formatDuration(record.totalShiftMinutes) }}
                  </span>
                  <span v-else class="text-slate-400">—</span>
                </td>

                <!-- Breaks -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex items-center gap-2">
                    <span v-if="record.totalBreaks > 0" class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                      ☕ {{ record.totalBreaks }} ({{ record.totalBreakMinutes }}m)
                    </span>
                    <span v-else class="text-slate-400">—</span>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="{
                      'bg-green-100 text-green-800': record.status === 'present',
                      'bg-primary-100 text-primary-800': record.status === 'active',
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
                    class="text-primary-600 hover:text-primary-900 font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Info -->
        <div class="bg-primary-100 px-6 py-4 flex items-center justify-between text-sm text-slate-600 border-t border-primary-200">
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
        <div class="bg-primary-50 rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-primary-200" @click.stop>
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-slate-900">Time Tracking Details</h2>
            <button
              @click="showDetailModal = false"
              class="text-slate-500 hover:text-slate-700"
            >
              <XIcon class="w-6 h-6" />
            </button>
          </div>

          <div v-if="selectedRecord" class="space-y-6">
            <!-- Employee Info -->
            <div class="border-b border-primary-200 pb-4">
              <h3 class="text-lg font-semibold text-slate-900 mb-3">Employee Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-slate-600 text-sm">Name</p>
                  <p class="text-slate-900 font-medium">{{ selectedRecord.fullName }}</p>
                </div>
                <div>
                  <p class="text-slate-600 text-sm">Email</p>
                  <p class="text-slate-900 font-medium">{{ selectedRecord.email }}</p>
                </div>
                <div>
                  <p class="text-slate-600 text-sm">Department</p>
                  <p class="text-slate-900 font-medium">{{ selectedRecord.department }}</p>
                </div>
                <div>
                  <p class="text-slate-600 text-sm">Employee ID</p>
                  <p class="text-slate-900 font-medium">{{ selectedRecord.employeeId }}</p>
                </div>
              </div>
            </div>

            <!-- Time Summary -->
            <div class="border-b border-primary-200 pb-4">
              <h3 class="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CalendarIcon class="w-5 h-5 text-primary-600" />
                Time Summary
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-slate-600 text-sm">Date</p>
                  <p class="text-slate-900 font-medium">{{ formatDate(selectedRecord.date) }}</p>
                </div>
                <div>
                  <p class="text-slate-600 text-sm">Status</p>
                  <span
                    :class="{
                      'bg-green-100 text-green-800': selectedRecord.status === 'present',
                      'bg-primary-100 text-primary-800': selectedRecord.status === 'active',
                      'bg-red-100 text-red-800': selectedRecord.status === 'absent',
                      'bg-orange-100 text-orange-800': selectedRecord.status === 'late'
                    }"
                    class="px-3 py-1 rounded-full text-sm font-medium inline-block"
                  >
                    {{ formatStatus(selectedRecord.status) }}
                  </span>
                </div>
                <div>
                  <p class="text-slate-600 text-sm">Clock In</p>
                  <p class="text-slate-900 font-medium">{{ selectedRecord.clockInTime || '—' }}</p>
                </div>
                <div>
                  <p class="text-slate-600 text-sm">Clock Out</p>
                  <p class="text-slate-900 font-medium">{{ selectedRecord.clockOutTime }}</p>
                </div>
                <div>
                  <p class="text-slate-600 text-sm">Total Duration</p>
                  <p class="text-slate-900 font-medium text-lg">{{ formatDuration(selectedRecord.totalShiftMinutes) }}</p>
                </div>
                <div v-if="selectedRecord.isLate">
                  <p class="text-slate-600 text-sm">Minutes Late</p>
                  <p class="text-orange-600 font-medium">⏰ {{ selectedRecord.minutesLate }} min</p>
                </div>
              </div>
            </div>

            <!-- Breaks Taken -->
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-3">☕ Breaks Taken</h3>
              <div v-if="selectedRecord.breaks && selectedRecord.breaks.length > 0">
                <div class="space-y-3">
                  <div
                    v-for="(breakRecord, idx) in selectedRecord.breaks"
                    :key="idx"
                    class="bg-orange-50 border border-orange-200 rounded-lg p-4"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-slate-900">
                          {{ formatBreakType(breakRecord.type) }} {{ breakRecord.type }}
                        </p>
                        <p class="text-sm text-slate-600">Started: {{ breakRecord.startTime }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-lg font-bold text-orange-600">{{ breakRecord.duration }}m</p>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4 bg-primary-100 rounded p-3 border border-primary-200">
                    <p class="text-sm text-slate-600">Total Breaks</p>
                    <p class="text-2xl font-bold text-slate-900">{{ selectedRecord.totalBreakMinutes }} minutes</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-slate-500 text-center py-4">No breaks recorded</div>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="showDetailModal = false"
              class="px-4 py-2 bg-primary-200 text-primary-700 rounded-lg hover:bg-primary-300 transition font-medium"
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
import {
  UsersIcon,
  TimerIcon,
  ClockIcon,
  XCircleIcon,
  BarChart3Icon,
  FilterIcon,
  DownloadIcon,
  FileTextIcon,
  TableIcon,
  FileIcon,
  ShareIcon,
  CalendarIcon,
  CoffeeIcon,
  AlertCircleIcon,
  XIcon
} from 'lucide-vue-next';

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
const showExportMenu = ref(false);

// Computed
const filteredReport = computed(() => {
  return report.value.filter(record => {
    const matchesSearch = !filters.value.searchEmployee || 
      record.fullName.toLowerCase().includes(filters.value.searchEmployee.toLowerCase()) ||
      record.email.toLowerCase().includes(filters.value.searchEmployee.toLowerCase());
    
    return matchesSearch;
  });
});

const hasActiveFilters = computed(() => {
  const defaultStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultEndDate = new Date().toISOString().split('T')[0];
  
  return (
    filters.value.searchEmployee ||
    filters.value.status ||
    filters.value.startDate !== defaultStartDate ||
    filters.value.endDate !== defaultEndDate
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.searchEmployee) count++;
  if (filters.value.status) count++;
  
  const defaultStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultEndDate = new Date().toISOString().split('T')[0];
  
  if (filters.value.startDate !== defaultStartDate || filters.value.endDate !== defaultEndDate) count++;
  
  return count;
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
    'present': 'Present',
    'active': 'Active',
    'absent': 'Absent',
    'late': 'Late'
  };
  return statusMap[status] || status;
};

const formatBreakType = (type) => {
  const typeMap = {
    'lunch': 'Lunch Break',
    'regular': 'Coffee Break',
    'bathroom': 'Restroom Break',
    'restroom': 'Restroom Break'
  };
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

const exportToCSV = () => {
  try {
    console.log('Starting CSV export...', filteredReport.value.length, 'records');
    
    if (filteredReport.value.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare CSV header
    const headers = ['Employee', 'Email', 'Department', 'Employee ID', 'Date', 'Clock In', 'Clock Out', 'Duration', 'Breaks', 'Break Duration', 'Status'];
    
    // Add filter info as comment rows at the top
    const filterInfo = [
      ['# TIME TRACKING REPORT - FILTERED EXPORT'],
      ['# Generated', new Date().toLocaleString()],
      ['# Filter: Date Range', `${filters.value.startDate} to ${filters.value.endDate}`],
      ...(filters.value.searchEmployee ? [['# Filter: Employee', filters.value.searchEmployee]] : []),
      ...(filters.value.status ? [['# Filter: Status', filters.value.status]] : []),
      ['# Total Records Exported', filteredReport.value.length],
      [''],
      [headers.join(',')]
    ];
    
    // Prepare CSV rows
    const rows = filteredReport.value.map(record => [
      record.fullName,
      record.email,
      record.department,
      record.employeeId,
      record.date,
      record.clockInTime || '—',
      record.clockOutTime || '—',
      formatDuration(record.totalShiftMinutes),
      record.totalBreaks > 0 ? record.totalBreaks : '—',
      record.totalBreakMinutes > 0 ? formatDuration(record.totalBreakMinutes) : '—',
      record.status
    ]);

    // Combine header and rows
    const csv = [
      ...filterInfo.map(row => row.map(cell => `"${cell}"`).join(',')),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    const filename = filters.value.searchEmployee 
      ? `time-tracking_${filters.value.searchEmployee.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      : `time-tracking-report_${new Date().toISOString().split('T')[0]}.csv`;
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    console.log('CSV export successful:', filename);
    showExportMenu.value = false;
  } catch (err) {
    console.error('CSV Export Error:', err);
    alert('Failed to export CSV: ' + err.message);
  }
};

const exportToExcel = async () => {
  try {
    console.log('Starting Excel export...', filteredReport.value.length, 'records');
    
    if (filteredReport.value.length === 0) {
      alert('No data to export');
      return;
    }

    // Dynamically import xlsx
    const XLSX = await import('xlsx');
    console.log('XLSX loaded successfully');
    
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary Statistics with Filter Info
    const summaryData = [
      ['Time Tracking Report - Summary'],
      ['Generated', new Date().toLocaleString()],
      ['Period', `${filters.value.startDate} to ${filters.value.endDate}`],
      ...(filters.value.searchEmployee ? [['Employee Filter', filters.value.searchEmployee]] : []),
      ...(filters.value.status ? [['Status Filter', filters.value.status]] : []),
      ['Records Exported', filteredReport.value.length],
      [],
      ['Metric', 'Value'],
      ['Total Records', filteredReport.value.length],
      ['Present Today', filteredReport.value.filter(r => r.status === 'present').length],
      ['Active Shifts', filteredReport.value.filter(r => r.status === 'active').length],
      ['Late Arrivals', filteredReport.value.filter(r => r.status === 'late').length],
      ['Absent', filteredReport.value.filter(r => r.status === 'absent').length],
      ['Average Shift Hours', (filteredReport.value.reduce((sum, r) => sum + (r.totalShiftMinutes || 0), 0) / 60 / (filteredReport.value.length || 1)).toFixed(2)],
      ['Total Break Time', formatDuration(filteredReport.value.reduce((sum, r) => sum + (r.totalBreakMinutes || 0), 0) * 60)],
      ['Unique Employees', new Set(filteredReport.value.map(r => r.employeeId)).size]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 2: Detailed Attendance Records
    const detailData = [
      ['Employee', 'Email', 'Department', 'Employee ID', 'Date', 'Clock In', 'Clock Out', 'Duration', 'Breaks', 'Break Duration', 'Status'],
      ...filteredReport.value.map(record => [
        record.fullName,
        record.email,
        record.department,
        record.employeeId,
        record.date,
        record.clockInTime || '—',
        record.clockOutTime || '—',
        formatDuration(record.totalShiftMinutes),
        record.totalBreaks,
        formatDuration(record.totalBreakMinutes),
        record.status
      ])
    ];
    const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
    detailSheet['!cols'] = [
      { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 10 }, { wch: 15 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Attendance');

    // Sheet 3: Employee Roster (filtered)
    const uniqueEmployees = [...new Map(
      filteredReport.value.map(item => [item.employeeId, item])
    ).values()];
    
    const rosterData = [
      ['Employee Name', 'Email', 'Department', 'Employee ID', 'Status', 'Total Days Present', 'Avg Shift Hours'],
      ...uniqueEmployees.map(emp => {
        const empRecords = filteredReport.value.filter(r => r.employeeId === emp.employeeId);
        const presentDays = empRecords.filter(r => r.status === 'present' || r.status === 'active').length;
        const avgHours = (empRecords.reduce((sum, r) => sum + (r.totalShiftMinutes || 0), 0) / 60 / (presentDays || 1)).toFixed(2);
        return [
          emp.fullName,
          emp.email,
          emp.department,
          emp.employeeId,
          emp.status,
          presentDays,
          avgHours
        ];
      })
    ];
    const rosterSheet = XLSX.utils.aoa_to_sheet(rosterData);
    rosterSheet['!cols'] = [
      { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
      { wch: 15 }, { wch: 18 }, { wch: 18 }
    ];
    XLSX.utils.book_append_sheet(workbook, rosterSheet, 'Roster');

    // Write file with filter-based name
    const filename = filters.value.searchEmployee 
      ? `time-tracking_${filters.value.searchEmployee.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `time-tracking-report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    console.log('Excel export successful:', filename);
    showExportMenu.value = false;
  } catch (err) {
    console.error('Excel Export Error:', err);
    alert('Failed to export to Excel: ' + err.message);
  }
};

const exportToPDF = async () => {
  try {
    console.log('Starting PDF export...', filteredReport.value.length, 'records');
    
    if (filteredReport.value.length === 0) {
      alert('No data to export');
      return;
    }

    // Dynamically import jspdf
    const jsPDF = await import('jspdf');
    const { jsPDF: PDF } = jsPDF;
    console.log('jsPDF loaded successfully');
    
    const doc = new PDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.text('Time Tracking Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Report Info with Filters
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Period: ${filters.value.startDate} to ${filters.value.endDate}`, 20, yPosition);
    yPosition += 5;
    if (filters.value.searchEmployee) {
      doc.text(`Employee Filter: ${filters.value.searchEmployee}`, 20, yPosition);
      yPosition += 5;
    }
    if (filters.value.status) {
      doc.text(`Status Filter: ${filters.value.status}`, 20, yPosition);
      yPosition += 5;
    }
    doc.text(`Records Exported: ${filteredReport.value.length}`, 20, yPosition);
    yPosition += 10;

    // Summary Section
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Summary Statistics', 20, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    const summaryStats = [
      `Total Records: ${filteredReport.value.length}`,
      `Present Today: ${filteredReport.value.filter(r => r.status === 'present').length}`,
      `Active Shifts: ${filteredReport.value.filter(r => r.status === 'active').length}`,
      `Late Arrivals: ${filteredReport.value.filter(r => r.status === 'late').length}`,
      `Absent: ${filteredReport.value.filter(r => r.status === 'absent').length}`,
      `Average Shift: ${(filteredReport.value.reduce((sum, r) => sum + (r.totalShiftMinutes || 0), 0) / 60 / (filteredReport.value.length || 1)).toFixed(2)} hours`,
      `Unique Employees: ${new Set(filteredReport.value.map(r => r.employeeId)).size}`
    ];

    summaryStats.forEach(stat => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(stat, 25, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Employee Details
    doc.setFontSize(12);
    doc.text('Employee Records', 20, yPosition);
    yPosition += 7;

    doc.setFontSize(8);
    
    filteredReport.value.slice(0, 20).forEach((record, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      // Employee info
      doc.setTextColor(0);
      doc.text(`${index + 1}. ${record.fullName}`, 20, yPosition);
      yPosition += 4;

      doc.setTextColor(100);
      doc.setFontSize(7);
      doc.text(`Email: ${record.email} | Dept: ${record.department}`, 25, yPosition);
      yPosition += 3;
      doc.text(`ID: ${record.employeeId} | Date: ${record.date}`, 25, yPosition);
      yPosition += 3;
      doc.text(`Clock In: ${record.clockInTime || '—'} | Clock Out: ${record.clockOutTime || '—'}`, 25, yPosition);
      yPosition += 3;
      doc.text(`Duration: ${formatDuration(record.totalShiftMinutes)} | Breaks: ${record.totalBreaks} | Status: ${record.status}`, 25, yPosition);
      yPosition += 6;

      doc.setFontSize(8);
    });

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    doc.setFontSize(8);
    doc.setTextColor(150);
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    const filename = `time-tracking-report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    console.log('PDF export successful:', filename);
    showExportMenu.value = false;
  } catch (err) {
    console.error('PDF Export Error:', err);
    alert('Failed to export to PDF: ' + err.message);
  }
};

const exportIndividualReports = async () => {
  try {
    console.log('Starting individual reports export...', filteredReport.value.length, 'records');
    
    if (filteredReport.value.length === 0) {
      alert('No data to export');
      return;
    }

    const XLSX = await import('xlsx');
    console.log('XLSX loaded successfully for individual reports');
    
    // Group filtered records by employee
    const employeeGroups = {};
    filteredReport.value.forEach(record => {
      if (!employeeGroups[record.employeeId]) {
        employeeGroups[record.employeeId] = {
          info: record,
          records: []
        };
      }
      employeeGroups[record.employeeId].records.push(record);
    });

    // Create individual file for each employee
    Object.entries(employeeGroups).forEach(([employeeId, empData]) => {
      const workbook = XLSX.utils.book_new();

      // Employee Info Sheet
      const infoData = [
        ['Employee Information'],
        ['Name', empData.info.fullName],
        ['Email', empData.info.email],
        ['Department', empData.info.department],
        ['Employee ID', empData.info.employeeId],
        ['Report Period', `${filters.value.startDate} to ${filters.value.endDate}`],
        ['Generated', new Date().toLocaleString()],
        [],
        ['Total Records', empData.records.length],
        ['Present Days', empData.records.filter(r => r.status === 'present' || r.status === 'active').length],
        ['Late Days', empData.records.filter(r => r.status === 'late').length],
        ['Absent Days', empData.records.filter(r => r.status === 'absent').length],
        ['Total Hours', (empData.records.reduce((sum, r) => sum + (r.totalShiftMinutes || 0), 0) / 60).toFixed(2)],
        ['Total Break Time', formatDuration(empData.records.reduce((sum, r) => sum + (r.totalBreakMinutes || 0), 0))]
      ];
      const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
      infoSheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, infoSheet, 'Info');

      // Attendance Details Sheet
      const detailData = [
        ['Date', 'Clock In', 'Clock Out', 'Duration', 'Breaks', 'Break Duration', 'Status'],
        ...empData.records.map(r => [
          r.date,
          r.clockInTime || '—',
          r.clockOutTime || '—',
          formatDuration(r.totalShiftMinutes),
          r.totalBreaks,
          formatDuration(r.totalBreakMinutes),
          r.status
        ])
      ];
      const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
      detailSheet['!cols'] = [
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 10 }, { wch: 15 }, { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Attendance');

      // Write individual file
      XLSX.writeFile(
        workbook,
        `${empData.info.fullName.replace(/\s+/g, '_')}_time-tracking_${new Date().toISOString().split('T')[0]}.xlsx`
      );
    });

    console.log(`Individual reports export successful for ${Object.keys(employeeGroups).length} employees`);
    showExportMenu.value = false;
  } catch (err) {
    console.error('Individual Export Error:', err);
    alert('Failed to export individual reports: ' + err.message);
  }
};

const shareReport = () => {
  try {
    console.log('Starting share report...', filteredReport.value.length, 'records');
    
    // Create shareable summary with filter info
    const shareData = {
      period: `${filters.value.startDate} to ${filters.value.endDate}`,
      filters: {
        employee: filters.value.searchEmployee || 'None',
        status: filters.value.status || 'All',
        dateRange: `${filters.value.startDate} to ${filters.value.endDate}`
      },
      generatedAt: new Date().toLocaleString(),
      recordCount: filteredReport.value.length
    };

    // Copy to clipboard
    const shareText = `
TIME TRACKING REPORT
Generated: ${shareData.generatedAt}
Period: ${shareData.period}

FILTERS APPLIED:
- Employee: ${shareData.filters.employee}
- Status: ${shareData.filters.status}
- Date Range: ${shareData.filters.dateRange}

SUMMARY:
- Total Records Exported: ${shareData.recordCount}
- Present: ${filteredReport.value.filter(r => r.status === 'present').length}
- Active: ${filteredReport.value.filter(r => r.status === 'active').length}
- Late: ${filteredReport.value.filter(r => r.status === 'late').length}
- Absent: ${filteredReport.value.filter(r => r.status === 'absent').length}
- Average Shift: ${(filteredReport.value.reduce((sum, r) => sum + (r.totalShiftMinutes || 0), 0) / 60 / (filteredReport.value.length || 1)).toFixed(2)} hours
- Unique Employees: ${new Set(filteredReport.value.map(r => r.employeeId)).size}

View full report in the application.
`;

    navigator.clipboard.writeText(shareText).then(() => {
      console.log('Report summary copied to clipboard successfully');
      alert('Report summary copied to clipboard!');
      
      // Optional: Open email client
      const emailBody = encodeURIComponent(shareText);
      const mailtoLink = `mailto:?subject=Time Tracking Report - ${new Date().toLocaleDateString()}&body=${emailBody}`;
      // Uncomment to open email client:
      // window.open(mailtoLink);
    }).catch((err) => {
      console.error('Clipboard copy error:', err);
      alert('Failed to copy to clipboard: ' + err.message);
    });

    showExportMenu.value = false;
  } catch (err) {
    console.error('Share Report Error:', err);
    alert('Failed to share report: ' + err.message);
  }
};

// Lifecycle
onMounted(() => {
  loadReport();
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const exportContainer = document.querySelector('[data-export-menu]');
    if (exportContainer && !exportContainer.contains(e.target) && showExportMenu.value) {
      showExportMenu.value = false;
    }
  });
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
