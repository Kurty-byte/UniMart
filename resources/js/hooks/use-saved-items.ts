import { useCallback, useEffect, useState } from 'react';

export interface SavedCatalogItem {
    id: number;
    title: string;
    price: string;
    condition: string;
    quantity: number;
    image_url: string | null;
    category: { id: number; name: string } | null;
    savedAt: string;
}

const STORAGE_KEY = 'unimart_saved_items_v1';

function readStoredItems(): SavedCatalogItem[] {
    if (typeof window === 'undefined') {
        return [];
    }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function useSavedItems() {
    const [savedItems, setSavedItems] = useState<SavedCatalogItem[]>(() => readStoredItems());

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                setSavedItems(readStoredItems());
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const persist = useCallback((next: SavedCatalogItem[]) => {
        setSavedItems(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
            // ignore storage quota errors
        }
    }, []);

    const isSaved = useCallback(
        (itemId: number) => savedItems.some((item) => item.id === itemId),
        [savedItems],
    );

    const toggleSave = useCallback(
        (item: Omit<SavedCatalogItem, 'savedAt'>) => {
            const exists = savedItems.some((i) => i.id === item.id);
            if (exists) {
                persist(savedItems.filter((i) => i.id !== item.id));
                return false;
            }
            persist([
                { ...item, savedAt: new Date().toISOString() },
                ...savedItems,
            ]);
            return true;
        },
        [savedItems, persist],
    );

    const removeSaved = useCallback(
        (itemId: number) => {
            persist(savedItems.filter((i) => i.id !== itemId));
        },
        [savedItems, persist],
    );

    const clearSaved = useCallback(() => {
        persist([]);
    }, [persist]);

    return {
        savedItems,
        isSaved,
        toggleSave,
        removeSaved,
        clearSaved,
    };
}
