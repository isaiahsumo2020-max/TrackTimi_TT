<!-- src/App.vue - PURE ROUTER CONTAINER -->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
/* EMPTY - Router handles everything */
</script>

<style>
* {
  box-sizing: border-box;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
}

#app {
  min-height: 100vh;
  width: 100%;
}
</style>
