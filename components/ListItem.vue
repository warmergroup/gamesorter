<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { Item } from '~/types/item';

const props = defineProps<{
  item: Item;
  level: number;
  dragOverItemId?: string | null;
  openMenuItemId: string | null;
}>();

const emit = defineEmits<{
  'mouse-down': [event: MouseEvent, item: Item, level: number];
  'edit': [item: Item];
  'remove': [item: Item];
  'open-menu': [itemId: string];
  'close-menu': [];
}>();

const isExpanded = ref(true);
const isMenuOpen = computed(() => props.openMenuItemId === props.item.id);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0;
});

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const toggleMenu = () => {
  if (isMenuOpen.value) {
    emit('close-menu');
  } else {
    emit('open-menu', props.item.id);
  }
};

const openEditModal = () => {
  isEditModalOpen.value = true;
  emit('close-menu');
};

const openDeleteModal = () => {
  isDeleteModalOpen.value = true;
  emit('close-menu');
};

const handleMouseDown = (event: MouseEvent) => {
  // Only start drag if clicking on drag handle or content (not buttons)
  const target = event.target as HTMLElement;
  if (
    !target.closest('.list-item__toggle') &&
    !target.closest('.list-item__menu-btn') &&
    !target.closest('.list-item__menu-item')
  ) {
    emit('mouse-down', event, props.item, props.level);
  }
};

// Close menu when clicking outside
const handleDocumentClick = (event: MouseEvent) => {
  if (isMenuOpen.value) {
    const target = event.target as HTMLElement;
    if (!target.closest('.list-item__menu')) {
      emit('close-menu');
    }
  }
};

// Setup and cleanup event listener
onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});

function onEdit(updatedItem) {
  emit('edit', updatedItem);
  isEditModalOpen.value = false;
}

function openMenu() {
  emit('open-menu', props.item.id);
}

function closeMenu() {
  emit('close-menu');
}
</script>

<template>
  <div :class="{
    'list-item': true,
    'list-item--folder': hasChildren,
    'list-item--expanded': isExpanded,
    ['list-item--level-' + level]: true,
    'list-item--drag-over': dragOverItemId === item.id
  }" :data-item-id="item.id">
    <div class="list-item__content" :style="{ paddingLeft: `${24 + level * 20}px` }">
      <!-- Chap tomondagi elementlar -->
      <div class="list-item__left">

        <div class="list-item__drag-handle" @mousedown="handleMouseDown">
          <Icon name="material-symbols:drag-indicator" />
        </div>

        <button v-if="hasChildren" class="list-item__toggle" @click.stop="toggleExpanded">
          <Icon name="material-symbols:chevron-right" :class="{ 'icon-rotated': isExpanded }" />
        </button>

        <div class="list-item__icon">
          <Icon v-if="hasChildren" name="material-symbols:folder" />
          <Icon v-else name="material-symbols:file-copy" />
        </div>

        <div class="list-item__name">{{ item.name }}</div>

        <div class="list-item__order">{{ item.order }}</div>
        <div v-if="item.categories" class="list-item__categories">
          {{ item.categories }}
        </div>

      </div>

      <!-- O'rtadagi elementlar -->


      <!-- O'ng tomondagi elementlar -->
      <div class="list-item__right">
        <span v-if="item.childCount" class="list-item__count">
          {{ item.childCount }}
        </span>
        <button class="list-item__menu-btn" @click.stop="toggleMenu">
          <Icon name="material-symbols:more-horiz" />
        </button>

        <div v-if="isMenuOpen" class="list-item__menu">
          <button class="list-item__menu-item" @click="openEditModal">Edit
            <Icon name="material-symbols:edit" />
          </button>
          <button class="list-item__menu-item" @click="openDeleteModal">Delete
            <Icon name="material-symbols:delete" />
          </button>
        </div>
      </div>
    </div>

    <!-- Recursive Children -->
    <div v-if="isExpanded && hasChildren" class="list-item__children">
      <ListItem v-for="child in item.children" :key="child.id" :item="child" :level="level + 1"
        :openMenuItemId="openMenuItemId" :dragOverItemId="dragOverItemId" @open-menu="emit('open-menu', $event)"
        @close-menu="emit('close-menu')" @mouse-down="$emit('mouse-down', $event, child, level + 1)"
        @edit="$emit('edit', $event)" @remove="$emit('remove', $event)"
        :class="{ 'list-item--drag-over': dragOverItemId === child.id }" />
    </div>

    <!-- Modals -->
    <ItemActionsModal v-if="isEditModalOpen" :item="item" action="edit" @close="isEditModalOpen = false"
      @edit="onEdit" />
    <ItemActionsModal v-if="isDeleteModalOpen" :item="item" action="remove" @close="isDeleteModalOpen = false"
      @remove="emit('remove', $event)" />
  </div>
</template>

<style scoped>
.list-item {
  position: relative;
  width: 100%;
}

.list-item__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  min-height: 50px;
  position: relative;
  transition: all var(--transition);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.list-item__left {
  display: flex;
  align-items: center;
  justify-content: start;
}

.list-item__right {
  display: flex;
  align-items: center;
  justify-content: end;
}


.list-item:last-child>.list-item__content {
  border-bottom: none;
}

.list-item__content:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.list-item__drag-handle {
  cursor: grab;
  opacity: 0.5;
  transition: opacity var(--transition);
  margin-right: var(--spacing-2);
}

.list-item__content:hover .list-item__drag-handle {
  opacity: 1;
}

.list-item__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: var(--spacing-2);
}

.list-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-3);
  color: var(--text-tertiary);
  width: 20px;
}

.list-item__name {
  flex: 1;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: var(--spacing-3);
}

.list-item__order {
  margin-right: var(--spacing-6);
  color: var(--text-tertiary);
  font-size: 14px;
  width: 24px;
  text-align: center;
}

.list-item__categories {
  margin-right: var(--spacing-4);
  color: var(--text-tertiary);
  font-size: 14px;
  max-width: 40%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item__actions {
  display: flex;
  align-items: center;
  position: relative;
  margin-left: auto;
}

.list-item__count {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 0 var(--spacing-2);
  height: 24px;
  width: 24px;
  margin-right: var(--spacing-3);
}

.list-item__menu-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  opacity: 0.5;
  transition: all var(--transition);
}

.list-item__content:hover .list-item__menu-btn {
  opacity: 1;
}

.list-item__menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.list-item__menu {
  position: absolute;
  display: flex;
  justify-content: start;
  align-items: start;
  flex-direction: column;
  padding: var(--spacing-2);
  gap: var(--spacing-2);
  right: 0;
  top: 100%;
  background: var(--background-light);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.list-item__menu-item {
  display: flex;
  align-items: start;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  text-align: left;
  transition: background-color var(--transition);
}

.list-item__menu-item:hover {
  background-color: var(--secondary);
}

.list-item__children {
  position: relative;
}

.icon-rotated {
  transform: rotate(90deg);
}

/* Level indentation */
.list-item--level-1 .list-item__content {
  background-color: rgba(255, 255, 255, 0.02);
}

.list-item--level-2 .list-item__content {
  background-color: rgba(255, 255, 255, 0.03);
}

.list-item--level-3 .list-item__content {
  background-color: rgba(255, 255, 255, 0.04);
}

.list-item--drag-over .list-item__content {
  border: 2px dashed var(--primary);
  background-color: rgba(var(--primary-rgb), 0.1);
  transition: all var(--transition);
}
</style>