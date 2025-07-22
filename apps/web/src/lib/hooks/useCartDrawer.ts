// apps/web/src/lib/hooks/useCartDrawer.ts
// Cart drawer state management hook

import { useState, useCallback } from 'react';
import type { CartItem } from '@/types/cart';

interface UseCartDrawerReturn {
    isOpen: boolean;
    lastAddedItem: CartItem | null;
    openDrawer: () => void;
    closeDrawer: () => void;
    toggleDrawer: () => void;
    setLastAddedItem: (item: CartItem | null) => void;
}

// Export the interface for external use
export type { UseCartDrawerReturn };

export function useCartDrawer(): UseCartDrawerReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

    const openDrawer = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeDrawer = useCallback(() => {
        setIsOpen(false);
        // Clear last added item when drawer closes
        setTimeout(() => {
            setLastAddedItem(null);
        }, 300); // Small delay for animation
    }, []);

    const toggleDrawer = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const handleSetLastAddedItem = useCallback((item: CartItem | null) => {
        setLastAddedItem(item);
    }, []);

    return {
        isOpen,
        lastAddedItem,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        setLastAddedItem: handleSetLastAddedItem,
    };
}

// Alternative hook for integrating with global cart store
export function useCartDrawerWithStore() {
    // This would integrate with your cartStore if you want global state
    // For now, returning the basic hook
    return useCartDrawer();
}

export default useCartDrawer;