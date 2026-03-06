  <template>
    <!-- ⭐ PERFECT MOBILE NAVBAR -->
<nav class="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-lg border-b border-gray-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Logo (always visible) -->
      <router-link to="/" class="text-3xl font-bold">Track<span class="text-orange-500">Timi</span>
      </router-link>
      
      <!-- Desktop Nav (hidden on mobile) -->
      <div class="hidden lg:flex items-center space-x-12">
        <router-link to="/" class="nav-link py-2">Home</router-link>
        <router-link to="/features" class="nav-link py-2">Features</router-link>
        <router-link to="/pricing" class="nav-link py-2">Pricing</router-link>
        <router-link to="/team" class="nav-link py-2">Team</router-link>
        <router-link to="/contact" class="nav-link py-2">Contact</router-link>
      </div>
      
      <!-- Mobile menu button -->
      <div class="lg:hidden flex items-center space-x-3">
        <!-- Mobile CTA buttons (compact) -->
        <router-link to="/login" class="btn-mobile px-4 py-2 text-sm font-bold hidden sm:block">
          Login
        </router-link>
        <router-link to="/register-org" class="btn-orange px-4 py-2 text-sm font-bold text-black hover:text-white hidden sm:block">
          Start Trial
        </router-link>
        
        <!-- Hamburger -->
        <button @click="mobileMenuOpen = true" class="lg:hidden p-2 rounded-xl hover:bg-orange-50">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
  
  <!-- ⭐ MOBILE MENU (DROPDOWN) -->
  <div v-if="mobileMenuOpen" class="lg:hidden bg-white border-t border-gray-100 shadow-xl">
    <div class="px-4 pt-4 pb-6 space-y-3">
      <router-link to="/" @click="mobileMenuOpen = false" class="block py-3 px-4 rounded-xl font-semibold hover:bg-orange-50">Home</router-link>
      <router-link to="/features" @click="mobileMenuOpen = false" class="block py-3 px-4 rounded-xl font-semibold hover:bg-orange-50">Features</router-link>
      <router-link to="/pricing" @click="mobileMenuOpen = false" class="block py-3 px-4 rounded-xl font-semibold hover:bg-orange-50">Pricing</router-link>
      <router-link to="/team" @click="mobileMenuOpen = false" class="block py-3 px-4 rounded-xl font-semibold hover:bg-orange-50">Team</router-link>
      <router-link to="/contact" @click="mobileMenuOpen = false" class="block py-3 px-4 rounded-xl font-semibold hover:bg-orange-50">Contact</router-link>
      <div class="pt-4 border-t border-gray-200">
        <router-link to="/login" @click="mobileMenuOpen = false" class="block w-full text-center py-3 px-4 bg-gray-900 text-white rounded-xl font-bold mb-3 hover:bg-black">
          Login
        </router-link>
        <router-link to="/register-org" @click="mobileMenuOpen = false" class="block w-full text-center py-3 px-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600">
          Start Free Trial
        </router-link>
      </div>
    </div>
  </div>
