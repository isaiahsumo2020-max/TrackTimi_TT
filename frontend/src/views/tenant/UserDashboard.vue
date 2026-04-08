<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 md:py-12 px-4 md:px-6 space-y-8">
    <!-- Real-time Notifications -->
    <RealtimeNotifications 
      :notifications="displayNotifications"
      @dismiss="dismissNotification"
    />

    <div class="max-w-7xl mx-auto space-y-8">
      
      <!-- Header with quick stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div class="bg-white p-4 md:p-6 rounded-lg border border-slate-100 shadow-sm">
          <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Status</p>
          <p class="text-lg md:text-2xl font-black" :class="isCheckedIn ? 'text-green-600' : 'text-slate-600'">
            {{ isCheckedIn ? 'WORKING' : 'OFF-DUTY' }}
          </p>
        </div>
        <div class="bg-white p-4 md:p-6 rounded-lg border border-slate-100 shadow-sm">
          <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">GPS Signal</p>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full animate-pulse" :class="gpsSignalStrength > 70 ? 'bg-green-500' : gpsSignalStrength > 40 ? 'bg-yellow-500' : 'bg-red-500'"></div>
            <p class="text-lg md:text-2xl font-black">{{ gpsSignalStrength }}%</p>
          </div>
        </div>
        <div class="bg-white p-4 md:p-6 rounded-lg border border-slate-100 shadow-sm">
          <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Distance</p>
          <p class="text-lg md:text-2xl font-black text-primary-600">{{ distance }}m</p>
        </div>
        <div class="bg-white p-4 md:p-6 rounded-lg border border-slate-100 shadow-sm">
          <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Time</p>
          <p class="text-lg md:text-xl font-black">{{ currentTime }}</p>
        </div>
      </div>

      <!-- Main Check-in Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        <!-- Enhanced GPS Check-in Card -->
        <div class="lg:col-span-2 bg-gradient-to-br from-primary-600 to-primary-700 p-8 md:p-12 rounded-xl shadow-xl text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div class="relative z-10 space-y-8">
            <!-- Header -->
            <div class="text-center space-y-3">
              <div class="w-16 h-16 md:w-20 h-20 mx-auto bg-white/10 rounded-3xl flex items-center justify-center border-2 border-white/20">
                <MapPinIcon class="w-8 h-8 md:w-10 h-10 text-white" />
              </div>
              <h1 class="text-3xl md:text-5xl font-black tracking-tight">
                {{ isCheckedIn ? 'Clock Out' : 'Clock In' }}
              </h1>
            </div>

            <!-- Enhanced GPS Status -->
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3 md:gap-4">
                <!-- GPS Lock -->
                <div :class="location ? 'bg-green-400/20 border-green-300' : 'bg-orange-400/20 border-orange-300'" class="p-4 md:p-5 rounded-lg border-2 text-center transition-all backdrop-blur-sm">
                  <p class="text-[9px] font-black text-white/80 uppercase mb-2">GPS Lock</p>
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-3 h-3 rounded-full animate-pulse" :class="location ? 'bg-green-300' : 'bg-orange-300'"></div>
                    <p class="text-sm md:text-base font-bold">{{ location ? 'LOCKED' : 'SEARCHING' }}</p>
                  </div>
                </div>
                
                <!-- Work Zone -->
                <div :class="inRange ? 'bg-green-400/20 border-green-300' : 'bg-red-400/20 border-red-300'" class="p-4 md:p-5 rounded-lg border-2 text-center transition-all backdrop-blur-sm">
                  <p class="text-[9px] font-black text-white/80 uppercase mb-2">Work Zone</p>
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-3 h-3 rounded-full animate-pulse" :class="inRange ? 'bg-green-300' : 'bg-red-300'"></div>
                    <p class="text-sm md:text-base font-bold">{{ inRange ? 'IN RANGE' : 'OUT' }}</p>
                  </div>
                </div>
              </div>

              <!-- Accuracy Indicator -->
              <div v-if="location" class="bg-white/10 p-4 md:p-5 rounded-lg border border-white/20 backdrop-blur-sm">
                <div class="flex justify-between items-center mb-3">
                  <p class="text-xs font-bold text-white/70 uppercase">Accuracy</p>
                  <span class="text-xs font-bold text-white/70">{{ gpsAccuracy }}m</span>
                </div>
                <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full transition-all"
                       :style="{ width: Math.min(100, (50 - gpsAccuracy) / 50 * 100) + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Distance Readout -->
            <div v-if="location" class="text-center py-6 md:py-8 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm">
              <div class="text-5xl md:text-6xl font-black tracking-tight">{{ distance }}<span class="text-2xl md:text-3xl">m</span></div>
              <p class="text-xs font-bold text-white/70 uppercase mt-2">Distance to work zone</p>
            </div>
          </div>

          <!-- Action Button -->
          <div class="relative z-10 mt-8">
            <button 
              @click="handleSubmit" 
              :disabled="!inRange || loading || !location"
              class="w-full py-6 md:py-8 rounded-lg font-black text-lg md:text-2xl shadow-2xl transition-all active:scale-95 uppercase tracking-wider"
              :class="inRange && location ? 'bg-white text-primary-600 shadow-white/30 hover:shadow-white/40' : 'bg-white/20 text-white/50 cursor-not-allowed backdrop-blur-sm'"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                PROCESSING...
              </span>
              <span v-else-if="!location">WAITING GPS...</span>
              <span v-else-if="isCheckedIn">END WORK SHIFT</span>
              <span v-else>START WORK SHIFT</span>
            </button>
          </div>
        </div>

        <!-- Time Tracking Widget -->
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col">
          <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Time Tracking</h3>
          
          <div class="flex-1 flex flex-col justify-center items-center space-y-6">
            <!-- Top Section: Elapsed Time -->
            <div class="text-center w-full p-3 bg-green-50 rounded-xl border border-green-200">
              <p class="text-[9px] font-bold text-green-700 uppercase mb-1">Time Worked</p>
              <div class="text-2xl md:text-3xl font-black text-green-600 tracking-tight font-mono">
                {{ elapsedTime }}
              </div>
            </div>

            <!-- Large Time Display - Remaining Time (Countdown) -->
            <div class="text-center">
              <p class="text-[9px] font-bold text-slate-400 uppercase mb-2">Remaining Shift Time</p>
              <div class="text-5xl md:text-6xl font-black tracking-tight font-mono" :class="parseInt(remainingTime.split(':')[0]) < 1 ? 'text-red-600' : 'text-primary-600'">
                {{ remainingTime }}
              </div>
              <p class="text-xs font-bold text-slate-400 uppercase mt-2">Countdown</p>
            </div>

            <!-- Progress Ring -->
            <div class="relative w-32 h-32 md:w-40 h-40">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="55" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                <circle 
                  cx="60" cy="60" r="55" fill="none" stroke="#4f46e5" stroke-width="8"
                  stroke-dasharray="345.575"
                  :stroke-dashoffset="345.575 * (1 - timeProgress)"
                  stroke-linecap="round"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-sm font-bold text-slate-600">{{ Math.round(timeProgress * 100) }}%</span>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 w-full text-center text-xs">
              <div class="bg-slate-50 p-3 rounded-xl">
                <p class="text-slate-400 font-bold uppercase mb-1">Breaks Used</p>
                <p class="text-lg font-black text-slate-900">{{ totalBreaks }}/{{ maxBreaksAllowed }}</p>
              </div>
              <div class="bg-slate-50 p-3 rounded-xl">
                <p class="text-slate-400 font-bold uppercase mb-1">Total Hours</p>
                <p class="text-lg font-black text-primary-600">{{ shiftDuration }}h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Break Management Section -->
      <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 class="text-lg md:text-xl font-black text-slate-900 uppercase">Break Management</h3>
          <button
            v-if="isCheckedIn && !onBreak"
            @click="startBreak"
            :disabled="breakLoading || breaksRemaining <= 0"
            class="px-4 md:px-6 py-2 md:py-3 bg-amber-500 text-white rounded-xl font-bold text-xs md:text-sm uppercase hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg v-if="!breakLoading" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 1114.869 0V5a1 1 0 11-2 0v-.101A5.002 5.002 0 5.999 6H9a1 1 0 000-2H5a1 1 0 00-1 1v.101A5 5 0 004 5v2a1 1 0 11-2 0V3a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
            {{ breakLoading ? 'PROCESSING...' : `START BREAK (${totalBreaks}/${maxBreaksAllowed})` }}
          </button>
          <button
            v-else-if="onBreak"
            @click="endBreak"
            :disabled="breakLoading"
            class="px-4 md:px-6 py-2 md:py-3 bg-green-600 text-white rounded-xl font-bold text-xs md:text-sm uppercase hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {{ breakLoading ? 'PROCESSING...' : 'END BREAK' }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-200">
            <p class="text-xs font-bold text-slate-400 uppercase mb-2">Current Break</p>
            <p class="text-2xl md:text-3xl font-black text-amber-600">{{ currentBreakTime }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ onBreak ? 'In Progress' : 'No active break' }}</p>
          </div>
          <div class="bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-200">
            <p class="text-xs font-bold text-slate-400 uppercase mb-2">Total Break Time</p>
            <p class="text-2xl md:text-3xl font-black text-primary-600">{{ Math.floor(totalBreakMinutes) }}m</p>
            <p class="text-xs text-slate-500 mt-1">Deducted from shift</p>
          </div>
          <div class="bg-slate-50 p-4 md:p-5 rounded-xl border" :class="breaksRemaining > 0 ? 'border-green-200' : 'border-red-200'">
            <p class="text-xs font-bold text-slate-400 uppercase mb-2">Break Limit</p>
            <p class="text-2xl md:text-3xl font-black" :class="breaksRemaining > 0 ? 'text-green-600' : 'text-red-600'">{{ totalBreaks }}/{{ maxBreaksAllowed }}</p>
            <p class="text-xs" :class="breaksRemaining > 0 ? 'text-green-600' : 'text-red-600'">{{ breaksRemaining }} remaining</p>
          </div>
        </div>

        <!-- Break History -->
        <div v-if="breaks.length > 0" class="mt-6 space-y-2">
          <p class="text-xs font-bold text-slate-600 uppercase">Recent Breaks</p>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div v-for="(brk, idx) in breaks.slice().reverse()" :key="idx" class="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ formatBreakType(brk.break_type) }}</span>
                  <div>
                    <p class="text-xs font-bold text-amber-700">{{ capitalizeBreakType(brk.break_type) }} Break</p>
                    <p class="text-[10px] text-amber-600">{{ formatBreakDate(brk.start_time) }}</p>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-amber-600">{{ Math.round(brk.duration || 0) }}min</p>
                <p class="text-[10px] text-amber-500">{{ formatBreakTime(brk.start_time) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Section with Calendar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <!-- Current/Next Shift -->
        <div class="lg:col-span-2 bg-gradient-to-br from-primary-600 to-accent-600 p-6 md:p-8 rounded-xl shadow-lg text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-6">
              <div>
                <p class="text-[10px] font-bold text-primary-200 uppercase tracking-widest mb-2">Next Scheduled</p>
                <h2 class="text-2xl md:text-3xl font-black tracking-tight">Upcoming Shift</h2>
              </div>
              <svg class="w-6 h-6 md:w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>

            <div v-if="currentShift" class="space-y-4">
              <div>
                <p class="text-sm opacity-80 mb-2">{{ formatDate(currentShift.Shift_Date) }}</p>
                <h3 class="text-3xl md:text-4xl font-black">{{ currentShift.Shift_Start_Time }} — {{ currentShift.Shift_End_Time }}</h3>
              </div>
              <div class="flex flex-col md:flex-row items-start md:items-center gap-3 pt-4 border-t border-white/20">
                <span class="px-3 py-1 bg-white/10 rounded-lg text-sm font-bold border border-white/20">
                  {{ currentShift.ShiftType_Name }}
                </span>
                <span class="text-sm opacity-70">{{ currentShift.Depart_Name || 'General' }}</span>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <p class="text-lg opacity-50 font-bold">No Upcoming Shifts</p>
            </div>
          </div>
        </div>

        <!-- Upcoming Schedule Summary -->
        <div class="bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-sm">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">This Week</h3>
            <router-link :to="`/schedule`" class="text-[9px] font-black text-primary-600 hover:text-primary-700 uppercase border-b-2 border-primary-100">View All</router-link>
          </div>

          <div v-if="upcomingSchedules.length > 0" class="space-y-2 max-h-80 overflow-y-auto pr-2">
            <div v-for="schedule in upcomingSchedules" :key="schedule.Schedule_ID" class="p-3 md:p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer">
              <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 gap-2">
                <p class="font-bold text-sm text-slate-900">{{ formatDate(schedule.Start_Date) }}</p>
                <span class="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap" :style="{ backgroundColor: schedule.Color_Code + '20', color: schedule.Color_Code }">
                  {{ schedule.ShiftType_Name }}
                </span>
              </div>
              <p class="text-xs text-slate-600 font-medium">{{ schedule.Start_Time }} - {{ schedule.End_Time }}</p>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <p class="text-sm text-slate-400 font-bold uppercase">No schedules assigned</p>
          </div>
        </div>
      </div>

      <!-- Employee Analytics Section -->
      <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8">
        <h3 class="text-lg md:text-xl font-black text-slate-900 uppercase mb-8">Work Analytics</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <!-- 7-Day Average -->
          <div class="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-lg border border-primary-200">
            <p class="text-[10px] font-black text-primary-700 uppercase tracking-wider mb-2">7-Day Average</p>
            <p class="text-3xl md:text-4xl font-black text-primary-900">{{ avgHoursPerDay }}h</p>
            <svg class="w-full h-12 mt-4 opacity-30" viewBox="0 0 100 40" preserveAspectRatio="none">
              <polyline points="0,30 20,15 40,20 60,10 80,18 100,12" stroke="currentColor" stroke-width="2" fill="none" vector-effect="non-scaling-stroke"/>
            </svg>
          </div>

          <!-- Check-in Rate -->
          <div class="bg-gradient-to-br from-accent-50 to-accent-100 p-6 rounded-lg border border-accent-200">
            <p class="text-[10px] font-black text-accent-700 uppercase tracking-wider mb-2">Check-in Rate</p>
            <p class="text-3xl md:text-4xl font-black text-accent-900">{{ checkInRate }}%</p>
            <div class="w-full h-2 bg-accent-300 rounded-full mt-4">
              <div class="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full" :style="{ width: checkInRate + '%' }"></div>
            </div>
          </div>

          <!-- Total Hours This Month -->
          <div class="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-lg border border-primary-200">
            <p class="text-[10px] font-black text-primary-700 uppercase tracking-wider mb-2">Hours This Month</p>
            <p class="text-3xl md:text-4xl font-black text-primary-900">{{ totalMonthHours }}h</p>
            <p class="text-xs text-primary-600 font-bold mt-2">Target: {{ targetMonthHours }}h</p>
          </div>

          <!-- On-time Rate -->
          <div class="bg-gradient-to-br from-accent-50 to-accent-100 p-6 rounded-lg border border-accent-200">
            <p class="text-[10px] font-black text-accent-700 uppercase tracking-wider mb-2">On-time Rate</p>
            <p class="text-3xl md:text-4xl font-black text-accent-900">{{ onTimeRate }}%</p>
            <div class="flex items-center gap-2 mt-2">
              <div class="w-2 h-2 rounded-full" :class="onTimeRate >= 95 ? 'bg-primary-500' : onTimeRate >= 80 ? 'bg-accent-500' : 'bg-red-500'"></div>
              <span class="text-[10px] font-bold text-accent-700">{{ onTimeRate >= 95 ? 'Excellent' : onTimeRate >= 80 ? 'Good' : 'Needs Improvement' }}</span>
            </div>
          </div>
        </div>

        <!-- Weekly Activity Chart -->
        <div class="mt-8 bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-lg border border-primary-200">
          <div class="flex justify-between items-center mb-4">
            <p class="text-xs font-black text-primary-700 uppercase">Weekly Activity (Live)</p>
            <span class="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-[10px] font-bold">
              <span class="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <div class="flex items-end justify-between gap-2 h-48">
            <div v-for="(day, idx) in weeklyActivity" :key="idx" class="flex-1 h-full flex flex-col items-center group relative">
              <!-- Animated Bar -->
              <div class="w-full relative h-full flex items-end justify-center">
                <div 
                  class="w-full rounded-t-lg transition-all duration-500 ease-out hover:shadow-lg cursor-pointer relative group/bar bg-primary-500"
                  :style="{ 
                    height: (day.hours / 12 * 100) + '%',
                    minHeight: '8px',
                    background: `linear-gradient(to top, ${getBarColor(day.hours)}, ${getBarColorLight(day.hours)})`
                  }"
                >
                  <!-- Hover Tooltip -->
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10">
                    <div class="bg-slate-800 text-white px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap">
                      {{ day.hours }}h
                    </div>
                    <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>
                </div>
              </div>
              
              <!-- Day Label -->
              <p class="text-[10px] font-bold text-slate-700 mt-3">{{ day.day }}</p>
              
              <!-- Hour Display -->
              <p class="text-[9px] text-slate-500 font-semibold">{{ day.hours }}h</p>
              
              <!-- Status Indicator -->
              <div class="mt-1">
                <span v-if="day.hours >= 8" class="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" title="On Target"></span>
                <span v-else-if="day.hours >= 6" class="inline-block w-2 h-2 rounded-full bg-yellow-500" title="Partial"></span>
                <span v-else class="inline-block w-2 h-2 rounded-full bg-gray-300" title="Off"></span>
              </div>
            </div>
          </div>
          
          <!-- Weekly Summary -->
          <div class="mt-6 grid grid-cols-3 gap-3">
            <div class="bg-white p-3 rounded-lg border border-slate-200">
              <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Weekly Total</p>
              <p class="text-lg font-black text-primary-600">{{ weeklyTotal }}h</p>
            </div>
            <div class="bg-white p-3 rounded-lg border border-slate-200">
              <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Daily Average</p>
              <p class="text-lg font-black text-purple-600">{{ weeklyAverage }}h</p>
            </div>
            <div class="bg-white p-3 rounded-lg border border-slate-200">
              <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Trend</p>
              <p class="text-lg font-black" :class="weeklyTrend >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ weeklyTrend >= 0 ? '+' : '' }}{{ weeklyTrend }}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Break Type Selection Modal -->
    <div v-if="showBreakModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 md:p-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl md:text-2xl font-black text-slate-900">Select Break Type</h3>
          <button
            @click="closeBreakModal"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Break Type Options -->
        <div class="space-y-3 mb-6">
          <!-- Lunch Break -->
          <label class="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all" :class="breakType === 'lunch' ? 'border-primary-600 bg-primary-50' : 'border-slate-200 hover:border-slate-300'">
            <input
              v-model="breakType"
              type="radio"
              value="lunch"
              :disabled="lunchTaken"
              class="w-4 h-4 text-primary-600 cursor-pointer"
            />
            <div class="ml-3 flex-1">
              <p class="font-bold text-slate-900">Lunch Break</p>
              <p class="text-xs text-slate-500"><span v-if="lunchTaken" class="inline-flex items-center gap-1"><CheckCircleIcon class="w-4 h-4 text-green-600" /> Already taken</span><span v-else>Once per shift</span></p>
            </div>
            <span class="text-2xl">🍽️</span>
          </label>

          <!-- Regular Break -->
          <label class="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all" :class="breakType === 'regular' ? 'border-primary-600 bg-primary-50' : 'border-slate-200 hover:border-slate-300'">
            <input
              v-model="breakType"
              type="radio"
              value="regular"
              class="w-4 h-4 text-primary-600 cursor-pointer"
            />
            <div class="ml-3 flex-1">
              <p class="font-bold text-slate-900">Regular Break</p>
              <p class="text-xs text-slate-500">Short break during work</p>
            </div>
            <span class="text-2xl">☕</span>
          </label>

          <!-- Bathroom Break -->
          <label class="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all" :class="breakType === 'bathroom' ? 'border-primary-600 bg-primary-50' : 'border-slate-200 hover:border-slate-300'">
            <input
              v-model="breakType"
              type="radio"
              value="bathroom"
              class="w-4 h-4 text-primary-600 cursor-pointer"
            />
            <div class="ml-3 flex-1">
              <p class="font-bold text-slate-900">Bathroom Break</p>
              <p class="text-xs text-slate-500">Quick restroom visit</p>
            </div>
            <span class="text-2xl">🚻</span>
          </label>
        </div>

        <!-- Reason Input -->
        <div class="mb-6">
          <label class="block text-sm font-bold text-slate-900 mb-2">Reason (Optional)</label>
          <textarea
            v-model="breakReason"
            placeholder="Add any notes about your break..."
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
            rows="3"
          ></textarea>
        </div>

        <!-- Location Status -->
        <div v-if="location" class="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-xs font-bold text-green-700 flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            GPS LOCKED - Ready to start break
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            @click="closeBreakModal"
            class="flex-1 px-4 py-3 border border-slate-300 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            @click="confirmStartBreak"
            :disabled="breakLoading || !location"
            class="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="breakLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ breakLoading ? 'Starting...' : 'Start Break' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import api from '@/utils/api'
import { MapPinIcon, CheckCircleIcon } from 'lucide-vue-next'
import { useRealtimeUpdates } from '@/composables/useRealtimeUpdates'
import { useDashboardMetrics } from '@/composables/useDashboardMetrics'
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications.vue'

// GPS and Location
const location = ref(null)
const geofences = ref([])
const gpsSignalStrength = ref(0)
const gpsAccuracy = ref(50)
const watchId = ref(null)

// Check-in Status
const isCheckedIn = ref(false)
const loading = ref(false)
const currentShift = ref(null)
const upcomingSchedules = ref([])

// Time Tracking
const elapsedTime = ref('00:00:00')
const remainingTime = ref('08:00:00') // Countdown from total shift hours
const timeProgress = ref(0)
const currentTime = ref('00:00')
const shiftDuration = ref(8)
const totalShiftMinutes = ref(480) // 8 hours = 480 minutes
const usedMinutes = ref(0) // Time already used (breaks, lunch, work)

// Break Management
const onBreak = ref(false)
const breakLoading = ref(false)
const currentBreakTime = ref('00:00')
const totalBreaks = ref(0)
const maxBreaksAllowed = ref(2) // Maximum 2 breaks per shift
const breaksRemaining = computed(() => maxBreaksAllowed.value - totalBreaks.value)
const totalBreakMinutes = ref(0) // Total minutes spent on breaks
const lunchTaken = ref(false)
const lunchDurationMinutes = ref(60) // 1 hour lunch
const breaks = ref([])
const breakStartTime = ref(null) // Track when break started

// Break Modal
const showBreakModal = ref(false)
const breakType = ref('regular') // 'lunch' | 'regular' | 'bathroom'
const breakReason = ref('')
const breakStartLocation = ref(null)

// Weekly Activity Computed Properties
const weeklyTotal = computed(() => {
  return weeklyActivity.value.reduce((sum, day) => sum + (day.hours || 0), 0)
})

const weeklyAverage = computed(() => {
  const validDays = weeklyActivity.value.filter(day => day.hours > 0).length
  return validDays > 0 ? (weeklyTotal.value / validDays).toFixed(1) : 0
})

const weeklyTrend = computed(() => {
  if (weeklyActivity.value.length < 2) return 0
  const firstHalf = weeklyActivity.value.slice(0, Math.ceil(weeklyActivity.value.length / 2))
  const secondHalf = weeklyActivity.value.slice(Math.ceil(weeklyActivity.value.length / 2))
  const firstAvg = firstHalf.reduce((sum, day) => sum + (day.hours || 0), 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, day) => sum + (day.hours || 0), 0) / secondHalf.length
  return ((secondAvg - firstAvg) / firstAvg * 100).toFixed(0)
})

