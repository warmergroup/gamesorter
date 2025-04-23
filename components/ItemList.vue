<template>
  <div
    ref="listContainer"
    class="item-list"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <div v-if="items.length === 0" class="item-list__empty">
      No items found.
    </div>
    <template v-else>
      <ListItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :level="0"
        @mouse-down="handleMouseDown"
      />
    </template>
    <div
      v-if="isDragging"
      class="item-list__drag-ghost"
      :style="ghostStyle"
    >
      <div class="item-list__drag-ghost-inner">
        {{ draggingItem?.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { Item } from '~/types/item';
import { useListStore } from '~~/stores/list';

const props = defineProps<{
  items: Item[];
}>();

const emit = defineEmits<{
  reorder: [payload: any];
}>();

const listStore = useListStore();
const listContainer = ref<HTMLElement | null>(null);

// Drag state
const isDragging = ref(false);
const draggingItem = ref<Item | null>(null);
const draggingLevel = ref(0);
const draggingParentId = ref<string | null>(null);
const mousePosition = reactive({ x: 0, y: 0 });
const dragStartPosition = reactive({ x: 0, y: 0 });
const dragOffset = reactive({ x: 0, y: 0 });

// Computed styles for drag ghost element
const ghostStyle = computed(() => {
  return {
    left: `${mousePosition.x - dragOffset.x}px`,
    top: `${mousePosition.y - dragOffset.y}px`,
    width: `${listContainer.value?.offsetWidth || 0}px`,
  };
});

// Start dragging
const handleMouseDown = (event: MouseEvent, item: Item, level: number) => {
  if (event.button !== 0) return; // Only left mouse button

  // Get parent ID for constraint checking
  draggingParentId.value = level > 0 ? listStore.getParentId(item.id) : null;

  draggingItem.value = item;
  draggingLevel.value = level;
  isDragging.value = true;

  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();

  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
  dragStartPosition.x = event.clientX;
  dragStartPosition.y = event.clientY;

  // Calculate offset from the mouse cursor to the element's top-left corner
  dragOffset.x = event.clientX - rect.left;
  dragOffset.y = event.clientY - rect.top;

  // Prevent text selection during drag
  document.body.style.userSelect = 'none';

  event.preventDefault();
};

// Track mouse movement during drag
const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return;

  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;

  // Find target element and position
  const targetElement = findTargetElement(event);

  // Highlight drop target if valid
  if (targetElement) {
    // Implement highlight logic here
  }
};

// End dragging and possibly reorder
const handleMouseUp = (event: MouseEvent) => {
  if (!isDragging.value) return;

  document.body.style.userSelect = '';

  // Find target element for drop
  const targetElement = findTargetElement(event);

  if (targetElement && draggingItem.value) {
    const targetItemId = targetElement.dataset.itemId;
    const position = determineDropPosition(event, targetElement);

    if (targetItemId) {
      // Check if drop is valid (respecting parent constraints)
      if (isValidDrop(targetItemId, position)) {
        emit('reorder', {
          itemId: draggingItem.value.id,
          targetId: targetItemId,
          position: position,
        });
      }
    }
  }

  // Reset drag state
  isDragging.value = false;
  draggingItem.value = null;
  draggingLevel.value = 0;
  draggingParentId.value = null;
};

// Helper functions
const findTargetElement = (event: MouseEvent): HTMLElement | null => {
  // Get all potential drop targets
  const elements = document.elementsFromPoint(event.clientX, event.clientY);

  // Find the first list item in the elements array
  for (const element of elements) {
    if (element.classList.contains('list-item') && element !== event.target) {
      return element as HTMLElement;
    }
  }

  return null;
};

const determineDropPosition = (event: MouseEvent, element: HTMLElement): 'before' | 'after' | 'inside' => {
  const rect = element.getBoundingClientRect();
  const mouseY = event.clientY;

  // Top 25% = before, Bottom 25% = after, Middle 50% = inside (for folders)
  const relativeY = (mouseY - rect.top) / rect.height;

  if (relativeY < 0.25) {
    return 'before';
  } else if (relativeY > 0.75) {
    return 'after';
  } else {
    // Check if target can contain children
    const isFolder = element.classList.contains('list-item--folder');
    return isFolder ? 'inside' : (relativeY < 0.5 ? 'before' : 'after');
  }
};

const isValidDrop = (targetId: string, position: string): boolean => {
  if (!draggingItem.value) return false;

  // Can't drop onto itself
  if (targetId === draggingItem.value.id) return false;

  // Check if target is a child of the dragging item (prevents circular references)
  if (listStore.isChildOf(targetId, draggingItem.value.id)) return false;

  // If dragging a nested item, ensure it stays within its parent
  if (draggingLevel.value > 0 && draggingParentId.value) {
    // For 'inside' position, check if target can accept children
    if (position === 'inside') {
      return true; // Allow dropping inside any item that isn't a child of dragging item
    }

    // For before/after positions, check if target has same parent
    const targetParentId = listStore.getParentId(targetId);
    return targetParentId === draggingParentId.value;
  }

  return true;
};
</script>

<style scoped>
.item-list {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius);
  background-color: var(--background-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.item-list__empty {
  padding: var(--spacing-6);
  text-align: center;
  color: var(--text-tertiary);
  font-style: italic;
}

.item-list__drag-ghost {
  position: fixed;
  pointer-events: none;
  z-index: 1000;
  opacity: 0.8;
}

.item-list__drag-ghost-inner {
  background-color: var(--secondary-light);
  border-radius: var(--border-radius);
  padding: var(--spacing-3) var(--spacing-4);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>