</nav>

    <div class="bg-white mt-12">
      <!-- Hero Section -->
      <section class="py-2 px-6 max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Hero Content -->
          <div class="space-y-8 lg:max-w-lg">
            <div
              class="inline-block bg-orange-500 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide">
              TrackTimi • Monrovia, Liberia
            </div>

            <h1 class="text-6xl lg:text-7xl font-bold text-black leading-tight">
              Accurate <span class="text-orange-500">Attendance</span><br>
              Real-Time <span class="text-orange-500">Tracking</span>
            </h1>

            <p class="text-2xl text-gray-600 leading-relaxed">
              Device-secured check-ins with GPS verification.
              One user = one device. No proxy check-ins.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 pt-8">
              <router-link to="/register-org" class="btn-orange py-6 px-10 text-xl shadow-2xl">
                🚀 Start Free Trial
              </router-link>
              <router-link to="/login" class="btn-black-light py-6 px-10 text-xl border-2">
                👥 For Admins
              </router-link>
            </div>

            <!-- Trust badges -->
            <div class="flex items-center space-x-8 pt-8">
              <div class="flex items-center space-x-2 text-sm font-bold text-gray-700">
                <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">1K+
                </div>
                <span>Organizations</span>
              </div>
              <div class="w-px h-8 bg-gray-300"></div>
              <div class="flex items-center space-x-2 text-sm font-bold text-gray-700">
                <div class="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs">10K+
                </div>
                <span>Users</span>
              </div>
            </div>
          </div>

          <!-- Hero Image -->
          <div class="relative">
            <div
              class="w-full h-96 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl shadow-2xl border-8 border-white p-8">
              <div
                class="absolute -top-4 -right-4 w-32 h-32 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                📊
              </div>
              <div
                class="h-full bg-white rounded-2xl shadow-inner border border-gray-200 flex items-center justify-center p-8">
                <div class="text-center">
                  <div
                    class="w-24 h-24 mx-auto bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                    <span class="text-2xl text-white">📍</span>
                  </div>
                  <div class="text-4xl font-bold text-black mb-2">18/24</div>
                  <div class="text-lg text-gray-600 mb-4">Present Today</div>
                  <span
                    class="bg-orange-100 text-orange-800 px-6 py-3 rounded-full font-bold border border-orange-200 text-lg">
                    94% Attendance
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PERFECTLY PROF ORANGE/BLACK Pricing Cards -->
      <section class="py-20 bg-gray-50">
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-4xl lg:text-5xl font-bold text-black mb-6">
              Simple<span class="text-orange-500">.</span> Fair<span class="text-orange-500">.</span> Pricing
            </h2>
            <p class="text-xl text-gray-600 max-w-lg mx-auto">
              Free forever for teams under 10. Scale as you grow.
            </p>
          </div>

          <!-- COMPACT Pricing Grid -->
          <div class="grid lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <!-- FREE ⭐ -->
            <div
              class="group bg-white border-4 border-orange-100 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-2 transition-all h-80 flex flex-col">
              <div class="flex-1">
                <div
                  class="w-16 h-16 mx-auto mb-6 bg-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span class="text-xl font-bold text-white">FREE</span>
                </div>
                <h3 class="text-2xl font-bold text-black text-center mb-4">Free Forever</h3>
                <p class="text-4xl font-bold text-orange-500 text-center mb-2">$0</p>
                <ul class="text-sm space-y-2 text-gray-700 px-4">
                  <li class="flex items-center justify-center"><span class="text-orange-500 mr-2"></span>10 users</li>
                  <li class="flex items-center justify-center"><span class="text-orange-500 mr-2"></span>GPS tracking
                  </li>
                </ul>
              </div>
              <a href="/register-org"
                class="mt-auto bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-2xl font-bold text-center shadow-lg transition-all">
                Start Free
              </a>
            </div>

            <!-- PAID PLANS (SAME ORANGE STYLE) -->
            <div
              class="group bg-white border-2 border-gray-200 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all h-80 flex flex-col">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-black text-center mb-6">Starter</h3>
                <p class="text-4xl font-bold text-orange-500 text-center mb-2">$9</p>
                <p class="text-xs text-gray-500 text-center uppercase tracking-wide">per month</p>
                <ul class="text-sm space-y-2 text-gray-700 mt-8 px-4">
                  <li class="flex items-center justify-center"><span class="text-orange-500 mr-2"></span>50 users</li>
                </ul>
              </div>
              <button
                class="mt-auto bg-gray-900 hover:bg-black text-white py-4 px-6 rounded-2xl font-bold text-center shadow-lg transition-all">
                Choose Plan
              </button>
            </div>

            <div
              class="group bg-white border-2 border-gray-200 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all h-80 flex flex-col lg:col-span-1">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-black text-center mb-6">Pro</h3>
                <p class="text-4xl font-bold text-orange-500 text-center mb-2">$29</p>
                <p class="text-xs text-gray-500 text-center uppercase tracking-wide">per month</p>
                <ul class="text-sm space-y-2 text-gray-700 mt-8 px-4">
                  <li class="flex items-center justify-center"><span class="text-orange-500 mr-2"></span>200 users</li>
                  <li class="flex items-center justify-center"><span class="text-orange-500 mr-2"></span>Priority
                    support</li>
                </ul>
              </div>
              <button
                class="mt-auto bg-gray-900 hover:bg-black text-white py-4 px-6 rounded-2xl font-bold text-center shadow-lg transition-all">
                Choose Plan
              </button>
            </div>

            <div
              class="group bg-white border-2 border-gray-200 p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all h-80 flex flex-col">
              <div class="flex-1">
                <h3 class="text-2xl font-bold text-black text-center mb-6">Enterprise</h3>
                <p class="text-3xl font-bold text-orange-500 text-center mb-2">$99+</p>
                <p class="text-xs text-gray-500 text-center uppercase tracking-wide">custom</p>
                <ul class="text-sm space-y-2 text-gray-700 mt-8 px-4">
                  <li class="flex items-center justify-center"><span class="text-orange-500 mr-2"></span>Unlimited</li>
                  <li class="flex items-center justify-center"><span class="text-orange-500 mr-2"></span>Dedicated
                    support</li>
                </ul>
              </div>
              <button
                class="mt-auto bg-gray-900 hover:bg-black text-white py-4 px-6 rounded-2xl font-bold text-center shadow-lg transition-all">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-24 px-6 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-24">
            <h2 class="text-5xl font-bold text-black mb-6">Why TrackTimi?</h2>
            <p class="text-2xl text-gray-600 max-w-3xl mx-auto">
              Built for Liberian businesses. Secure. Reliable. Local.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="card group hover:shadow-xl transition-all border-2 hover:border-orange-300">
              <div
                class="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                <span class="text-2xl text-white">🔒</span>
              </div>
              <h3 class="text-2xl font-bold text-black mb-4 text-center">Device Lockdown</h3>
              <p class="text-gray-600 text-center leading-relaxed">
                One user = one device. Browser fingerprint + GPS verification.
                No proxy check-ins possible.
              </p>
            </div>

            <!-- Feature 2 -->
            <div class="card group hover:shadow-xl transition-all border-2 hover:border-orange-300">
              <div
                class="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                <span class="text-2xl text-white">📍</span>
              </div>
              <h3 class="text-2xl font-bold text-black mb-4 text-center">GPS Geofence</h3>
              <p class="text-gray-600 text-center leading-relaxed">
                500m office radius. Real-time location verification.
                Perfect for schools, companies, NGOs.
              </p>
            </div>

            <!-- Feature 3 -->
            <div class="card group hover:shadow-xl transition-all border-2 hover:border-orange-300">
              <div
                class="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-lg">
                <span class="text-2xl text-white">⚡</span>
              </div>
              <h3 class="text-2xl font-bold text-black mb-4 text-center">Instant Dashboard</h3>
              <p class="text-gray-600 text-center leading-relaxed">
                Live attendance rates. Department breakdowns.
                Export reports in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-24 px-6">
        <div class="max-w-4xl mx-auto text-center space-y-8">
          <div class="w-24 h-24 mx-auto bg-orange-500 rounded-3xl flex items-center justify-center shadow-2xl mb-8">
            <span class="text-4xl text-white">🚀</span>
          </div>

          <h2 class="text-5xl font-bold text-black mb-6">Ready to track attendance?</h2>
          <p class="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Start with our free trial. No credit card required.
            Cancel anytime.
          </p>

          <div class="flex flex-col sm:flex-row gap-6 justify-center">
            <router-link to="/register-org" class="btn-orange py-6 px-12 text-2xl shadow-2xl w-full sm:w-auto">
              Get Started Free
            </router-link>
            <router-link to="/login" class="btn-black py-6 px-12 text-2xl border-2 w-full sm:w-auto">
              Existing Account
            </router-link>
          </div>
        </div>
      </section>
    </div>



    <!-- ⭐ TEAM SECTION - Perfect SaaS placement -->
    <section class="py-24 bg-gradient-to-br from-orange-50 to-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl lg:text-5xl font-bold text-black mb-6">
            Built by <span class="text-orange-500">TrackTimi</span> Team
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Monrovia, Liberia's premier attendance solution team
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Isaiah Nyenian Sumo (YOU!) -->
          <div class="text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all">
            <div
              class="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <span class="text-4xl font-bold text-white">IS</span>
            </div>
            <h3 class="text-2xl font-bold text-black mb-2">Isaiah Nyenian Sumo</h3>
            <p class="text-lg text-gray-600 mb-4">Founder & Full-Stack Developer</p>
            <div class="flex justify-center space-x-4 text-orange-500">
              <a href="mailto:bequizzy@gmail.com">📧</a>
              <span>Monrovia, LR</span>
            </div>
          </div>

          <!-- Add more team members -->
          <div class="text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all">
            <div
              class="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <span class="text-4xl font-bold text-white">JD</span>
            </div>
            <h3 class="text-2xl font-bold text-black mb-2">John Doe</h3>
            <p class="text-lg text-gray-600 mb-4">UI/UX Designer</p>
            <span class="text-sm text-gray-500">Monrovia, LR</span>
          </div>

          <div class="text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all">
            <div
              class="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <span class="text-4xl font-bold text-white">JS</span>
            </div>
            <h3 class="text-2xl font-bold text-black mb-2">Jane Smith</h3>
            <p class="text-lg text-gray-600 mb-4">Backend Developer</p>
            <span class="text-sm text-gray-500">Monrovia, LR</span>
          </div>

          <div class="text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all">
            <div
              class="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <span class="text-4xl font-bold text-white">EM</span>
            </div>
            <h3 class="text-2xl font-bold text-black mb-2">Emily Moore</h3>
            <p class="text-lg text-gray-600 mb-4">Customer Success Manager</p>
            <span class="text-sm text-gray-500">Monrovia, LR</span>
          </div>
        </div>
      </div>
    </section>
  </template>

<script setup>
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

// Landing page - no logic needed
</script>
