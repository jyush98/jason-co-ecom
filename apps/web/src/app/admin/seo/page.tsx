// app/admin/seo/page.tsx
import { SEODashboard } from '@/components/seo/SEODashboard';

export default function SEOAnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <SEODashboard useMockData={false} days={30} />
    </div>
  );
}