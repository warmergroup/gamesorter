<template>
  <div class="layout">
    <main class="main">
      <slot />
    </main>

  </div>
</template>

<script setup lang="ts">
import { useHistoryStore } from '~/stores/history';

const historyStore = useHistoryStore();
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
}
</style>