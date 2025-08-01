// lib/seo/searchConsole.ts
// Fixed Google Search Console API integration for luxury jewelry SEO monitoring

'use client';

import React from 'react';

export interface SearchConsoleMetrics {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    query?: string;
    page?: string;
    device?: 'desktop' | 'mobile' | 'tablet';
    country?: string;
    date?: string;
    keys?: string[]; // Added missing keys property
}

export interface KeywordPerformance {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    change_in_position?: number;
    opportunity_score?: number;
}

export interface PagePerformance {
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    page_type: 'product' | 'category' | 'homepage' | 'gallery' | 'custom';
}

export interface IndexingStatus {
    url: string;
    index_status: 'indexed' | 'not_indexed' | 'crawled_not_indexed' | 'blocked';
    last_crawled?: string;
    coverage_state?: string;
    mobile_usability?: 'good' | 'poor' | 'unknown';
}

export interface CoreWebVitalsData {
    url: string;
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay  
    cls: number; // Cumulative Layout Shift
    mobile_score: 'good' | 'needs_improvement' | 'poor';
    desktop_score: 'good' | 'needs_improvement' | 'poor';
    field_data: boolean; // Whether real user data is available
}

class SearchConsoleAPI {
    private apiKey: string;
    private siteUrl: string;
    private baseUrl = 'https://www.googleapis.com/webmasters/v3';

    constructor(apiKey: string, siteUrl: string) {
        this.apiKey = apiKey;
        this.siteUrl = siteUrl;
    }

