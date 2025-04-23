import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { HistoryState } from '../types/item';
import { useListStore } from './list';

const MAX_HISTORY = 20;
const STORAGE_KEY = 'list-history';

export const useHistoryStore = defineStore('history', () => {
const listStore = useListStore();

const history = ref<HistoryState[]>([]);
const currentIndex = ref(-1);

// Computed properties
const canUndo = computed(() => currentIndex.value > 0);
const canRedo = computed(() =>
currentIndex.value < history.value.length - 1 &&
history.value.length > 0
);
const hasHistory = computed(() => history.value.length > 0);

// Initialize history from local storage
function initHistory() {
try {
const savedHistory = localStorage.getItem(STORAGE_KEY);
if (savedHistory) {
const parsed = JSON.parse(savedHistory);
history.value = parsed.history;
currentIndex.value = parsed.currentIndex;

// Restore current state
if (currentIndex.value >= 0 && history.value.length > 0) {
listStore.restoreFromState(history.value[currentIndex.value].items);
}
} else {
// If no history exists, create initial state
addToHistory();
}
} catch (error) {
console.error('Failed to load history from localStorage:', error);
// If loading fails, create initial state
addToHistory();
}
}

// Save current state to history
function addToHistory() {
// Get current state
const currentState: HistoryState = {
items: listStore.getCurrentState()
};

// If we're not at the end of history, truncate forward history
if (currentIndex.value < history.value.length - 1) {
history.value = history.value.slice(0, currentIndex.value + 1);
}

// Add new state
history.value.push(currentState);

// Limit history size
if (history.value.length > MAX_HISTORY) {
history.value = history.value.slice(history.value.length - MAX_HISTORY);
}

// Update index
currentIndex.value = history.value.length - 1;

// Save to localStorage
saveToLocalStorage();
}

// Undo to previous state
function undo() {
if (!canUndo.value) return;

currentIndex.value--;
listStore.restoreFromState(history.value[currentIndex.value].items);
saveToLocalStorage();
}

// Redo to next state
function redo() {
if (!canRedo.value) return;

currentIndex.value++;
listStore.restoreFromState(history.value[currentIndex.value].items);
saveToLocalStorage();
}

// Save history to localStorage
function saveToLocalStorage() {
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify({
history: history.value,
currentIndex: currentIndex.value
}));
} catch (error) {
console.error('Failed to save history to localStorage:', error);
}
}

// Clear history
function clearHistory() {
history.value = [];
currentIndex.value = -1;
localStorage.removeItem(STORAGE_KEY);
}

return {
history,
currentIndex,
canUndo,
canRedo,
hasHistory,
initHistory,
addToHistory,
undo,
redo,
clearHistory
};
});