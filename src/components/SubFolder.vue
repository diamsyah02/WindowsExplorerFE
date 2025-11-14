<script setup lang="ts">
import { ref, watch } from 'vue';
import { fetchChildren } from '../services/api.service';
import type { FolderType } from '@/types/folder.type';

// props id dan nama folder yang diterima dari parent
const props = defineProps<{
    selectedFolderId: number | null;
    selectedFolderName: string | null;
}>();

const childrenFolders = ref<FolderType[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Fungsi untuk ambil data subfolder
const loadChildren = async (folderId: number) => {
    if (!folderId) {
        childrenFolders.value = [];
        return;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
        const data = await fetchChildren(`folder/${folderId}/children`);
        childrenFolders.value = data;
    } catch (e: any) {
        error.value = e.message;
        childrenFolders.value = [];
    } finally {
        isLoading.value = false;
    }
};

// untuk memuat ulang data setiap kali ID folder berubah
watch(() => props.selectedFolderId, (newId) => {
    if (newId !== null) {
        loadChildren(newId);
    } else {
        childrenFolders.value = [];
    }
}, { immediate: true });
</script>

<template>
    <div class="h-full bg-gray-50 p-4 overflow-y-auto">
        <h2 class="text-lg font-semibold border-b pb-2 mb-4 text-gray-700">
            Isi Folder: {{ selectedFolderName === null ? 'Pilih Folder' : selectedFolderName }}
        </h2>

        <div v-if="isLoading" class="text-gray-500">Memuat isi folder...</div>
        <div v-else-if="error" class="text-red-500">Error: {{ error }}</div>
        <div v-else-if="childrenFolders.length === 0" class="text-gray-500 italic">
            Folder ini kosong atau tidak memiliki subfolder langsung.
        </div>
        
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div 
                v-for="folder in childrenFolders" 
                :key="folder.id" 
                class="flex flex-col items-center p-3 rounded-lg hover:bg-white transition-shadow cursor-default border border-transparent hover:border-blue-300"
            >
                <span class="text-5xl mb-1">📁</span>
                <span class="text-sm text-center truncate w-full" :title="folder.name">
                    {{ folder.name }}
                </span>
            </div>
        </div>
    </div>
</template>