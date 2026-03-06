<!-- src/components/Footer.vue -->
<template>
  <footer class="bg-gradient-to-r from-gray-900 to-black text-white">
    <div class="max-w-7xl mx-auto px-6 py-16">
      <!-- Top Row -->
      <div class="grid md:grid-cols-4 gap-12 mb-12">
        <!-- TrackTimi Brand -->
        <div>
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
              <span class="text-xl font-bold text-white">T</span>
            </div>
            <div>
              <h3 class="text-2xl font-bold">Track<span class="text-orange-500">Timi</span></h3>
              <p class="text-sm text-gray-400">Monrovia, Liberia</p>
            </div>
          </div>
          <p class="text-gray-400 leading-relaxed">
            Accurate attendance tracking with device security and GPS verification.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-bold mb-6">Quick Links</h4>
          <ul class="space-y-3">
            <li><a href="/" class="text-gray-300 hover:text-white transition-colors">Home</a></li>
            <li><a href="/login" class="text-gray-300 hover:text-white transition-colors">Login</a></li>
            <li><a href="/register-org" class="text-gray-300 hover:text-white transition-colors">Start Trial</a></li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="text-lg font-bold mb-6">Company</h4>
          <ul class="space-y-3">
            <li><a href="#features" class="text-gray-300 hover:text-white">Features</a></li>
            <li><a href="#pricing" class="text-gray-300 hover:text-white">Pricing</a></li>
            <li><a href="/team" class="text-gray-300 hover:text-white">Team</a></li>
            <li><a href="#contact" class="text-gray-300 hover:text-white">Contact</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-lg font-bold mb-6">Contact</h4>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <span class="text-orange-500">📧</span>
              <a href="mailto:hello@tracktimi.com">hello@tracktimi.com</a>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-orange-500">📍</span>
              <span>Monrovia, Montserrado County, LR</span>
            </div>
            <div class="flex space-x-3 pt-2">
              <a href="#" class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-400 transition-colors">🐦</a>
              <a href="#" class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-400 transition-colors">📘</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        <p>&copy; 2026 TrackTimi. Built by <span class="font-bold text-orange-500">Isaiah Nyenian Sumo</span> in Monrovia, Liberia.</p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Security</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>
