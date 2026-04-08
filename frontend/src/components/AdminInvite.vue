<template>
  <div>
    <form @submit.prevent="sendInvite" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">First name</label>
        <input v-model="firstName" class="w-full p-2 border rounded" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Surname</label>
        <input v-model="surName" class="w-full p-2 border rounded" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input v-model="email" type="email" class="w-full p-2 border rounded" required />
      </div>

      <div class="flex justify-end space-x-2">
        <button type="button" @click="$emit('close')" class="px-4 py-2 border rounded">Cancel</button>
        <button :disabled="sending" class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Invite</button>
      </div>

      <div v-if="message" class="mt-3 text-sm text-blue-700">{{ message }}</div>
      <div v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'
const { inviteEmployee } = useApi()

const firstName = ref('')
const surName = ref('')
const email = ref('')
const sending = ref(false)
const message = ref('')
const error = ref('')

async function sendInvite() {
  error.value = ''
  message.value = ''
  sending.value = true
  try {
    const orgId = Number(localStorage.getItem('orgId')) || undefined
    const res = await inviteEmployee({ email: email.value, firstName: firstName.value, surName: surName.value, orgId })
    message.value = res.data?.token ? `Invite created. Token: ${res.data.token}` : 'Invite created'
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to send invite'
  } finally { sending.value = false }
}
</script>
