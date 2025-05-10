<template>
    <div class="modal-backdrop" @click.self="close">
        <div class="modal">
            <template v-if="action === 'edit'">
                <h3>Edit Item</h3>
                <input v-model="editedName" placeholder="Name" />
                <input v-model="editedOrder" type="number" placeholder="Order" />
                <input v-model="editedCategories" placeholder="Categories" />
                <div class="modal-actions">
                    <button @click="saveEdit">Save</button>
                    <button @click="close">Cancel</button>
                </div>
            </template>
            <template v-else-if="action === 'remove'">
                <h3>Remove Item</h3>
                <p>Are you sure you want to remove <b>{{ item.name }}</b>?</p>
                <div class="modal-actions">
                    <button class="danger" @click="removeItem">Remove</button>
                    <button @click="close">Cancel</button>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import type { Item } from '~/types/item';

const props = defineProps<{
    item: Item;
    action: 'edit' | 'remove' | null;
}>();
const emit = defineEmits(['close', 'edit', 'remove']);

const editedName = ref(props.item.name);
const editedOrder = ref(props.item.order);
const editedCategories = ref(props.item.categories || '');

watch(() => props.item, (val) => {
    editedName.value = val.name;
    editedOrder.value = val.order;
    editedCategories.value = val.categories || '';
});

function close() {
    emit('close');
}
function saveEdit() {
    emit('edit', {
        ...props.item,
        name: editedName.value,
        order: Number(editedOrder.value),
        categories: editedCategories.value
    });
}
function removeItem() {
    emit('remove', props.item);
}
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: var(--background-light, #23272f);
    border-radius: 8px;
    padding: 32px 24px;
    min-width: 320px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    color: var(--text-primary, #fff);
}

.modal h3 {
    margin-bottom: 16px;
}

.modal input {
    width: 100%;
    margin-bottom: 12px;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #444;
    background: #181c23;
    color: #fff;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

button {
    padding: 8px 18px;
    border-radius: 4px;
    border: none;
    background: var(--primary, #7461ff);
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

button.danger {
    background: var(--error, #ef4444);
}

button:hover {
    opacity: 0.85;
}
</style>