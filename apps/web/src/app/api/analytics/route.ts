// app/api/analytics/web-vitals/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Log web vitals data
        console.log('Web Vitals:', {
            timestamp: new Date().toISOString(),
            url: body.url || request.headers.get('referer'),
            metrics: body
        });

        // In production, you might want to:
        // 1. Store in database
        // 2. Send to analytics service (Google Analytics, DataDog, etc.)
        // 3. Send to monitoring service

        // Example: Store critical metrics
        if (body.name && ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'].includes(body.name)) {
            // Store in your analytics system
            // await storeWebVital({
            //   name: body.name,
            //   value: body.value,
            //   rating: body.rating,
            //   url: body.url,
            //   timestamp: Date.now()
            // });
        }

        return NextResponse.json({
            success: true,
            message: 'Web vitals recorded'
        }, {
            status: 200
        });

    } catch (error) {
        console.error('Error processing web vitals:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to process web vitals'
        }, {
            status: 500
        });
    }
}

// Handle GET requests (optional)
export async function GET() {
    return NextResponse.json({
        message: 'Web vitals endpoint is active',
        timestamp: new Date().toISOString()
    });
}