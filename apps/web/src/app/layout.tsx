import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ThemeInitializer from '@/components/ThemeInitializer';
import { PerformanceMonitoring } from '@/lib/performance/webVitals';
import { OrganizationSchema, WebsiteSchema } from '@/components/seo/SchemaMarkup';
import { createMetadata } from '@/lib/seo/metadata';
import { inter, playfair, fontVariables, FontPreloads } from '@/lib/fonts/optimizedFonts';
import './globals.css';

// Enhanced metadata for SEO
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

// Viewport optimization for mobile performance
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/"
      signInForceRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      signUpForceRedirectUrl="/"
    >
      <html lang="en" className={fontVariables} suppressHydrationWarning>
        <head>
          {/* CRITICAL PERFORMANCE OPTIMIZATIONS */}

          {/* Font preloading - FIXES 830ms delay */}
          <FontPreloads />

          {/* DNS prefetch for performance */}
          <link rel="dns-prefetch" href="//fonts.googleapis.com" />
          <link rel="dns-prefetch" href="//fonts.gstatic.com" />

          {/* Critical CSS to prevent layout shift */}
          <style dangerouslySetInnerHTML={{
            __html: `
              /* Font fallback to prevent layout shift */
              body {
                font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
              }
              
              h1, h2, h3, h4, h5, h6 {
                font-family: var(--font-playfair), Georgia, serif;
              }
              
              /* Prevent cumulative layout shift */
              img, video {
                height: auto;
                max-width: 100%;
              }
              
              /* Critical above-fold styles */
              .hero-section {
                min-height: 100vh;
              }
              
              /* Font display optimization */
              .font-serif {
                font-family: var(--font-playfair), Georgia, serif;
              }
              
              .font-sans {
                font-family: var(--font-inter), system-ui, sans-serif;
              }
              
              /* Dark mode optimizations */
              @media (prefers-color-scheme: dark) {
                :root {
                  color-scheme: dark;
                }
              }
            `
          }} />

          {/* Favicon and icons */}
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />

          {/* SEO enhancements */}
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow" />
          <link rel="canonical" href="https://jasonandco.shop" />

          {/* Performance monitoring and analytics */}
          {process.env.NODE_ENV === 'production' && (
            <>
              {/* Google Analytics 4 */}
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                      page_title: document.title,
                      page_location: window.location.href,
                      send_page_view: false,
                      anonymize_ip: true,
                      cookie_flags: 'secure;samesite=strict'
                    });
                  `,
                }}
              />
            </>
          )}

          {/* Structured Data for SEO */}
          <OrganizationSchema />
          <WebsiteSchema />
        </head>

        <body className={`${inter.className} antialiased min-h-screen flex flex-col text-black dark:text-white`}>
          {/* Performance monitoring */}
          <PerformanceMonitoring />

          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <ThemeInitializer />

            {/* Toast notifications */}
            <Toaster position="top-center" />

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
          </ThemeProvider>

          {/* Service Worker for PWA (production only) */}
          {process.env.NODE_ENV === 'production' && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js')
                        .then(function(registration) {
                          console.log('SW registered: ', registration);
                        })
                        .catch(function(registrationError) {
                          console.log('SW registration failed: ', registrationError);
                        });
                    });
                  }
                `,
              }}
            />
          )}

          {/* Non-critical third-party scripts */}
          <script
            defer
            dangerouslySetInnerHTML={{
              __html: `
                window.addEventListener('load', function() {
                  // Load customer support widgets here
                  // Load social media pixels here
                  // Load other non-critical analytics here
                });
              `,
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}