// Bar color helper functions
const getBarColor = (hours) => {
  if (hours >= 8) return '#22c55e' // Green for on target
  if (hours >= 6) return '#f59e0b' // Amber for partial
  if (hours > 0) return '#ef4444' // Red for low
  return '#d1d5db' // Gray for zero
}

const getBarColorLight = (hours) => {
  if (hours >= 8) return '#86efac' // Light green
  if (hours >= 6) return '#fcd34d' // Light amber
  if (hours > 0) return '#fca5a5' // Light red
  return '#e5e7eb' // Light gray
}

// Analytics
const avgHoursPerDay = ref(0)
const checkInRate = ref(95)
const totalMonthHours = ref(128)
const targetMonthHours = ref(160)
const onTimeRate = ref(98)
const weeklyActivity = ref([
  { day: 'Mon', hours: 0 },
  { day: 'Tue', hours: 0 },
  { day: 'Wed', hours: 0 },
  { day: 'Thu', hours: 0 },
  { day: 'Fri', hours: 0 },
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 }
])

// Real-time Updates (legacy - will be enhanced)
const { isConnected, statusUpdate, scheduleUpdate, analyticsUpdate, notificationQueue, dismissNotification } = useRealtimeUpdates()

// Enhanced real-time metrics from new composable
const { 
  employeeMetrics, 
  analyticsMetrics,
  isConnected: metricsConnected,
  requestEmployeeMetrics,
  requestAnalyticsMetrics,
  alerts: realtimeAlerts
} = useDashboardMetrics({ dashboardType: 'employee' })

