<script setup lang="ts">
import { ref, h } from 'vue';
import Folder from './components/Folder.vue';
import SubFolder from './components/SubFolder.vue';
import Search from './components/Search.vue';
import type { FolderType } from './types/folder.type';
import { fetchAll } from './services/api.service';

const currentSelectedFolderId = ref<number | null>(null);
const currentSelectedFolderName = ref<string | null>(null);

const searchResults = ref<FolderType[] | null>(null);
const currentSearchTerm = ref<string>('');
const isSearching = ref(false);
const searchError = ref<string | null>(null);

const handleFolderSelected = (folderId: number, folderName: string) => {
    currentSelectedFolderId.value = folderId;
    currentSelectedFolderName.value = folderName;
};

// Handler untuk event dari SearchBar
const handleSearchUpdated = async (query: string) => {
    currentSearchTerm.value = query.trim();
    searchResults.value = null;
    searchError.value = null;

    if (currentSearchTerm.value.length < 2) {
        isSearching.value = false;
        // Jika query kosong, tampilkan konten folder normal
        return; 
    }

    isSearching.value = true;
    
    try {
        const results = await fetchAll(`folder/search?query=${currentSearchTerm.value}`);
        searchResults.value = results;
    } catch (e: any) {
        searchError.value = e.message;
    } finally {
        isSearching.value = false;
    }
};

// Komponen Pembantu untuk Menampilkan Hasil Pencarian di Panel Kanan
// Kita dapat menggunakan FolderContents untuk ini, tetapi kita perlu Wrapper.
const SearchResultPanel = () => {
    if (isSearching.value) {
        return h('div', { class: 'p-4 text-gray-500' }, 'Mencari...');
    }
    if (searchError.value) {
        return h('div', { class: 'p-4 text-red-500' }, `Error Pencarian: ${searchError.value}`);
    }
    if (searchResults.value === null) {
        return h('div', { class: 'p-4 text-gray-500 italic' }, 'Masukkan minimal 2 karakter untuk memulai pencarian.');
    }
    if (searchResults.value.length === 0) {
        return h('div', { class: 'p-4 text-gray-500 italic' }, `Tidak ada hasil ditemukan untuk "${currentSearchTerm.value}".`);
    }

    // Tampilkan hasil dalam format yang sama dengan FolderContents
    return h('div', { class: 'p-4' }, [
        h('h2', { class: 'text-lg font-semibold border-b pb-2 mb-4 text-gray-700' }, `Hasil Pencarian untuk: "${currentSearchTerm.value}" (${searchResults.value.length} ditemukan)`),
        h('div', { class: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4' },
            searchResults.value.map(folder => 
                h('div', { key: folder.id, class: 'flex flex-col items-center p-3 rounded-lg hover:bg-white transition-shadow cursor-pointer' }, [
                    h('span', { class: 'text-5xl mb-1' }, '📁'),
                    h('span', { class: 'text-sm text-center truncate w-full', title: folder.name }, folder.name)
                    // TODO: Tambahkan logika klik pada hasil pencarian untuk menavigasi ke folder induk (parent)
                ])
            )
        )
    ]);
};
</script>

<template>
    <div class="h-screen flex flex-col bg-gray-100">
        <header class="bg-white p-3 shadow-md">
            <h1 class="text-xl font-bold text-blue-600">Windows Explorer</h1>
        </header>
        <Search @search-updated="handleSearchUpdated" />
        <main class="flex flex-1 overflow-hidden">
            <div class="w-1/3 max-w-xs h-full border-r bg-white">
                <Folder @folder-selected="handleFolderSelected" />
            </div>

            <div class="flex-1 h-full overflow-y-auto bg-gray-50">
                <template v-if="currentSearchTerm.length >= 2">
                    <SearchResultPanel />
                </template>
                <template v-else>
                    <SubFolder :selected-folder-id="currentSelectedFolderId" :selected-folder-name="currentSelectedFolderName" />
                </template>
            </div>
        </main>
    </div>
</template>