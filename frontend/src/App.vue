<!-- src/App.vue - PURE ROUTER CONTAINER -->
<template>
  <div id="app">
    <!-- Global Confirm Dialog -->
    <ConfirmDialog
      :isOpen="dialogState.isOpen"
      :title="dialogState.title"
      :message="dialogState.message"
      :type="dialogState.type"
      :confirmText="dialogState.confirmText"
      :cancelText="dialogState.cancelText"
      :isLoading="dialogState.isLoading"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

    <!-- Main Router -->
    <router-view />
  </div>
</template>

<script setup>
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const { dialogState, handleConfirm, handleCancel } = useConfirmDialog()
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