// Sync employee metrics to local state
const syncEmployeeMetrics = () => {
  if (employeeMetrics.value) {
    checkInRate.value = employeeMetrics.value.attendanceRate || checkInRate.value
    onTimeRate.value = employeeMetrics.value.onTimeRate || onTimeRate.value
    totalMonthHours.value = employeeMetrics.value.monthlyHours || totalMonthHours.value
    avgHoursPerDay.value = employeeMetrics.value.hoursWorkedToday || avgHoursPerDay.value
    isCheckedIn.value = employeeMetrics.value.checkedIn || isCheckedIn.value
    if (employeeMetrics.value.upcomingShift) {
      currentShift.value = employeeMetrics.value.upcomingShift
    }
  }
}

const displayNotifications = computed(() => {
  return notificationQueue.value.map(notif => ({
    ...notif,
    title: notif.title || getNotificationTitle(notif.type || notif.message),
    type: notif.type || 'info'
  }))
})

const getNotificationTitle = (message) => {
  if (message?.includes('break')) return 'Break Reminder'
  if (message?.includes('shift')) return 'Shift Reminder'
  if (message?.includes('checkin')) return 'Check-in'
  if (message?.includes('checkout')) return 'Check-out'
  return 'Notification'
}

// Haversine distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3
  const pLat1 = parseFloat(lat1)
  const pLon1 = parseFloat(lon1)
  const pLat2 = parseFloat(lat2)
  const pLon2 = parseFloat(lon2)

  const φ1 = (pLat1 * Math.PI) / 180
  const φ2 = (pLat2 * Math.PI) / 180
  const Δφ = ((pLat2 - pLat1) * Math.PI) / 180
  const Δλ = ((pLon2 - pLon1) * Math.PI) / 180
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

