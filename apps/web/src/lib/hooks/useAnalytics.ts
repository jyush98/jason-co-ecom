// hooks/useAnalytics.ts
import { useState, useEffect } from 'react';

export interface AnalyticsResponse {
    revenue?: any;
    customers?: any;
    products?: any;
    geographic?: any;
}

export function useAnalytics(endpoint: string, timeRange: string = '30d', options: any = {}) {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                timeRange,
                ...options
            });

            const response = await fetch(`/api/admin/analytics/${endpoint}?${params}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch ${endpoint} analytics`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
            console.error(`Analytics error (${endpoint}):`, err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint, timeRange, JSON.stringify(options)]);

    return { data, isLoading, error, refetch: fetchData };
}

// Update CustomerAnalyticsChart to use real API
export function useCustomerAnalytics(timeRange: string = '30d') {
    return useAnalytics('customer', timeRange);
}

// Update ProductPerformanceChart to use real API
export function useProductAnalytics(timeRange: string = '30d', sortBy: string = 'revenue') {
    return useAnalytics('product', timeRange, { sortBy });
}

// Update RevenueChart to use real API (already implemented)
export function useRevenueAnalytics(timeRange: string = '30d') {
    return useAnalytics('revenue', timeRange);
}

// Geographic analytics
export function useGeographicAnalytics(timeRange: string = '30d') {
    return useAnalytics('geographic', timeRange);
}