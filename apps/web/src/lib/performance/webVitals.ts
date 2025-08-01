"use client";

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB }from 'web-vitals';

export interface WebVitalMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
    navigationType: string;
}

// Performance thresholds based on Core Web Vitals
const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
}

function sendToAnalytics(metric: any) {
    const webVitalMetric: WebVitalMetric = {
        name: metric.name,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        rating: getRating(metric.name, metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType || 'navigate',
    };

    // Send to console for development
    if (process.env.NODE_ENV === 'development') {
        console.group(`🔍 Web Vital: ${webVitalMetric.name}`);
        console.log(`Value: ${webVitalMetric.value}${metric.name === 'CLS' ? '' : 'ms'}`);
        console.log(`Rating: ${webVitalMetric.rating}`);
        console.log(`Page: ${window.location.pathname}`);
        console.groupEnd();
    }

    // Send to Google Analytics (if available)
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
            value: webVitalMetric.value,
            event_category: 'Web Vitals',
            event_label: webVitalMetric.id,
            custom_map: {
                metric_rating: webVitalMetric.rating,
                page_path: window.location.pathname,
            },
            non_interaction: true,
        });
    }

    // Send to Vercel Analytics (if available) - fixed API
    if (typeof window !== 'undefined' && window.va) {
        window.va('event', {
            name: 'Web Vitals',
            data: {
                metric: metric.name,
                value: webVitalMetric.value,
                rating: webVitalMetric.rating,
                page: window.location.pathname,
            }
        });
    }

    // Custom analytics endpoint (optional)
    if (process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true') {
        fetch('/api/analytics/web-vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...webVitalMetric,
                page: window.location.pathname,
                userAgent: navigator.userAgent,
                timestamp: Date.now(),
            }),
        }).catch(() => {
            // Fail silently to not affect user experience
        });
    }
}

// Initialize Web Vitals monitoring using dynamic imports
export async function initWebVitals() {
    if (typeof window === 'undefined') return;

    try {
        // Measure all Core Web Vitals (updated function names)
        onCLS(sendToAnalytics);
        onINP(sendToAnalytics);
        onFCP(sendToAnalytics);
        onLCP(sendToAnalytics);
        onTTFB(sendToAnalytics);
    } catch (error) {
        console.warn('Web Vitals library not found. Install with: npm install web-vitals');
        console.warn('Performance monitoring will continue without Core Web Vitals tracking.');
    }
}

// Performance observer for additional metrics
export function initPerformanceObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    // Monitor long tasks (>50ms)
    if ('PerformanceObserver' in window) {
        const longTaskObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 50) {
                    console.warn(`⚠️ Long task detected: ${Math.round(entry.duration)}ms`);

                    // Send to analytics
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'long_task', {
                            event_category: 'Performance',
                            value: Math.round(entry.duration),
                            event_label: window.location.pathname,
                        });
                    }
                }
            }
        });

        try {
            longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (e) {
            // Fail silently if longtask is not supported
        }
    }
}

// Helper function to measure custom performance metrics
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
    const start = performance.now();

    const finish = () => {
        const duration = performance.now() - start;
        console.log(`⏱️ ${name}: ${Math.round(duration)}ms`);

        // Send to analytics
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'custom_timing', {
                event_category: 'Performance',
                name: name,
                value: Math.round(duration),
            });
        }
    };

    try {
        const result = fn();
        if (result instanceof Promise) {
            return result.finally(finish);
        } else {
            finish();
            return result;
        }
    } catch (error) {
        finish();
        throw error;
    }
}

// Component to add to your app layout
export function PerformanceMonitoring() {
    useEffect(() => {
        // Initialize monitoring after component mounts
        initWebVitals();
        initPerformanceObserver();
    }, []);

    return null;
}

// Type declarations for global analytics
declare global {
    interface Window {
        gtag?: (
            command: string,
            action: string,
            parameters?: Record<string, any>
        ) => void;
        va?: (
            command: 'event',
            parameters: {
                name: string;
                data?: Record<string, any>;
            }
        ) => void;
    }
}