const distance = computed(() => {
  if (!location.value || !geofences.value.length) return 9999
  const dists = geofences.value.map((f) =>
    calculateDistance(location.value.latitude, location.value.longitude, f.Latitude, f.Longitude)
  )
  return Math.min(...dists)
})

const inRange = computed(() => {
  if (!location.value || !geofences.value.length) return false
  return geofences.value.some((f) => {
    const d = calculateDistance(location.value.latitude, location.value.longitude, f.Latitude, f.Longitude)
    return d <= f.Radius
  })
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const formatBreakTime = (timeStr) => {
  if (!timeStr) return 'N/A'
  return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const formatBreakDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // Check if today
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  // Check if yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  // Otherwise show date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatBreakType = (type) => {
  const icons = {
    'lunch': '🍽️',
    'regular': '☕',
    'bathroom': '🚻',
    'restroom': '🚻'
  }
  return icons[type] || '☕'
}

const capitalizeBreakType = (type) => {
  const labels = {
    'lunch': 'Lunch',
    'regular': 'Regular',
    'bathroom': 'Restroom',
    'restroom': 'Restroom'
  }
  return labels[type] || type
}

const formatTimeHMS = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const calculateShiftDuration = () => {
  if (!currentShift.value) return
  
  const [startH, startM] = currentShift.value.Shift_Start_Time.split(':').map(Number)
  const [endH, endM] = currentShift.value.Shift_End_Time.split(':').map(Number)
  
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  let durationMinutes = endMinutes - startMinutes
  
  // Handle overnight shifts
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60
  }
  
  totalShiftMinutes.value = durationMinutes
  shiftDuration.value = (durationMinutes / 60).toFixed(1)
  remainingTime.value = formatTimeHMS(durationMinutes * 60)
}

// Fetch current status
const fetchStatus = async () => {
  try {
    const res = await api.get('/attendance/status')
    isCheckedIn.value = res.data.checkedIn
  } catch (err) {
    console.error('Status check failed:', err.response?.status)
  }
}

// Fetch schedule data
const fetchSchedule = async () => {
  try {
    const currentRes = await api.get('/org/my-current-shift')
    currentShift.value = currentRes.data
    calculateShiftDuration() // Calculate the shift duration

    const upcomingRes = await api.get('/org/my-schedule')
    upcomingSchedules.value = (upcomingRes.data || []).slice(0, 7)
  } catch (err) {
    console.error('Schedule fetch failed:', err)
  }
}

// Fetch break history
const fetchBreaks = async () => {
  try {
    const res = await api.get('/attendance/breaks')
    breaks.value = res.data || []
    // Count ALL breaks started today (including in-progress ones), not just completed ones
    totalBreaks.value = breaks.value.length
    
    // Calculate total break time from completed breaks only
    totalBreakMinutes.value = breaks.value
      .filter((b) => b.end_time) // Only count completed breaks
      .reduce((sum, b) => sum + (b.duration || 0), 0) // Sum all durations in minutes
    
    // Check if there's an ongoing break (one without end_time)
    const ongoingBreak = breaks.value.find((b) => !b.end_time)
    if (ongoingBreak) {
      onBreak.value = true
      breakStartTime.value = new Date(ongoingBreak.start_time)
    } else {
      onBreak.value = false
      breakStartTime.value = null
    }
  } catch (err) {
    console.error('Breaks fetch failed:', err)
  }
}

// Fetch organization settings
const fetchOrgSettings = async () => {
  try {
    const res = await api.get('/org/settings')
    if (res.data && res.data.Max_Breaks_Per_Shift) {
      maxBreaksAllowed.value = res.data.Max_Breaks_Per_Shift
    }
  } catch (err) {
    console.error('Org settings fetch failed:', err)
    // Keep default value of 2
  }
}

// Fetch analytics
const fetchAnalytics = async () => {
  try {
    const res = await api.get('/attendance/analytics')
    
    // Always use real data from backend
    avgHoursPerDay.value = res.data.avgHoursPerDay ? (res.data.avgHoursPerDay).toFixed(1) : '0'
    checkInRate.value = res.data.checkInRate ? res.data.checkInRate : 0
    totalMonthHours.value = res.data.totalMonthHours ? res.data.totalMonthHours : 0
    onTimeRate.value = res.data.onTimeRate ? res.data.onTimeRate : 0
    targetMonthHours.value = res.data.targetMonthHours || 160
    
    // Update weekly activity with real data from database
    if (res.data.weeklyActivity && Array.isArray(res.data.weeklyActivity)) {
      weeklyActivity.value = res.data.weeklyActivity
    }
  } catch (err) {
    console.error('Analytics fetch failed:', err)
  }
}

const generateDefaultWeekly = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  // Return zero for all days - real data will populate from API
  return days.map((day) => ({
    day,
    hours: 0,
  }))
}

