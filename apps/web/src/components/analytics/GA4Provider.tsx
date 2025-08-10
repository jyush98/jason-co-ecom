// components/analytics/GA4Provider.tsx
// Context provider for GA4 analytics

'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { ga4 } from '@/lib/analytics/ga4';
import { useGA4PageTracking } from '@/lib/hooks/useGA4';

interface GA4ContextType {
  isInitialized: boolean;
}

const GA4Context = createContext<GA4ContextType>({ isInitialized: false });

export function GA4Provider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Auto-track page views
  useGA4PageTracking();

  useEffect(() => {
    // Initialize GA4 if not already done
    if (process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID) {
      ga4.init();
      setIsInitialized(true);
    }
  }, []);

  return (
    <GA4Context.Provider value={{ isInitialized }}>
      {children}
    </GA4Context.Provider>
  );
}

export const useGA4Context = () => useContext(GA4Context);