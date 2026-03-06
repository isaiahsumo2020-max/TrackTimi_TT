<!-- src/App.vue - SIMPLIFIED ROOT LAYOUT -->
<template>
  <div class="min-h-screen flex flex-col">
    <router-view />
    <Footer />
  </div>
</template>

<script setup>
import Footer from '@/components/Footer.vue'
// NO IMPORTS NEEDED - router handled by main.js
</script>

<style>
/* Global resets */
html, body {
  height: 100%;
}
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
}
</style>