// Update elapsed time and remaining time
const updateElapsedTime = () => {
  if (!isCheckedIn.value) {
    elapsedTime.value = '00:00:00'
    remainingTime.value = formatTimeHMS(totalShiftMinutes.value * 60)
    timeProgress.value = 0
    return
  }

  if (!currentShift.value) return

  // Calculate elapsed time from shift start
  const now = new Date()
  const [startH, startM] = currentShift.value.Shift_Start_Time.split(':').map(Number)
  const shiftStartMinutes = startH * 60 + startM
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  
  let elapsedMinutes = nowMinutes - shiftStartMinutes
  if (elapsedMinutes < 0) elapsedMinutes += 24 * 60 // Handle overnight
  
  // Calculate remaining time: total shift - elapsed + breaks + lunch (they get these back)
  let remainingMinutes = totalShiftMinutes.value - elapsedMinutes + totalBreakMinutes.value
  if (lunchTaken.value) {
    remainingMinutes += lunchDurationMinutes.value
  }
  remainingMinutes = Math.max(0, remainingMinutes)
  
  const elapsedSeconds = elapsedMinutes * 60
  elapsedTime.value = formatTimeHMS(elapsedSeconds)
  remainingTime.value = formatTimeHMS(remainingMinutes * 60)
  
  // Progress: minutes worked / total shift minutes
  const workMinutes = elapsedMinutes - totalBreakMinutes.value
  timeProgress.value = Math.min(workMinutes / totalShiftMinutes.value, 1)
  usedMinutes.value = elapsedMinutes
}

