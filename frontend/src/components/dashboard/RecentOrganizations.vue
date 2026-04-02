<template>
  <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
    <!-- Header -->
    <div class="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
      <h3 class="text-sm font-black text-[#000000] uppercase tracking-widest">Recent Organizations</h3>
      <router-link 
        to="/superadmin/organizations"
        class="text-[10px] font-black text-[#1B8B3C] uppercase tracking-widest hover:text-[#FF6B35] transition-all border-b-2 border-[#1B8B3C] hover:border-[#FF6B35]"
      >
        View All →
      </router-link>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50/50">
          <tr class="text-[9px] font-black uppercase tracking-widest text-slate-600 border-b border-slate-100">
            <th class="px-10 py-5">Organization</th>
            <th class="px-10 py-5">Domain</th>
            <th class="px-10 py-5 text-center">Users</th>
            <th class="px-10 py-5 text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr 
            v-for="org in organizations.slice(0, 5)" 
            :key="org.Org_ID"
            class="hover:bg-slate-50/50 transition-colors group"
          >
            <!-- Organization Name -->
            <td class="px-10 py-6">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-[#1B8B3C] text-white rounded-lg flex items-center justify-center font-black text-sm shadow-sm">
                  {{ org.Org_Name[0] }}
                </div>
                <div>
                  <p class="text-xs font-black text-[#000000]">{{ org.Org_Name }}</p>
                  <p class="text-[9px] text-slate-400 font-medium mt-1">{{ formatDate(org.Created_at) }}</p>
                </div>
              </div>
            </td>

            <!-- Domain -->
            <td class="px-10 py-6 font-mono text-[10px] font-bold text-[#1B8B3C] tracking-tight">
              {{ org.Org_Domain }}.tracktimi.com
            </td>

            <!-- User Count -->
            <td class="px-10 py-6 text-center">
              <span class="text-xs font-black text-[#000000]">{{ org.userCount || 0 }}</span>
            </td>

            <!-- Status Badge -->
            <td class="px-10 py-6 text-right">
              <div v-if="org.Is_Active" class="inline-flex items-center space-x-2 px-4 py-2 bg-[#1B8B3C]/10 rounded-lg border border-[#1B8B3C]/20">
                <div class="w-2 h-2 bg-[#1B8B3C] rounded-full animate-pulse"></div>
                <span class="text-[8px] font-black text-[#1B8B3C] uppercase tracking-widest">Active</span>
              </div>
              <div v-else class="inline-flex items-center px-4 py-2 bg-red-50 rounded-lg border border-red-100">
                <span class="text-[8px] font-black text-red-600 uppercase tracking-widest">Inactive</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="organizations.length === 0" class="px-10 py-16 text-center text-slate-300 italic">
      No organizations found
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  organizations: {
    type: Array,
    default: () => []
  }
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'Pending'
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>
