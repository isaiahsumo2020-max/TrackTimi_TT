<template>
  <div class="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-600">
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center space-x-3 group cursor-pointer">
          <div class="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200 group-hover:rotate-6 transition-transform">
            <ZapIcon class="w-6 h-6 text-white fill-white" />
          </div>
          <span class="font-black text-2xl tracking-tighter text-gray-700">Track<span class="text-orange-500">Timi</span><span class="text-orange-500">.</span></span>
        </div>

        <div class="hidden lg:flex items-center space-x-10 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <router-link to="/" class="hover:text-orange-500 transition-colors">Solutions</router-link>
          <router-link to="/" class="hover:text-orange-500 transition-colors">Geofencing</router-link>
          <router-link to="/about" class="text-slate-900 hover:text-orange-500 transition-colors">About</router-link>
          <router-link to="/" class="hover:text-orange-500 transition-colors">Pricing</router-link>
          <router-link to="/login" class="text-slate-900 hover:text-orange-500 transition-colors">Sign In</router-link>
        </div>

        <router-link to="/register-org" class="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-500 hover:shadow-xl hover:shadow-orange-200 transition-all active:scale-95">
          Start Free Trial
        </router-link>
      </div>
    </nav>

    <main class="pt-28">
      <section class="relative overflow-hidden bg-white py-24 lg:py-32">
        <div class="absolute inset-0 opacity-30 pointer-events-none">
          <div class="absolute -top-16 -left-16 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-16 -right-12 w-72 h-72 bg-slate-900/10 rounded-full blur-3xl"></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div class="space-y-8">
            <div class="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span class="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">About TrackTimi</span>
            </div>

            <h1 class="text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tighter">
              Built by the team that brings clarity to workforce attendance.
            </h1>

            <p class="text-lg text-slate-500 max-w-xl leading-relaxed">
              TrackTimi helps organizations enforce GPS boundaries, simplify payroll logs, and gain real-time insight into team operations with modern attendance intelligence.
            </p>

            <div class="flex flex-col sm:flex-row gap-4">
              <router-link to="/register-org" class="px-10 py-5 bg-orange-500 text-white rounded-lg font-black text-sm uppercase tracking-widest shadow-2xl shadow-orange-200 hover:bg-orange-600 hover:-translate-y-1 transition-all flex items-center justify-center">
                Start Free Trial
                <ArrowRightIcon class="w-4 h-4 ml-2" />
              </router-link>
              <router-link to="/login" class="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center">
                Sign In
              </router-link>
            </div>
          </div>

          <div class="relative">
            <div class="overflow-hidden rounded-[2rem] border border-slate-100 shadow-3xl aspect-video">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                alt="Team collaborating over attendance data"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="absolute -top-10 -left-10 w-64 h-64 bg-orange-400/20 rounded-full blur-[90px]"></div>
            <div class="absolute -bottom-10 -right-10 w-64 h-64 bg-slate-900/10 rounded-full blur-[90px]"></div>
          </div>
        </div>
      </section>

      <section class="py-24 bg-white">
        <div class="mx-auto max-w-7xl px-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 class="text-3xl font-bold tracking-tight text-slate-900 mb-4">Our Mission</h2>
              <p class="text-lg text-slate-600 leading-8">
                To empower organizations of all sizes with intelligent, intuitive attendance management solutions that streamline operations, enhance transparency, and unlock the full potential of their workforce.
              </p>
            </div>
            <div>
              <h2 class="text-3xl font-bold tracking-tight text-slate-900 mb-4">Our Vision</h2>
              <p class="text-lg text-slate-600 leading-8">
                To become the trusted global leader in attendance management technology, enabling organizations to build stronger, more connected, and more productive teams through data-driven insights and seamless experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-24 bg-slate-50">
        <div class="mx-auto max-w-7xl px-6">
          <div class="text-center mb-12">
            <p class="text-xs font-black text-orange-500 uppercase tracking-[0.4em]">Enterprise Core</p>
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mt-4">Why Choose TrackTimi</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="rounded-3xl bg-white p-10 border border-slate-100 shadow-sm">
              <div class="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3">Reliability</h3>
              <p class="text-slate-600 leading-7">Enterprise-grade availability, secure verification, and support for multi-tenant organizations.</p>
            </div>

            <div class="rounded-3xl bg-white p-10 border border-slate-100 shadow-sm">
              <div class="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
                </svg>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3">Easy Integration</h3>
              <p class="text-slate-600 leading-7">Plug into existing workforce systems with APIs, webhooks, and low-code onboarding.</p>
            </div>

            <div class="rounded-3xl bg-white p-10 border border-slate-100 shadow-sm">
              <div class="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 0-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 5a1 1 0 011 1v6a1 1 0 11-2 0V8a1 1 0 011-1zm7-7a1 1 0 011 1v7a1 1 0 11-2 0V1a1 1 0 011-1zm2 2a1 1 0 010 2h-1v4a1 1 0 11-2 0V4h-1a1 1 0 010-2h4z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3">Data Insights</h3>
              <p class="text-slate-600 leading-7">Real-time attendance analytics that help teams optimize scheduling and compliance.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-24 bg-white">
        <div class="mx-auto max-w-7xl px-6">
          <div class="mx-auto max-w-2xl text-center mb-16">
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-balance">
              Meet Our Team
            </h2>
            <p class="mt-4 text-lg text-slate-600">
              Passionate professionals dedicated to revolutionizing attendance management.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="text-center rounded-3xl bg-slate-50 p-8 border border-slate-100 shadow-sm">
              <div class="relative mb-4 mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-orange-200 to-slate-200 overflow-hidden shadow-lg flex items-center justify-center">
                <svg class="w-16 h-16 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900">Denies Grandor</h3>
              <p class="text-orange-500 font-semibold mt-1">Team Lead</p>
              <p class="text-slate-600 mt-3 text-sm leading-6">
                Visionary leader with some years of experience in HR technology and workforce management.
              </p>
            </div>

            <div class="text-center rounded-3xl bg-slate-50 p-8 border border-slate-100 shadow-sm">
              <div class="relative mb-4 mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-orange-200 to-slate-200 overflow-hidden shadow-lg flex items-center justify-center">
                <svg class="w-16 h-16 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
               <h3 class="text-lg font-bold text-slate-900">Terologence</h3>
              <p class="text-orange-500 font-semibold mt-1">Senior Developer</p>
              <p class="text-slate-600 mt-3 text-sm leading-6">
                Tech visionary with expertise in scalable systems and cloud architecture for enterprise solutions.
              </p>
            </div>

            <div class="text-center rounded-3xl bg-slate-50 p-8 border border-slate-100 shadow-sm">
              <div class="relative mb-4 mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-orange-200 to-slate-200 overflow-hidden shadow-lg flex items-center justify-center">
                <svg class="w-16 h-16 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900">Isaiah N. Sumo</h3>
              <p class="text-orange-500 font-semibold mt-1">Senior Developer</p>
              <p class="text-slate-600 mt-3 text-sm leading-6">
              Senior Database Engineer with expertise in designing and optimizing data architectures for high-performance applications.
              </p>
            </div>

            <div class="text-center rounded-3xl bg-slate-50 p-8 border border-slate-100 shadow-sm">
              <div class="relative mb-4 mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-orange-200 to-slate-200 overflow-hidden shadow-lg flex items-center justify-center">
                <svg class="w-16 h-16 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
               <h3 class="text-lg font-bold text-slate-900">Tech Tonic</h3>
              <p class="text-orange-500 font-semibold mt-1">Senior Developer</p>
              <p class="text-slate-600 mt-3 text-sm leading-6">
                Software architect with a passion for building robust, scalable applications that drive business success.
              </p>
            </div>

            <div class="text-center rounded-3xl bg-slate-50 p-8 border border-slate-100 shadow-sm">
              <div class="relative mb-4 mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-orange-200 to-slate-200 overflow-hidden shadow-lg flex items-center justify-center">
                <svg class="w-16 h-16 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900">Machneal Tweh</h3>
              <p class="text-orange-500 font-semibold mt-1">UI/UX Designer</p>
              <p class="text-slate-600 mt-3 text-sm leading-6">
                Designs intuitive interfaces and seamless user experiences that make attendance management effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-gradient-to-r from-orange-600 to-orange-700 py-20">
        <div class="mx-auto max-w-4xl px-6 text-center">
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
            Join Our Growing Community
          </h2>
          <p class="mt-4 text-lg text-orange-100">
            Thousands of organizations trust TrackTimi for their attendance management needs.
          </p>
          <router-link
            to="/register-org"
            class="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-orange-600 shadow-sm hover:bg-orange-50 transition-colors"
          >
            Start Your Free Trial
          </router-link>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Footer from '@/components/Footer.vue'
import { ZapIcon, ArrowRightIcon } from 'lucide-vue-next'
</script>

<style scoped>
.card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.card:hover {
  border-color: #cbd5e1;
}
</style>
