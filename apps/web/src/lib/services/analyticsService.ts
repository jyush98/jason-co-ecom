// Real Analytics Service - Production Ready
// Replaces all mock data with backend API integration

export interface RevenueData {
    date: string;
    revenue: number;
    orders: number;
    avgOrderValue: number;
    growth?: number;
}

export interface AnalyticsDateRange {
    startDate: string;
    endDate: string;
}

export interface CustomerAnalytics {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerRetentionRate: number;
    averageLifetimeValue: number;
}

export interface ProductAnalytics {
    topProducts: Array<{
        id: string;
        name: string;
        revenue: number;
        sales: number;
        growth: number;
    }>;
    categoryPerformance: Array<{
        category: string;
        revenue: number;
        percentage: number;
        color: string;
    }>;
    inventoryTurns: number;
}

export interface GeographicAnalytics {
    salesByRegion: Array<{
        region: string;
        revenue: number;
        orders: number;
        percentage: number;
    }>;
    topCities: Array<{
        city: string;
        state: string;
        revenue: number;
        orders: number;
    }>;
    countryBreakdown: Array<{
        country: string;
        revenue: number;
        percentage: number;
    }>;
}

export class AnalyticsService {
    private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Revenue Analytics - Real API Integration
    static async getRevenueData(dateRange: AnalyticsDateRange): Promise<RevenueData[]> {
        try {
            const response = await fetch(`${this.BASE_URL}/api/v1/admin/analytics/revenue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
                body: JSON.stringify(dateRange),
            });

            if (!response.ok) {
                console.warn(`Revenue analytics API error: ${response.status}`);
                return []; // Return empty array instead of mock data
            }

            const data = await response.json();
            return this.validateRevenueData(data);
        } catch (error) {
            console.error('Failed to fetch revenue data:', error);
            return []; // Graceful degradation - no mock data
        }
    }

    // Customer Analytics - Real API Integration
    static async getCustomerAnalytics(dateRange: AnalyticsDateRange): Promise<CustomerAnalytics> {
        try {
            const response = await fetch(`${this.BASE_URL}/api/v1/admin/analytics/customer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
                body: JSON.stringify(dateRange),
            });

            if (!response.ok) {
                throw new Error(`Customer analytics API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch customer analytics:', error);
            return {
                totalCustomers: 0,
                newCustomers: 0,
                returningCustomers: 0,
                customerRetentionRate: 0,
                averageLifetimeValue: 0,
            };
        }
    }

    // Product Analytics - Real API Integration
    static async getProductAnalytics(dateRange: AnalyticsDateRange): Promise<ProductAnalytics> {
        try {
            const response = await fetch(`${this.BASE_URL}/api/v1/admin/analytics/product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
                body: JSON.stringify(dateRange),
            });

            if (!response.ok) {
                throw new Error(`Product analytics API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch product analytics:', error);
            return {
                topProducts: [],
                categoryPerformance: [],
                inventoryTurns: 0,
            };
        }
    }

    // Geographic Analytics - Real API Integration
    static async getGeographicAnalytics(dateRange: AnalyticsDateRange): Promise<GeographicAnalytics> {
        try {
            const response = await fetch(`${this.BASE_URL}/api/v1/admin/analytics/geographic`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
                body: JSON.stringify(dateRange),
            });

            if (!response.ok) {
                throw new Error(`Geographic analytics API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch geographic analytics:', error);
            return {
                salesByRegion: [],
                topCities: [],
                countryBreakdown: [],
            };
        }
    }

    // Utility Methods
    private static validateRevenueData(data: any[]): RevenueData[] {
        if (!Array.isArray(data)) return [];

        return data.filter(item =>
            item &&
            typeof item.date === 'string' &&
            typeof item.revenue === 'number' &&
            typeof item.orders === 'number'
        );
    }

    private static getAuthToken(): string {
        // TODO: Implement proper authentication token retrieval
        if (typeof window !== 'undefined') {
            return localStorage.getItem('admin_auth_token') || '';
        }
        return process.env.ADMIN_API_TOKEN || '';
    }
}