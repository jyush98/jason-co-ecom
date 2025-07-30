// api/admin/analytics/geographic/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // TODO: Add admin role verification like your revenue route
        // const user = await getUserRole(userId);
        // if (user.role !== 'admin') {
        //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get('timeRange') || '30d';

        // Calculate date range using your existing pattern
        const now = new Date();
        const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
        const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

        // Geographic data query
        const geographicQuery = `
      WITH regional_mapping AS (
        SELECT 
          CASE 
            WHEN UPPER(o.shipping_country) IN ('US', 'USA', 'UNITED STATES', 'CA', 'CANADA') THEN 'North America'
            WHEN UPPER(o.shipping_country) IN ('GB', 'UK', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE') THEN 'Europe'
            WHEN UPPER(o.shipping_country) IN ('JP', 'CN', 'KR', 'SG', 'AU', 'NZ', 'IN') THEN 'Asia Pacific'
            WHEN UPPER(o.shipping_country) IN ('MX', 'BR', 'AR', 'CL', 'CO') THEN 'Latin America'
            WHEN UPPER(o.shipping_country) IN ('AE', 'SA', 'IL', 'TR') THEN 'Middle East'
            ELSE 'Other'
          END as region,
          o.shipping_country,
          o.total_price,
          o.user_id
        FROM orders o
        WHERE o.created_at >= $1
        AND o.shipping_country IS NOT NULL
        AND o.status NOT IN ('cancelled', 'refunded')
      )
      SELECT 
        region,
        COUNT(DISTINCT user_id) as customers,
        SUM(total_price) as revenue,
        ROUND((COUNT(DISTINCT user_id)::numeric / (SELECT COUNT(DISTINCT user_id) FROM regional_mapping) * 100), 1) as percentage
      FROM regional_mapping
      WHERE region != 'Other'
      GROUP BY region
      ORDER BY revenue DESC
    `;

        const geographicResult = await pool.query(geographicQuery, [startDate]);

        const response = geographicResult.rows.map(row => ({
            region: row.region,
            customers: Number(row.customers),
            revenue: Number(row.revenue),
            percentage: Number(row.percentage)
        }));

        return NextResponse.json(response);

    } catch (error) {
        console.error('Geographic analytics error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}