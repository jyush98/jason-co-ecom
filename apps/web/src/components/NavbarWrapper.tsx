// apps/web/src/components/NavbarWrapper.tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// I'm dynamically importing NavbarClient to avoid SSR issues
const NavbarClient = dynamic(() => import('./NavbarClient'), {
    ssr: true, // Keep SSR enabled but with proper handling
    loading: () => (
        <div className="h-[90px] bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800" />
    ),
});

export default function NavbarWrapper() {
    return (
        <Suspense fallback={
            <div className="h-[90px] bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800" />
        }>
            <NavbarClient />
        </Suspense>
    );
}