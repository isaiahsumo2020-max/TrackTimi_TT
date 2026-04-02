import { createApp } from 'vue'
import App from './App.vue'
import router from './router'           
import { createPinia } from 'pinia'
import '@/styles/globals.css'
import socket from '@/utils/socket.js'
import { useAuthStore } from '@/stores/auth.js'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize socket and join org room if user session exists
try {
	const auth = useAuthStore(pinia)
	if (auth?.org_id) {
		socket.connect()
		socket.joinOrg(auth.org_id)
	}
	// ensure socket disconnect on page unload
	window.addEventListener('beforeunload', () => socket.disconnect())
} catch (e) {
	// ignore in environments where window isn't available
}

app.mount('#app')
