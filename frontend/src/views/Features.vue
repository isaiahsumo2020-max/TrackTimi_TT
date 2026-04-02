<template>
  <div class="min-h-screen py-20 px-6 max-w-7xl mx-auto">
    <h1 class="text-5xl font-bold mb-20 text-center">Features</h1>
    <div class="grid md:grid-cols-2 gap-12">
      <div>
        <h2 class="text-3xl font-bold mb-8">GPS Check-ins</h2>
        <p>Real-time location verification for accurate attendance.</p>
      </div>
      <div>
        <h2 class="text-3xl font-bold mb-8">Department Management</h2>
        <p>Organize teams and track attendance by department.</p>
      </div>
    </div>
    <router-link to="/" class="mt-20 inline-block bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold">
      ← Back to Home
    </router-link>
    <Footer />
  </div>
</template>
