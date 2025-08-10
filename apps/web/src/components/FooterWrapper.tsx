// apps/web/src/components/FooterWrapper.tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// I'm dynamically importing Footer to avoid SSR issues
const Footer = dynamic(() => import('./Footer'), {
    ssr: true, // Keep SSR enabled but with proper handling
    loading: () => (
        <div className="h-64 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800" />
    ),
});

export default function FooterWrapper() {
    return (
        <Suspense fallback={
            <div className="h-64 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800" />
        }>
            <Footer />
        </Suspense>
    );
}