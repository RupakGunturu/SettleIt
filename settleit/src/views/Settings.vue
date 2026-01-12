<template>
  <div class="placeholder-page">
    <h1>Settings</h1>
    <p>Configure your preferences, currency, and profile here.</p>
    <div class="glass-card empty-state">
      <div class="pulsing-icon">⚙️</div>
    </div>
  </div>
</template>

<style scoped>
.placeholder-page { text-align: center; padding: 4rem 2rem; }
.empty-state { margin-top: 2rem; padding: 4rem; display: flex; align-items: center; justify-content: center; }
.pulsing-icon { font-size: 4rem; animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
</style>
