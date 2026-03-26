<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Employee Dashboard</h1>
          <p class="mt-1 text-sm text-gray-500">Personal performance and attendance overview</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p class="text-xs text-gray-500 uppercase tracking-wide">My Check-ins</p>
          <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats.myCheckins }}</p>
          <p class="text-sm text-gray-500 mt-1">This month</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p class="text-xs text-gray-500 uppercase tracking-wide">On-time Rate</p>
          <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats.onTimeRate }}%</p>
          <p class="text-sm text-gray-500 mt-1">Last 30 days</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Overtime Hours</p>
          <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats.overtime }}</p>
          <p class="text-sm text-gray-500 mt-1">This month</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Leave Days Used</p>
          <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats.leaveDays }}</p>
          <p class="text-sm text-gray-500 mt-1">This year</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900">Weekly Check-in Trend</h2>
          </div>
          <div class="h-56 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300">
            Chart placeholder
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900">My Task Summary</h2>
          </div>
          <div class="space-y-3">
            <p class="text-sm text-gray-700">Completed tasks: <strong>{{ stats.completedTasks }}</strong></p>
            <p class="text-sm text-gray-700">Pending tasks: <strong>{{ stats.pendingTasks }}</strong></p>
            <p class="text-sm text-gray-700">Upcoming deadlines: <strong>{{ stats.deadlines }}</strong></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref({
  myCheckins: 28,
  onTimeRate: 93,
  overtime: 6,
  leaveDays: 2,
  completedTasks: 21,
  pendingTasks: 5,
  deadlines: 3
})
</script>

<style scoped>
</style>
