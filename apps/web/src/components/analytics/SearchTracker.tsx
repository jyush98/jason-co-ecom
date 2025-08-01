// components/analytics/SearchTracker.tsx
// Component for search result tracking

'use client';

import { useEffect } from 'react';
import { useGA4Search } from '@/lib/hooks/useGA4';

interface SearchTrackerProps {
  query: string;
  results: any[];
  triggered?: boolean;
}

export function SearchTracker({ query, results, triggered = true }: SearchTrackerProps) {
  const { trackSearch } = useGA4Search();

  useEffect(() => {
    if (triggered && query) {
      trackSearch(query, results);
    }
  }, [query, results, triggered, trackSearch]);

  return null;
}