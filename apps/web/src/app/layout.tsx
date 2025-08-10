// apps/web/src/app/layout.tsx
// I'm adding a global Suspense wrapper to catch all useSearchParams usage

import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ThemeInitializer from '@/components/ThemeInitializer';
import { PerformanceMonitoring } from '@/lib/performance/webVitals';
import { OrganizationSchema, WebsiteSchema } from '@/components/seo/SchemaMarkup';
import { createMetadata } from '@/lib/seo/metadata';
import { inter, fontVariables, FontPreloads } from '@/lib/fonts/optimizedFonts';
import { GA4Provider } from '@/components/analytics/GA4Provider';
import './globals.css';

export const metadata: Metadata = createMetadata({
  title: 'Jason & Co. | Where Ambition Meets Artistry | Luxury Custom Jewelry',
  description: 'Discover handcrafted luxury jewelry designed without limits. Custom engagement rings, bespoke necklaces, and artisanal pieces that embody where ambition meets artistry.',
  url: '/',
  image: '/images/og-home.jpg',
  keywords: [
    'luxury jewelry',
    'custom engagement rings',
    'bespoke jewelry',
    'handcrafted jewelry',
    'designer jewelry',
    'luxury necklaces',
    'wedding rings',
    'diamond jewelry',
    'Jason & Co',
    'custom jewelry design'
  ],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  colorScheme: 'light dark',
};

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// I'm creating a wrapper component for all the providers
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ThemeInitializer />
      <Toaster position="top-center" />

      {/* Global Suspense boundary to catch all useSearchParams */}
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      }>
        {/* Header */}
        <header>
          <Navbar />
        </header>

        {/* Main content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer>
          <Footer />
        </footer>
      </Suspense>
    </ThemeProvider>
  );
}

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <FontPreloads />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: var(--font-playfair), Georgia, serif;
            }
            img, video {
              height: auto;
              max-width: 100%;
            }
            .hero-section {
              min-height: 100vh;
            }
            .font-serif {
              font-family: var(--font-playfair), Georgia, serif;
            }
            .font-sans {
              font-family: var(--font-inter), system-ui, sans-serif;
            }
            @media (prefers-color-scheme: dark) {
              :root {
                color-scheme: dark;
              }
            }
          `
        }} />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href="https://jasonandco.shop" />

        <OrganizationSchema />
        <WebsiteSchema />
      </head>

      <body className={`${inter.className} antialiased min-h-screen flex flex-col text-black dark:text-white`}>
        <PerformanceMonitoring />

        <GA4Provider>
          <Providers>{children}</Providers>
        </GA4Provider>

        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function(e) {
                      console.log('SW registration failed:', e);
                    });
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (clerkPublishableKey) {
    return (
      <ClerkProvider
        publishableKey={clerkPublishableKey}
        signInFallbackRedirectUrl="/"
        signInForceRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        signUpForceRedirectUrl="/"
      >
        <RootLayoutContent>{children}</RootLayoutContent>
      </ClerkProvider>
    );
  }

  console.warn('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Running without authentication.');
  return <RootLayoutContent>{children}</RootLayoutContent>;
}