const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchAll(url: string) {
    const response = await fetch(`${API_BASE_URL}/${url}`);
    if (!response.ok) {
        throw new Error('Gagal memuat struktur folder.');
    }
    const result = await response.json();
    return result.data;
}

export async function fetchChildren(url: string) {
    const response = await fetch(`${API_BASE_URL}/${url}`);
    if (!response.ok) {
        throw new Error('Gagal memuat isi folder.');
    }
    const result = await response.json();
    return result.data;
}