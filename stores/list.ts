import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Item, ReorderPayload } from '~/types/item';

export const useListStore = defineStore('list', () => {
  const items = ref<Item[]>([]);
  const isLoading = ref(false);
  const totalItems = ref(0);

  // Computed property to get only root level items
  const rootItems = computed(() => {
    return items.value.filter(item => !isChildItem(item.id));
  });

  // Helper to check if an item is a child of any other item
  function isChildItem(itemId: string): boolean {
    for (const item of items.value) {
      if (item.children && item.children.some(child => child.id === itemId)) {
        return true;
      }

      // Check deeper levels of nesting
      if (item.children) {
        for (const child of item.children) {
          if (hasChildRecursive(child, itemId)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Recursive helper to check nested children
  function hasChildRecursive(parent: Item, childId: string): boolean {
    if (!parent.children) return false;

    if (parent.children.some(child => child.id === childId)) {
      return true;
    }

    for (const child of parent.children) {
      if (hasChildRecursive(child, childId)) {
        return true;
      }
    }

    return false;
  }

  // Find an item by ID in the entire tree
  function findItemById(id: string): Item | null {
    // Check root items
    const rootItem = items.value.find(item => item.id === id);
    if (rootItem) return rootItem;

    // Check children recursively
    for (const item of items.value) {
      if (item.children) {
        const found = findItemInChildren(item.children, id);
        if (found) return found;
      }
    }

    return null;
  }

  // Helper to find an item in a nested array of children
  function findItemInChildren(children: Item[], id: string): Item | null {
    for (const child of children) {
      if (child.id === id) return child;

      if (child.children) {
        const found = findItemInChildren(child.children, id);
        if (found) return found;
      }
    }

    return null;
  }

  // Find the parent of an item
  function getParentId(itemId: string): string | null {
    for (const item of items.value) {
      if (item.children && item.children.some(child => child.id === itemId)) {
        return item.id;
      }

      if (item.children) {
        const parent = findParentRecursive(item.children, itemId);
        if (parent) return parent;
      }
    }

    return null;
  }

  // Recursive helper to find parent in nested children
  function findParentRecursive(children: Item[], itemId: string): string | null {
    for (const child of children) {
      if (child.children && child.children.some(c => c.id === itemId)) {
        return child.id;
      }

      if (child.children) {
        const parent = findParentRecursive(child.children, itemId);
        if (parent) return parent;
      }
    }

    return null;
  }

  // Check if one item is a child of another
  function isChildOf(childId: string, parentId: string): boolean {
    const parent = findItemById(parentId);
    if (!parent || !parent.children) return false;

    // Direct child check
    if (parent.children.some(child => child.id === childId)) {
      return true;
    }

    // Recursive check for deeper nesting
    for (const child of parent.children) {
      if (isChildOf(childId, child.id)) {
        return true;
      }
    }

    return false;
  }

  // Remove item from its current position
  function removeItemFromCurrentPosition(itemId: string) {
    // Check if item is at root level
    const rootIndex = items.value.findIndex(item => item.id === itemId);

    if (rootIndex >= 0) {
      // Remove from root
      items.value.splice(rootIndex, 1);
      return;
    }

    // Check in children
    for (const item of items.value) {
      if (item.children) {
        removeFromChildren(item.children, itemId, item);
      }
    }
  }

  // Helper to remove an item from children array
  function removeFromChildren(children: Item[], itemId: string, parent: Item) {
    const index = children.findIndex(child => child.id === itemId);

    if (index >= 0) {
      children.splice(index, 1);
      updateChildCount(parent);
      return;
    }

    // Check deeper levels
    for (const child of children) {
      if (child.children) {
        removeFromChildren(child.children, itemId, child);
      }
    }
  }

  // Update child count for a parent item
  function updateChildCount(parent: Item) {
    parent.childCount = parent.children?.length || 0;
  }

  // Insert item at target position
  function insertItemAtPosition(item: Item, targetId: string, position: string) {
    if (position === 'inside') {
      // Insert as a child of target
      const targetItem = findItemById(targetId);
      if (!targetItem) return;

      if (!targetItem.children) {
        targetItem.children = [];
      }

      // Add to the end of children arrays
      targetItem.children.push(item);

      // Update the orders
      targetItem.children.forEach((child, index) => {
        child.order = index + 1;
      });

      updateChildCount(targetItem);
    } else {
      // Insert before or after target
      const targetParentId = getParentId(targetId);

      if (targetParentId) {
        // Target is a child item
        const parent = findItemById(targetParentId);
        if (!parent || !parent.children) return;

        const targetIndex = parent.children.findIndex(child => child.id === targetId);
        if (targetIndex < 0) return;

        const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
        parent.children.splice(insertIndex, 0, item);

        // Update the orders
        parent.children.forEach((child, index) => {
          child.order = index + 1;
        });

        updateChildCount(parent);
      } else {
        // Target is a root item
        const targetIndex = items.value.findIndex(item => item.id === targetId);
        if (targetIndex < 0) return;

        const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
        items.value.splice(insertIndex, 0, item);

        // Update the orders
        items.value.forEach((item, index) => {
          item.order = index + 1;
        });
      }
    }
  }

  // Reorder items based on the drag and drop action
  function reorderItems(payload: ReorderPayload) {
    const { itemId, targetId, position } = payload;

    if (itemId === targetId) return; // Can't move onto itself

    // Check if target is a child of the item being moved (prevents circular references)
    if (position === 'inside' && isChildOf(targetId, itemId)) return;

    // Find the item to move
    const itemToMove = findItemById(itemId);
    if (!itemToMove) return;

    // Clone the item to avoid reference issues
    const itemClone = { ...itemToMove };

    // Remove the item from its current position
    removeItemFromCurrentPosition(itemId);

    // Insert the item at the target position
    insertItemAtPosition(itemClone, targetId, position);
  }

  // Load items from API
  async function loadItems() {
    isLoading.value = true;

    try {
      // Fake API call to server
      const data = await $fetch('/api/items');
      items.value = data.items;
      totalItems.value = data.total;
    } catch (error) {
      console.error('Failed to load items:', error);
      // Use mock data as fallback
      const mockData = generateMockData();
      items.value = mockData.items;
      totalItems.value = mockData.total;
    } finally {
      isLoading.value = false;
    }
  }

  // Generate mock data for development
  function generateMockData() {
    const mockItems = [
      {
        id: '1',
        name: 'DOTA2',
        order: 1,
        categories: 'Head / Weapon / Back / Shoulders / Arms / Bracers / Collection / Event',
        childCount: 9,
        children: []
      },
      {
        id: '2',
        name: 'CS2',
        order: 2,
        categories: 'Gloves / Heavy / Knives / Pistols / Rifles / SMGs',
        childCount: 6,
        children: [
          {
            id: '2.1',
            name: 'Gloves',
            order: 1,
            children: []
          },
          {
            id: '2.2',
            name: 'Heavy',
            order: 2,
            children: []
          },
          {
            id: '2.3',
            name: 'Knives',
            order: 3,
            children: []
          },
          {
            id: '2.4',
            name: 'Pistols',
            order: 4,
            children: []
          },
          {
            id: '2.5',
            name: 'Rifles',
            order: 5,
            children: []
          },
          {
            id: '2.6',
            name: 'SMGs',
            order: 6,
            children: []
          }
        ]
      },
      {
        id: '3',
        name: 'Minecraft',
        order: 3,
        categories: 'Blocks / Items / Skins / Textures',
        childCount: 4,
        children: []
      },
      {
        id: '4',
        name: 'RUST',
        order: 3,
        categories: '',
        childCount: 0,
        children: []
      }
    ];

    // Generate additional items to demonstrate pagination
    for (let i = 5; i <= 10; i++) {
      mockItems.push({
        id: i.toString(),
        name: `Game ${i}`,
        order: i,
        categories: '',
        childCount: 0,
        children: []
      });
    }

    return {
      items: mockItems,
      total: 100 // Pretend we have 100 total items
    };
  }

  // Get current state for history
  function getCurrentState() {
    return JSON.parse(JSON.stringify(items.value));
  }

  // Restore from a history state
  function restoreFromState(state: Item[]) {
    items.value = JSON.parse(JSON.stringify(state));
  }

  return {
    items,
    rootItems,
    isLoading,
    totalItems,
    loadItems,
    reorderItems,
    getParentId,
    isChildOf,
    getCurrentState,
    restoreFromState
  };
});