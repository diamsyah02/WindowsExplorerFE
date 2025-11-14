<script setup lang="ts">
import { ref, watch } from 'vue';

// event yang akan dipanggil saat input berubah
const emit = defineEmits(['search-updated']);

const searchTerm = ref('');
let debounceTimer: number | null = null;

watch(searchTerm, (newTerm) => {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
        emit('search-updated', newTerm);
    }, 300);
});
</script>

<template>
    <div class="p-3 border-b border-gray-200 bg-white">
        <div class="relative">
            <input
                v-model="searchTerm"
                type="text"
                placeholder="Cari folder..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            
            <button 
                v-if="searchTerm"
                @click="searchTerm = ''" 
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg"
                title="Clear Search"
            >
                &times;
            </button>
        </div>
    </div>
</template>