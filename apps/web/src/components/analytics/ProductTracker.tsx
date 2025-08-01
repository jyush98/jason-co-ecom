// components/analytics/ProductTracker.tsx
// Component for automatic product tracking

'use client';

import { useEffect } from 'react';
import { useGA4Ecommerce } from '@/lib/hooks/useGA4';

interface ProductTrackerProps {
    product: any;
    viewType?: 'detail' | 'list_item';
    listName?: string;
    position?: number;
}

export function ProductTracker({
    product,
    viewType = 'detail',
    listName,
    position
}: ProductTrackerProps) {
    const { trackProductView } = useGA4Ecommerce();

    useEffect(() => {
        if (viewType === 'detail') {
            trackProductView(product);
        }
    }, [product, viewType, trackProductView]);

    return null; // This is a tracking component, renders nothing
}