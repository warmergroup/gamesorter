<template>
  <div class="pagination">
    <div class="pagination__info">
      Showing {{ startItem }} to {{ endItem }} of {{ total }}
    </div>
    <div class="pagination__controls">
      <button
        class="pagination__button"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        <Icon name="material-symbols:chevron-left"/>

      </button>

      <div class="pagination__pages">
        <button
          v-if="showFirstPage"
          class="pagination__page"
          :class="{ 'pagination__page--active': currentPage === 1 }"
          @click="changePage(1)"
        >
          1
        </button>

        <div v-if="startPage > 2" class="pagination__ellipsis">...</div>

        <button
          v-for="page in displayedPages"
          :key="page"
          class="pagination__page"
          :class="{ 'pagination__page--active': currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>

        <div v-if="endPage < pageCount - 1" class="pagination__ellipsis">...</div>

        <button
          v-if="showLastPage"
          class="pagination__page"
          :class="{ 'pagination__page--active': currentPage === pageCount }"
          @click="changePage(pageCount)"
        >
          {{ pageCount }}
        </button>
      </div>

      <button
        class="pagination__button"
        :disabled="currentPage === pageCount"
        @click="changePage(currentPage + 1)"
      >
        <Icon name="material-symbols:chevron-right"/>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';

const props = defineProps<{
  total: number;
  currentPage: number;
  perPage: number;
}>();

const emit = defineEmits<{
  'page-change': [page: number];
}>();

// Calculate total number of pages
const pageCount = computed(() => Math.ceil(props.total / props.perPage));

// Calculate which items are being shown
const startItem = computed(() =>
  (props.currentPage - 1) * props.perPage + 1
);

const endItem = computed(() =>
  Math.min(props.currentPage * props.perPage, props.total)
);

// Logic for which page numbers to display
const displayCount = 3; // Number of page buttons to show (excluding first/last)

const startPage = computed(() => {
  // Calculate start page, ensuring we show displayCount pages
  let start = Math.max(2, props.currentPage - Math.floor(displayCount / 2));

  // Adjust if we're near the end
  if (start > pageCount.value - displayCount - 1) {
    start = Math.max(2, pageCount.value - displayCount);
  }

  return start;
});

const endPage = computed(() => {
  // Calculate end page
  let end = Math.min(pageCount.value - 1, startPage.value + displayCount - 1);

  // Ensure we show at most displayCount pages
  if (end - startPage.value + 1 > displayCount) {
    end = startPage.value + displayCount - 1;
  }

  return end;
});

const displayedPages = computed(() => {
  // Generate array of page numbers to display
  const pages = [];
  for (let i = startPage.value; i <= endPage.value; i++) {
    pages.push(i);
  }
  return pages;
});

// Show first/last page buttons logic
const showFirstPage = computed(() => pageCount.value > 1);
const showLastPage = computed(() => pageCount.value > 1 && pageCount.value !== 1);

// Change page handler
const changePage = (page: number) => {
  if (page < 1 || page > pageCount.value) return;
  emit('page-change', page);
};
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-6);
}

.pagination__info {
  color: var(--text-tertiary);
  font-size: 14px;
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.pagination__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius);
  background-color: var(--background-light);
  color: var(--text-secondary);
  transition: all var(--transition);
}

.pagination__button:hover:not(:disabled) {
  background-color: var(--secondary);
  color: var(--text-primary);
}

.pagination__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__pages {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.pagination__page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all var(--transition);
}

.pagination__page:hover {
  background-color: var(--background-light);
}

.pagination__page--active {
  background-color: var(--primary);
  color: white;
}

.pagination__page--active:hover {
  background-color: var(--primary-light);
}

.pagination__ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  color: var(--text-tertiary);
}
</style>