// Update current time
const updateCurrentTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

// Open break selection modal
const openBreakModal = () => {
  if (!isCheckedIn.value) {
    alert('❌ You must be checked in to take a break')
    return
  }
  
  if (!inRange.value) {
    alert('⚠️ You must be in the work zone to start a break')
    return
  }
  
  if (breaksRemaining.value <= 0) {
    alert('❌ You have reached your break limit of 2 breaks per shift')
    return
  }
  
  breakReason.value = ''
  showBreakModal.value = true
}

// Confirm and start break
const confirmStartBreak = async () => {
  if (!location.value) {
    alert('⚠️ Unable to get GPS location. Please ensure GPS is enabled.')
    return
  }
  
  breakLoading.value = true
  try {
    // Record break start
    await api.post('/attendance/break-start', {
      latitude: location.value.latitude,
      longitude: location.value.longitude,
      breakType: breakType.value,
      reason: breakReason.value,
      accuracy: gpsAccuracy.value,
    })
    
    // Update local state
    onBreak.value = true
    breakStartTime.value = new Date()
    breakStartLocation.value = location.value
    
    // Mark lunch as taken if it was lunch break
    if (breakType.value === 'lunch') {
      lunchTaken.value = true
    }
    
    // Close modal
    showBreakModal.value = false
    
    // Fetch updated breaks
    await fetchBreaks()
    
    // Show success message
    const breakTypeLabel = breakType.value === 'lunch' ? 'Lunch Break' : breakType.value === 'bathroom' ? 'Bathroom Break' : 'Break'
    alert(`✅ ${breakTypeLabel} started successfully!`)
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to start break')
  } finally {
    breakLoading.value = false
  }
}

