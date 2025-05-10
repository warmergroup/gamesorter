<template>
  <div class="container list-page">
    <ListHeader :count="filteredItems.length" />
    <ItemList :items="filteredItems" @reorder="handleReorder" @edit="handleEdit" @remove="handleRemove" />
    <ListPagination :total="listStore.totalItems" :current-page="currentPage" :per-page="perPage"
      @page-change="setPage" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useListStore } from '~/stores/list';
import { useHistoryStore } from '~/stores/history';

const listStore = useListStore();
const historyStore = useHistoryStore();

const currentPage = ref(1);
const perPage = ref(10);

const filteredItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return listStore.rootItems.slice(start, end);
});

const setPage = (page: number) => {
  currentPage.value = page;
};

const handleReorder = (payload: any) => {
  historyStore.addToHistory();
  listStore.reorderItems(payload);
};

function handleEdit(updatedItem: any) {
  historyStore.addToHistory();
  listStore.updateItem(updatedItem);
}

function handleRemove(item: any) {
  historyStore.addToHistory();
  listStore.removeItemFromCurrentPosition(item.id);
}

onMounted(async () => {
  listStore.loadItems();
  historyStore.initHistory();
});
</script>

<style scoped>
.list-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
</style>