    // Get search performance data
    async getSearchPerformance(
        startDate: string,
        endDate: string,
        dimensions: string[] = ['query'],
        filters?: any[]
    ): Promise<SearchConsoleMetrics[]> {
        const requestBody = {
            startDate,
            endDate,
            dimensions,
            rowLimit: 25000,
            startRow: 0,
            ...(filters && { dimensionFilterGroups: [{ filters }] })
        };

        try {
            const response = await fetch(
                `${this.baseUrl}/sites/${encodeURIComponent(this.siteUrl)}/searchAnalytics/query?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            const data = await response.json();
            return data.rows || [];
        } catch (error) {
            console.error('Search Console API error:', error);
            return [];
        }
    }

    // Get luxury jewelry keyword performance
    async getLuxuryKeywordPerformance(days: number = 30): Promise<KeywordPerformance[]> {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Filter for jewelry-related keywords
        const jewelryFilters = [
            { dimension: 'query', operator: 'contains', expression: 'jewelry' },
            { dimension: 'query', operator: 'contains', expression: 'ring' },
            { dimension: 'query', operator: 'contains', expression: 'necklace' },
            { dimension: 'query', operator: 'contains', expression: 'earring' },
            { dimension: 'query', operator: 'contains', expression: 'bracelet' },
            { dimension: 'query', operator: 'contains', expression: 'diamond' },
            { dimension: 'query', operator: 'contains', expression: 'gold' },
            { dimension: 'query', operator: 'contains', expression: 'silver' },
            { dimension: 'query', operator: 'contains', expression: 'engagement' },
            { dimension: 'query', operator: 'contains', expression: 'wedding' },
            { dimension: 'query', operator: 'contains', expression: 'custom' },
            { dimension: 'query', operator: 'contains', expression: 'luxury' }
        ];

        const data = await this.getSearchPerformance(startDate, endDate, ['query'], jewelryFilters);

        return data.map(row => ({
            query: row.keys?.[0] || 'unknown',
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            position: row.position,
            opportunity_score: this.calculateOpportunityScore(row)
        }));
    }

    // Get page performance data
    async getPagePerformance(days: number = 30): Promise<PagePerformance[]> {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const data = await this.getSearchPerformance(startDate, endDate, ['page']);

        return data.map(row => ({
            page: row.keys?.[0] || 'unknown',
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            position: row.position,
            page_type: this.categorizePageType(row.keys?.[0] || '')
        }));
    }

    // Get mobile vs desktop performance
    async getDevicePerformance(days: number = 30): Promise<{ mobile: SearchConsoleMetrics; desktop: SearchConsoleMetrics }> {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const data = await this.getSearchPerformance(startDate, endDate, ['device']);

        const mobile = data.find(row => row.keys?.[0] === 'mobile') || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
        const desktop = data.find(row => row.keys?.[0] === 'desktop') || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

        return { mobile, desktop };
    }

    // Check indexing status (requires different API endpoint)
    async getIndexingStatus(urls: string[]): Promise<IndexingStatus[]> {
        // This would require the URL Inspection API
        // For now, return mock data structure
        return urls.map(url => ({
            url,
            index_status: 'indexed' as const,
            last_crawled: new Date().toISOString(),
            coverage_state: 'Valid',
            mobile_usability: 'good' as const
        }));
    }

    // Calculate opportunity score for keywords
    private calculateOpportunityScore(row: SearchConsoleMetrics): number {
        const { impressions, clicks, ctr, position } = row;

        // High impressions + low CTR + poor position = high opportunity
        const impressionScore = Math.min(impressions / 1000, 10); // Max 10 points for impressions
        const positionPenalty = Math.max(0, position - 10) * 0.5; // Penalty for positions beyond 10
        const ctrBonus = ctr > 0.05 ? 5 : 0; // Bonus for good CTR

        return Math.max(0, impressionScore - positionPenalty + ctrBonus);
    }

    // Categorize page types for analysis
    private categorizePageType(url: string): PagePerformance['page_type'] {
        if (url.includes('/product/')) return 'product';
        if (url.includes('/shop') || url.includes('/category')) return 'category';
        if (url.includes('/gallery')) return 'gallery';
        if (url.includes('/custom')) return 'custom';
        if (url === '/' || url.includes('home')) return 'homepage';
        return 'product'; // Default assumption for jewelry site
    }
}

// SEO Monitoring Dashboard Data Provider
export class SEOMonitor {
    private searchConsole: SearchConsoleAPI;
    private siteUrl: string;

    constructor(apiKey: string, siteUrl: string) {
        this.searchConsole = new SearchConsoleAPI(apiKey, siteUrl);
        this.siteUrl = siteUrl;
    }

    // Get comprehensive SEO dashboard data
    async getDashboardData(days: number = 30) {
        try {
            const [
                keywordPerformance,
                pagePerformance,
                devicePerformance,
                trendData
            ] = await Promise.all([
                this.searchConsole.getLuxuryKeywordPerformance(days),
                this.searchConsole.getPagePerformance(days),
                this.searchConsole.getDevicePerformance(days),
                this.getTrendData(days)
            ]);

            return {
                summary: this.calculateSummaryMetrics(keywordPerformance, pagePerformance, devicePerformance),
                keywords: keywordPerformance.slice(0, 50), // Top 50 keywords
                pages: pagePerformance.slice(0, 25), // Top 25 pages
                devices: devicePerformance,
                trends: trendData,
                opportunities: this.identifyOpportunities(keywordPerformance, pagePerformance),
                recommendations: this.generateRecommendations(keywordPerformance, pagePerformance)
            };
        } catch (error) {
            console.error('SEO Dashboard error:', error);
            return null;
        }
    }

    // Get trend data for charts
    private async getTrendData(days: number) {
        const promises = [];
        const today = new Date();

        // Get data for each of the last N days
        for (let i = 0; i < Math.min(days, 90); i++) { // Max 90 days for daily data
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];

            promises.push(
                this.searchConsole.getSearchPerformance(dateStr, dateStr, [])
                    .then(data => ({
                        date: dateStr,
                        metrics: data[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 }
                    }))
            );
        }

        const results = await Promise.all(promises);
        return results.reverse(); // Chronological order
    }

    // Calculate summary metrics
    private calculateSummaryMetrics(
        keywords: KeywordPerformance[],
        pages: PagePerformance[],
        devices: { mobile: SearchConsoleMetrics; desktop: SearchConsoleMetrics }
    ) {
        const totalClicks = keywords.reduce((sum, k) => sum + k.clicks, 0);
        const totalImpressions = keywords.reduce((sum, k) => sum + k.impressions, 0);
        const avgPosition = keywords.length > 0
            ? keywords.reduce((sum, k) => sum + k.position, 0) / keywords.length
            : 0;
        const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        // Safe division for mobile percentage
        const totalDeviceClicks = devices.mobile.clicks + devices.desktop.clicks;
        const mobilePercentage = totalDeviceClicks > 0 ? (devices.mobile.clicks / totalDeviceClicks) * 100 : 0;

        return {
            total_clicks: totalClicks,
            total_impressions: totalImpressions,
            average_ctr: avgCtr,
            average_position: avgPosition,
            top_10_keywords: keywords.filter(k => k.position <= 10).length,
            mobile_clicks_percentage: mobilePercentage,
            opportunity_keywords: keywords.filter(k => (k.opportunity_score || 0) > 5).length
        };
    }

    // Identify SEO opportunities
    private identifyOpportunities(keywords: KeywordPerformance[], pages: PagePerformance[]) {
        return {
            high_impression_low_ctr: keywords.filter(k => k.impressions > 100 && k.ctr < 0.02),
            positions_11_20: keywords.filter(k => k.position >= 11 && k.position <= 20),
            high_opportunity_score: keywords.filter(k => (k.opportunity_score || 0) > 7),
            underperforming_pages: pages.filter(p => p.impressions > 50 && p.ctr < 0.015),
            mobile_vs_desktop_gaps: pages.filter(p => p.page_type === 'product' && p.ctr < 0.02)
        };
    }

    // Generate actionable recommendations
    private generateRecommendations(keywords: KeywordPerformance[], pages: PagePerformance[]) {
        const recommendations = [];

        // CTR optimization opportunities
        const lowCtrKeywords = keywords.filter(k => k.impressions > 100 && k.ctr < 0.02);
        if (lowCtrKeywords.length > 0) {
            recommendations.push({
                type: 'ctr_optimization',
                priority: 'high' as const,
                title: 'Optimize Title Tags and Meta Descriptions',
                description: `${lowCtrKeywords.length} keywords have high impressions but low CTR. Improve titles and descriptions.`,
                keywords: lowCtrKeywords.slice(0, 10)
            });
        }

        // Position improvement opportunities
        const nearTopKeywords = keywords.filter(k => k.position >= 11 && k.position <= 20 && k.impressions > 50);
        if (nearTopKeywords.length > 0) {
            recommendations.push({
                type: 'position_improvement',
                priority: 'high' as const,
                title: 'Push Keywords from Page 2 to Page 1',
                description: `${nearTopKeywords.length} keywords are close to first page. Focus on content optimization.`,
                keywords: nearTopKeywords.slice(0, 10)
            });
        }

        // Content opportunities
        const jewelryTerms = keywords.filter(k =>
            k.query.includes('luxury') || k.query.includes('custom') || k.query.includes('handmade')
        );
        if (jewelryTerms.length > 0) {
            recommendations.push({
                type: 'content_expansion',
                priority: 'medium' as const,
                title: 'Expand Luxury Jewelry Content',
                description: 'Create more content around luxury and custom jewelry terms.',
                keywords: jewelryTerms.slice(0, 5)
            });
        }

        return recommendations;
    }
}

// React hook for Search Console data
export function useSearchConsoleData(days: number = 30) {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                const apiKey = process.env.NEXT_PUBLIC_SEARCH_CONSOLE_API_KEY;
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

                if (!apiKey || !siteUrl) {
                    throw new Error('Search Console API key or site URL not configured');
                }

                const monitor = new SEOMonitor(apiKey, siteUrl);
                const dashboardData = await monitor.getDashboardData(days);

                setData(dashboardData);
                setError(null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [days]);

    return { data, loading, error };
}

// Mock data provider for development/testing
export function getMockSearchConsoleData() {
    return {
        summary: {
            total_clicks: 2847,
            total_impressions: 45230,
            average_ctr: 6.3,
            average_position: 8.2,
            top_10_keywords: 34,
            mobile_clicks_percentage: 68.4,
            opportunity_keywords: 12
        },
        keywords: [
            { query: 'luxury engagement rings', clicks: 145, impressions: 2340, ctr: 6.2, position: 4.1, opportunity_score: 8.5 },
            { query: 'custom wedding bands', clicks: 98, impressions: 1876, ctr: 5.2, position: 6.8, opportunity_score: 7.2 },
            { query: 'handmade jewelry design', clicks: 76, impressions: 1432, ctr: 5.3, position: 7.9, opportunity_score: 6.8 },
            { query: 'diamond necklace luxury', clicks: 54, impressions: 987, ctr: 5.5, position: 9.2, opportunity_score: 5.9 },
            { query: 'gold earrings custom', clicks: 43, impressions: 823, ctr: 5.2, position: 11.4, opportunity_score: 7.8 }
        ],
        pages: [
            { page: '/', clicks: 423, impressions: 5670, ctr: 7.5, position: 5.2, page_type: 'homepage' as const },
            { page: '/shop', clicks: 287, impressions: 4230, ctr: 6.8, position: 6.1, page_type: 'category' as const },
            { page: '/product/engagement-ring-1', clicks: 156, impressions: 2340, ctr: 6.7, position: 4.8, page_type: 'product' as const },
            { page: '/gallery', clicks: 98, impressions: 1876, ctr: 5.2, position: 8.1, page_type: 'gallery' as const },
            { page: '/custom-orders', clicks: 76, impressions: 1123, ctr: 6.8, position: 7.3, page_type: 'custom' as const }
        ],
        devices: {
            mobile: { clicks: 1946, impressions: 30956, ctr: 6.3, position: 8.7 },
            desktop: { clicks: 901, impressions: 14274, ctr: 6.3, position: 7.4 }
        },
        opportunities: {
            high_impression_low_ctr: [
                { query: 'jewelry store near me', clicks: 23, impressions: 1234, ctr: 1.9, position: 12.3, opportunity_score: 8.5 },
                { query: 'buy engagement ring online', clicks: 18, impressions: 987, ctr: 1.8, position: 15.1, opportunity_score: 7.8 }
            ],
            positions_11_20: [
                { query: 'custom jewelry designer', clicks: 34, impressions: 567, ctr: 6.0, position: 13.2, opportunity_score: 6.5 },
                { query: 'luxury jewelry brand', clicks: 28, impressions: 432, ctr: 6.5, position: 14.8, opportunity_score: 6.2 }
            ]
        },
        recommendations: [
            {
                type: 'ctr_optimization',
                priority: 'high' as const,
                title: 'Optimize Title Tags and Meta Descriptions',
                description: '8 keywords have high impressions but low CTR. Improve titles and descriptions.',
                keywords: []
            }
        ]
    };
}