// Close break modal
const closeBreakModal = () => {
  showBreakModal.value = false
  breakReason.value = ''
  breakType.value = 'regular'
}

// Simplified start break (for quick access)
const startBreak = () => {
  openBreakModal()
}

// End break
const endBreak = async () => {
  breakLoading.value = true
  try {
    await api.post('/attendance/break-end', {
      latitude: location.value.latitude,
      longitude: location.value.longitude,
    })
    
    // Clear local break state
    onBreak.value = false
    breakStartTime.value = null
    
    // Refetch breaks to get updated durations from backend
    await fetchBreaks()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to end break')
  } finally {
    breakLoading.value = false
  }
}

// Update GPS signal strength
const updateGPSSignal = (position) => {
  const accuracy = position.coords.accuracy
  gpsAccuracy.value = Math.round(accuracy)

  // Calculate signal strength based on accuracy (lower is better)
  const signalStrength = Math.max(0, Math.min(100, 100 - accuracy / 2))
  gpsSignalStrength.value = Math.round(signalStrength)

  // Update location
  location.value = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  }
}

// Monitor GPS position
const startGPSMonitoring = () => {
  if (navigator.geolocation) {
    // Initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateGPSSignal(pos)
      },
      (err) => {
        console.error('GPS Error:', err)
        alert('Please enable GPS access for check-in functionality')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    )

    // Watch position for real-time updates
    watchId.value = navigator.geolocation.watchPosition(
      (pos) => {
        updateGPSSignal(pos)
      },
      (err) => console.error('Watch error:', err),
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    )
  }
}

