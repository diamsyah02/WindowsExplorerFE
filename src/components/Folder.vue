<script setup lang="ts">
import { ref, computed, onMounted, defineEmits, h } from 'vue';
import { fetchAll } from '../services/api.service';
import type { FolderType } from '@/types/folder.type';

// Definisikan event pas folder diklik
const emit = defineEmits(['folder-selected']);

const folders = ref<FolderType[]>([]);
const selectedFolderId = ref<number | null>(null);
const selectedFolderName = ref<string | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// catat state folder yang terbuka untuk collapse
const expandedFolders = ref<Set<number>>(new Set());

// fungsi untuk membangun struktur folder tree
const folderTree = computed(() => {
    const buildTree = (parentId: number | null): (FolderType & { children?: any[] })[] => {
        return folders.value
            .filter(folder => folder.parent_id === parentId)
            .map(folder => ({
                ...folder,
                children: buildTree(folder.id),
            }));
    };

    return buildTree(null);
});

// fungsi ketika memilih folder
const selectFolder = (folder: FolderType) => {
    selectedFolderId.value = folder.id;
    selectedFolderName.value = folder.name;
    emit('folder-selected', folder.id, folder.name);
    
    if (expandedFolders.value.has(folder.id)) {
        expandedFolders.value.delete(folder.id);
    } else {
        expandedFolders.value.add(folder.id);
    }
};

onMounted(async () => {
    try {
        const data = await fetchAll(`folder/all`);
        folders.value = data;
        error.value = null;

        // Pilih folder root kalo datanya ada
        const rootFolder = data.find((f: FolderType) => f.parent_id === null);
        if (rootFolder) {
            selectFolder(rootFolder);
        }

    } catch (e: any) {
        error.value = e.message;
    } finally {
        isLoading.value = false;
    }
});

// Komponen rekursif untuk menampilkan hierarki folder
const FolderNode = ({ folder, level = 0 }: { folder: FolderType & { children?: any[] }, level?: number }) => {
    const paddingLeft = `pl-${level * 4}`;
    
    const isExpanded = expandedFolders.value.has(folder.id);
    const isSelected = selectedFolderId.value === folder.id;

    return h('div', { class: 'w-full' }, [
        h('div', {
            class: [
                'flex items-center cursor-pointer p-1 text-sm rounded transition-colors',
                paddingLeft,
                isSelected ? 'bg-blue-200 text-blue-800 font-semibold' : 'hover:bg-gray-100'
            ],
            onClick: () => selectFolder(folder)
        }, [
            folder.children && folder.children.length > 0
                ? h('span', { class: isExpanded ? 'rotate-90 transform transition-transform' : 'transition-transform' }, '▶︎')
                : h('span', { class: 'w-[1em]' }),
            
            h('span', { class: 'mx-2' }, isExpanded ? '📂' : '📁'), 
            
            h('span', folder.name)
        ]),

        isExpanded && folder.children && folder.children.length > 0 
            ? folder.children.map(child => h(FolderNode, { folder: child, level: level + 1 }))
            : null
    ]);
};
</script>

<template>
    <div class="h-full bg-white border-r border-gray-200 p-2 overflow-y-auto">
        <div v-if="isLoading" class="text-gray-500">Memuat struktur folder...</div>
        <div v-else-if="error" class="text-red-500">Error: {{ error }}</div>
        
        <div v-else class="space-y-1">
            <template v-for="folder in folderTree" :key="folder.id">
                <FolderNode :folder="folder" :level="0" />
            </template>
        </div>
    </div>
</template>