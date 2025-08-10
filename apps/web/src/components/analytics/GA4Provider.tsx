// apps/web/src/components/analytics/GA4Provider.tsx
'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

// I'm separating the component that uses useSearchParams
function GA4Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams ? searchParams.toString() : '');
      window.gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID!, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function GA4Provider({ children }: { children: React.ReactNode }) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  if (!GA_MEASUREMENT_ID) {
    // If no GA4 ID, just render children without analytics
    return <>{children}</>;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>

      {/* I'm wrapping the analytics component in Suspense */}
      <Suspense fallback={null}>
        <GA4Analytics />
      </Suspense>

      {children}
    </>
  );
}