// Submit check-in/check-out
const handleSubmit = async () => {
  loading.value = true
  const action = isCheckedIn.value ? 'checkout' : 'checkin'
  try {
    // Prepare checkout payload with break summary if checking out
    const payload = {
      latitude: location.value.latitude,
      longitude: location.value.longitude,
      accuracy: gpsAccuracy.value,
    }

    // If checking out, include break tracking data
    if (action === 'checkout') {
      payload.totalBreaks = totalBreaks.value
      payload.totalBreakMinutes = totalBreakMinutes.value
      payload.breaks = breaks.value.map(b => ({
        breakType: b.break_type,
        startTime: b.start_time,
        endTime: b.end_time,
        durationMinutes: b.Duration_Minutes
      }))
    }

    await api.post(`/attendance/${action}`, payload)
    await fetchStatus()
    await fetchAnalytics()
    alert(`✅ ${action === 'checkin' ? 'Checked in' : 'Checked out'} successfully!`)
  } catch (err) {
    alert(err.response?.data?.error || 'Request Failed')
  } finally {
    loading.value = false
  }
}

// Timers are handled in onMounted hook
onMounted(async () => {
  // Start GPS monitoring
  startGPSMonitoring()

  // Fetch data
  await fetchOrgSettings() // Load org settings including max breaks
  await fetchStatus()
  await fetchSchedule()
  await fetchBreaks()
  await fetchAnalytics()

  // Request real-time metrics (will update via WebSocket)
  if (metricsConnected.value) {
    requestEmployeeMetrics()
    requestAnalyticsMetrics()
  }

  const res = await api.get('/org/geofences')
  geofences.value = res.data

  // Watch for employee metrics changes and sync
  const metricsWatcher = setInterval(() => {
    syncEmployeeMetrics()
  }, 1000)

  // Watch for analytics metrics changes from composable
  const analyticsMetricsWatcher = setInterval(() => {
    if (analyticsMetrics.value && analyticsMetrics.value.weeklyActivity) {
      avgHoursPerDay.value = (analyticsMetrics.value.avgHoursPerDay || avgHoursPerDay.value).toFixed(1)
      checkInRate.value = analyticsMetrics.value.checkInRate || checkInRate.value
      totalMonthHours.value = analyticsMetrics.value.totalMonthHours || totalMonthHours.value
      onTimeRate.value = analyticsMetrics.value.onTimeRate || onTimeRate.value
      weeklyActivity.value = analyticsMetrics.value.weeklyActivity
      targetMonthHours.value = analyticsMetrics.value.targetMonthHours || targetMonthHours.value
    }
  }, 1000)

  // Real-time updates listener
  const statusUpdateWatcher = setInterval(() => {
    if (statusUpdate.value && statusUpdate.value.checkedIn !== undefined) {
      isCheckedIn.value = statusUpdate.value.checkedIn
    }
  }, 500)

  const scheduleUpdateWatcher = setInterval(() => {
    if (scheduleUpdate.value && scheduleUpdate.value.schedule) {
      currentShift.value = scheduleUpdate.value.schedule
    }
  }, 500)

  // Start timers
  updateCurrentTime()
  updateElapsedTime()
  const timeTimer = setInterval(updateCurrentTime, 1000)
  const elapsedTimer = setInterval(updateElapsedTime, 1000)

  // Update break time every second
  const breakTimer = setInterval(() => {
    if (onBreak.value && breakStartTime.value) {
      const elapsed = Math.floor((new Date() - breakStartTime.value) / 1000) // seconds
      const hours = Math.floor(elapsed / 3600)
      const minutes = Math.floor((elapsed % 3600) / 60)
      const seconds = Math.floor(elapsed % 60)
      currentBreakTime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    } else if (!onBreak.value) {
      currentBreakTime.value = '00:00:00'
    }
  }, 1000)

  // Refresh data every 1 minute for live updates
  const refreshInterval = setInterval(() => {
    fetchStatus()
    fetchAnalytics()
    if (metricsConnected.value) {
      requestEmployeeMetrics()
      requestAnalyticsMetrics()
    }
  }, 60 * 1000) // 1 minute = 60 seconds

  onBeforeUnmount(() => {
    // Clean up
    if (watchId.value) {
      navigator.geolocation.clearWatch(watchId.value)
    }
    clearInterval(timeTimer)
    clearInterval(elapsedTimer)
    clearInterval(breakTimer)
    clearInterval(refreshInterval)
    clearInterval(statusUpdateWatcher)
    clearInterval(scheduleUpdateWatcher)
    clearInterval(analyticsMetricsWatcher)
    clearInterval(metricsWatcher)
  })
})
</script>
