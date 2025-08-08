// lib/middleware/monitoring.ts
// Optional enhancement for request monitoring

import { NextRequest, NextResponse } from "next/server";

export interface RequestMetrics {
    userId?: string;
    path: string;
    method: string;
    userAgent?: string;
    timestamp: string;
    duration?: number;
    status?: number;
}

/**
 * Log request metrics for monitoring
 */
export function logRequestMetrics(metrics: RequestMetrics): void {
    // In production, you might send this to an analytics service
    console.log('Request Metrics:', {
        ...metrics,
        duration: metrics.duration ? `${metrics.duration}ms` : undefined,
    });
}

// Define proper types for the handler function
type AuthFunction = () => { userId?: string | null };
type MiddlewareHandler = (auth: AuthFunction, req: NextRequest) => Promise<NextResponse> | NextResponse;

/**
 * Enhanced middleware with monitoring (optional)
 */
export function withMonitoring(handler: MiddlewareHandler): MiddlewareHandler {
    return async (auth: AuthFunction, req: NextRequest) => {
        const startTime = Date.now();

        const metrics: RequestMetrics = {
            userId: auth().userId || undefined,
            path: req.nextUrl.pathname,
            method: req.method,
            userAgent: req.headers.get('user-agent') || undefined,
            timestamp: new Date().toISOString(),
        };

        try {
            const response = await handler(auth, req);

            metrics.duration = Date.now() - startTime;
            metrics.status = response?.status || 200;

            logRequestMetrics(metrics);

            return response;
        } catch (error) {
            metrics.duration = Date.now() - startTime;
            metrics.status = 500;

            logRequestMetrics(metrics);

            throw error;
        }
    };
}

// Usage example (if you want monitoring):
// export default clerkMiddleware(withMonitoring(async (auth, req) => {
//   // Your middleware logic here
// }));