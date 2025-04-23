<script setup lang="ts">
import { computed } from 'vue';
import { useHistoryStore } from '~/stores/history';

const historyStore = useHistoryStore();

const canUndo = computed(() => historyStore.canUndo);
const canRedo = computed(() => historyStore.canRedo);

const undo = () => {
  historyStore.undo();
};

const redo = () => {
  historyStore.redo();
};
</script>

<template>
  <div class="undo-redo">
    <div class="undo-redo__container">
      <button
        class="undo-redo__button"
        :disabled="!canUndo"
        @click="undo"
      >
        <Icon name="material-symbols:undo"/>
      </button>
      <button
        class="undo-redo__button"
        :disabled="!canRedo"
        @click="redo"
      >
        <Icon name="material-symbols:redo"/>
      </button>
    </div>
  </div>
</template>


<style scoped>
.undo-redo {
  bottom: 0;
  left: 0;
  background-color: var(--background-dark);
  padding: var(--spacing-3) 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.undo-redo__container {
  display: flex;
  justify-content: center;
  gap: var(--spacing-4);
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

.undo-redo__button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius);
  background-color: var(--background-light);
  color: var(--text-secondary);
  font-weight: 500;
  transition: all var(--transition);
}

.undo-redo__button:hover:not(:disabled) {
  background-color: var(--secondary);
  color: var(--text-primary);
}

.undo-redo__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>