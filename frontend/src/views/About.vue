<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-black via-orange-950/50 to-black py-24 lg:py-32">
      <!-- Background SVG Pattern -->
      <div class="absolute inset-0 opacity-20" style="background-image: url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern id=%22grid%22 width=%22100%22 height=%22100%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M 100 0 L 0 0 0 100%22 fill=%22none%22 stroke=%22%23000000%22 stroke-width=%220.5%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23ff6600%22/%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23grid)%22 /%3E%3C/svg%3E'); z-index: 0;" />
      <div class="mx-auto max-w-7xl px-6 relative z-10">
        <div class="mx-auto max-w-2xl text-center">
          <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            About TrackTimi
          </h1>
          <p class="mt-6 text-lg leading-8 text-gray-300 text-pretty">
            We're building the future of workforce management with cutting-edge attendance tracking technology.
          </p>
        </div>
      </div>
    </section>

    <!-- Mission & Vision -->
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

    <!-- Why Choose Us -->
    <section class="py-24 bg-slate-50">
      <div class="mx-auto max-w-7xl px-6">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 text-center mb-12">Why Choose Attendex</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="card p-8 bg-white">
            <div class="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">Reliability</h3>
            <p class="text-slate-600">Enterprise-grade reliability with 99.9% uptime guarantee and dedicated support.</p>
          </div>
          <div class="card p-8 bg-white">
            <div class="h-12 w-12 rounded-lg bg-accent-50 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">Easy Integration</h3>
            <p class="text-slate-600">Seamless integration with existing systems through comprehensive APIs and webhooks.</p>
          </div>
          <div class="card p-8 bg-white">
            <div class="h-12 w-12 rounded-lg bg-warning-50 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 0-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 5a1 1 0 011 1v6a1 1 0 11-2 0V8a1 1 0 011-1zm7-7a1 1 0 011 1v7a1 1 0 11-2 0V1a1 1 0 011-1zm2 2a1 1 0 010 2h-1v4a1 1 0 11-2 0V4h-1a1 1 0 010-2h4z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">Data Insights</h3>
            <p class="text-slate-600">Advanced analytics and reporting to help you understand and optimize workforce patterns.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
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
          <!-- Team Member 1 -->
          <div class="text-center">
            <div class="relative mb-4">
              <div class="aspect-square rounded-full bg-gradient-to-br from-primary-200 to-accent-200 overflow-hidden shadow-lg flex items-center justify-center">
                <svg class="w-16 h-16 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-bold text-slate-900">Tech Tonic</h3>
            <p class="text-primary-600 font-semibold mt-1">Senior Developer</p>
            <p class="text-slate-600 mt-3 text-sm leading-6">
              Visionary leader with 10+ years of experience in HR technology and workforce management.
            </p>
            <div class="flex justify-center gap-4 mt-4">
              <a href="#" class="text-slate-400 hover:text-primary-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 11.5c.828 0 1.5-.672 1.5-1.5S8.828 8.5 7.5 8.5 6 9.172 6 10s.672 1.5 1.5 1.5m7-7C15.328 4.5 16 5.172 16 6s-.672 1.5-1.5 1.5S13 6.828 13 6s.672-1.5 1.5-1.5m-7 14.25c-2.34 0-4.3661.39-6.108 1.096-.867.37-1.392 1.207-1.392 2.124V22h16v-2.03c0-.917-.525-1.754-1.392-2.124-1.74-.706-3.77-1.096-6.108-1.096m6.064-8.532c-1.066-.866-2.465-1.382-3.986-1.382-1.52 0-2.92.516-3.985 1.382" />
                </svg>
              </a>
              <a href="#" class="text-slate-400 hover:text-primary-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.39v-1.2h-2.84v8.37h2.84v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.84M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
                </svg>
              </a>
              <a href="#" class="text-slate-400 hover:text-primary-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.87.39-1.8.65-2.77.77 1-1.6 1.77-3.95 2.14-6.77-1.4.85-2.92 1.5-4.5 1.84-1.3-1.4-3.16-2.27-5.21-2.27-3.95 0-7.14 3.2-7.14 7.14 0 .56.06 1.1.18 1.62-5.93-.3-11.2-3.14-14.73-7.46-.62 1.05-.97 2.28-.97 3.58 0 2.48 1.26 4.66 3.18 5.93-.98-.02-1.9-.3-2.7-.75v.1c0 3.46 2.46 6.36 5.73 7.02-.6.16-1.23.25-1.87.25-.46 0-.9-.04-1.33-.12.9 2.8 3.47 4.84 6.52 4.89-2.44 1.92-5.5 3.05-8.84 3.05-.57 0-1.14-.04-1.7-.12 3.17 2.03 6.92 3.2 10.95 3.2 13.14 0 20.3-10.88 20.3-20.3 0-.31 0-.62-.02-.92 1.4-1 2.6-2.27 3.55-3.72z" />
                </svg>
              </a>
            </div>
          </div>

          <!-- Team Member 2 -->
          <div class="text-center">
            <div class="relative mb-4">
              <div class="aspect-square rounded-full bg-gradient-to-br from-accent-200 to-warning-200 overflow-hidden shadow-lg flex items-center justify-center">
                <svg class="w-16 h-16 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-bold text-slate-900">Terologence</h3>
            <p class="text-primary-600 font-semibold mt-1">Senior Developer</p>
            <p class="text-slate-600 mt-3 text-sm leading-6">
              Tech visionary with expertise in scalable systems and cloud architecture for enterprise solutions.
            </p>
            <div class="flex justify-center gap-4 mt-4">
              <a href="#" class="text-slate-400 hover:text-primary-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 11.5c.828 0 1.5-.672 1.5-1.5S8.828 8.5 7.5 8.5 6 9.172 6 10s.672 1.5 1.5 1.5m7-7C15.328 4.5 16 5.172 16 6s-.672 1.5-1.5 1.5S13 6.828 13 6s.672-1.5 1.5-1.5m-7 14.25c-2.34 0-4.366 1.39-6.108 1.096-.867.37-1.392 1.207-1.392 2.124V22h16v-2.03c0-.917-.525-1.754-1.392-2.124-1.74-.706-3.77-1.096-6.108-1.096m6.064-8.532c-1.066-.866-2.465-1.382-3.986-1.382-1.52 0-2.92.516-3.985 1.382" />
                </svg>
              </a>
              <a href="#" class="text-slate-400 hover:text-primary-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.39v-1.2h-2.84v8.37h2.84v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.84M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
                </svg>
              </a>
              <a href="#" class="text-slate-400 hover:text-primary-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.87.39-1.8.65-2.77.77 1-1.6 1.77-3.95 2.14-6.77-1.4.85-2.92 1.5-4.5 1.84-1.3-1.4-3.16-2.27-5.21-2.27-3.95 0-7.14 3.2-7.14 7.14 0 .56.06 1.1.18 1.62-5.93-.3-11.2-3.14-14.73-7.46-.62 1.05-.97 2.28-.97 3.58 0 2.48 1.26 4.66 3.18 5.93-.98-.02-1.9-.3-2.7-.75v.1c0 3.46 2.46 6.36 5.73 7.02-.6.16-1.23.25-1.87.25-.46 0-.9-.04-1.33-.12.9 2.8 3.47 4.84 6.52 4.89-2.44 1.92-5.5 3.05-8.84 3.05-.57 0-1.14-.04-1.7-.12 3.17 2.03 6.92 3.2 10.95 3.2 13.14 0 20.3-10.88 20.3-20.3 0-.31 0-.62-.02-.92 1.4-1 2.6-2.27 3.55-3.72z" />
                </svg>
              </a>
            </div>
          </div>

          <!-- Team Member 3 -->
          <div class="text-center">
            <div class="relative mb-4">
              <div class="aspect-square rounded-full bg-gradient-to-br from-warning-200 to-danger-200 overflow-hidden shadow-lg flex items-center justify-center">
                <svg class="w-16 h-16 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-bold text-slate-900">Isaiah Sumo</h3>
            <p class="text-primary-600 font-semibold mt-1">Senior Developer</p>
            <p class="text-slate-600 mt-3 text-sm leading-6">
              Product strategist focused on creating intuitive solutions that solve real user problems.
            </p>
            <div class="flex justify-center gap-4 mt-4">
              <a href="#" class="text-slate-400 hover:text-primary-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 11.5c.828 0 1.5-.672 1.5-1.5S8.828 8.5 7.5 8.5 6 9.172 6 10s.672 1.5 1.5 1.5m7-7C15.328 4.5 16 5.172 16 6s-.672 1.5-1.5 1.5S13 6.828 13 6s.672-1.5 1.5-1.5m-7 14.25c-2.34 0-4.366 1.39-6.108 1.096-.867.37-1.392 1.207-1.392 2.124V22h16v-2.03c0-.917-.525-1.754-1.392-2.124-1.74-.706-3.77-1.096-6.108-1.096m6.064-8.532c-1.066-.866-2.465-1.382-3.986-1.382-1.52 0-2.92.516-3.985 1.382" />
                </svg>
              </a>
              <a href="#" class="text-slate-400 hover:text-primary-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.39v-1.2h-2.84v8.37h2.84v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.84M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
                </svg>
              </a>
              <a href="#" class="text-slate-400 hover:text-primary-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.87.39-1.8.65-2.77.77 1-1.6 1.77-3.95 2.14-6.77-1.4.85-2.92 1.5-4.5 1.84-1.3-1.4-3.16-2.27-5.21-2.27-3.95 0-7.14 3.2-7.14 7.14 0 .56.06 1.1.18 1.62-5.93-.3-11.2-3.14-14.73-7.46-.62 1.05-.97 2.28-.97 3.58 0 2.48 1.26 4.66 3.18 5.93-.98-.02-1.9-.3-2.7-.75v.1c0 3.46 2.46 6.36 5.73 7.02-.6.16-1.23.25-1.87.25-.46 0-.9-.04-1.33-.12.9 2.8 3.47 4.84 6.52 4.89-2.44 1.92-5.5 3.05-8.84 3.05-.57 0-1.14-.04-1.7-.12 3.17 2.03 6.92 3.2 10.95 3.2 13.14 0 20.3-10.88 20.3-20.3 0-.31 0-.62-.02-.92 1.4-1 2.6-2.27 3.55-3.72z" />
                </svg>
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-gradient-to-r from-orange-600 to-orange-700 py-20">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
          Join Our Growing Community
        </h2>
        <p class="mt-4 text-lg text-orange-100">
          Thousands of organizations trust Attendex for their attendance management needs.
        </p>
        <router-link
          to="/register"
          class="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-orange-600 shadow-sm hover:bg-orange-50 transition-colors"
        >
          Start Your Free Trial
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
// No additional setup needed for this component
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
