// app/admin/seo/page.tsx
import { SEODashboard } from '@/components/seo/SEODashboard';

export default function SEOAnalyticsPage() {
  return (
    <div className="container mx-auto pt-[var(--navbar-height)]">
      <SEODashboard days={30} />
    </div>
  );
}