<script setup lang="ts">
  import { useHistoryStore } from '~/stores/history';

  const historyStore = useHistoryStore();
  defineProps<{
    count: number;
  }>();
</script>

<template>
  <div class="list-header">
    <div class="list-header__title">
      <h1>Games List</h1>
      <div class="list-header__count">Found: {{ count }}</div>
    </div>

    <AppUndoRedo v-if="historyStore.hasHistory" />
<!--    <div class="list-header__actions">-->
<!--      <button class="list-header__action-btn">-->
<!--        <Icon name="material-symbols:mode-night"/>-->
<!--      </button>-->
<!--      <button class="list-header__action-btn">-->
<!--        <Icon name="material-symbols:settings"/>-->
<!--      </button>-->
<!--    </div>-->
  </div>
</template>



<style scoped>
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

}

.list-header__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.list-header__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--success);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px var(--spacing-2);
  border-radius: 4px;
  height: 20px;
}

.list-header__actions {
  display: flex;
  gap: var(--spacing-2);
}

.list-header__action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  background-color: var(--background-light);
  color: var(--text-tertiary);
  transition: all var(--transition);
}

.list-header__action-btn:hover {
  background-color: var(--secondary);
  color: var(--text-primary);
}
</style>