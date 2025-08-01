import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import React from 'react';

// Primary font: Inter for body text and UI
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // CRITICAL: Prevents invisible text during font load
  preload: true,   // CRITICAL: Loads font early for better performance
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif'
  ],
  variable: '--font-inter',
  adjustFontFallback: true,
});

// Luxury display font: Playfair Display for headlines
export const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: [
    'Georgia',
    'Times New Roman',
    'serif'
  ],
  variable: '--font-playfair',
  adjustFontFallback: true,
  weight: ['400', '500', '600', '700'],
});

// Elegant serif: Cormorant Garamond for luxury copy
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Only preload if used above fold
  fallback: [
    'Garamond',
    'Georgia',
    'serif'
  ],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600'],
  adjustFontFallback: true,
});

// Font CSS variables for Tailwind
export const fontVariables = `
  ${inter.variable} 
  ${playfair.variable} 
  ${cormorant.variable}
`;

// CSS for font-display optimization
export const fontDisplayCSS = `
  @font-face {
    font-family: 'Inter';
    font-display: swap;
  }
  
  @font-face {
    font-family: 'Playfair Display';
    font-display: swap;
  }
  
  @font-face {
    font-family: 'Cormorant Garamond';
    font-display: swap;
  }
`;

// Critical font preload component for layout.tsx
export function FontPreloads() {
  return (
    <>
      {/* Preconnect to Google Fonts - CRITICAL for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />

      {/* Preload Inter font - critical for above-the-fold content */}
      <link
        rel="preload"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        as="style"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      />

      {/* Preload Playfair Display - for headlines and luxury text */}
      <link
        rel="preload"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap"
        as="style"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap"
      />
    </>
  );
}

// Font loading detection hook
export function useFontLoading() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'fonts' in document) {
      // Check if fonts are loaded
      Promise.all([
        document.fonts.load('400 1em Inter'),
        document.fonts.load('600 1em Inter'),
        document.fonts.load('400 1em "Playfair Display"'),
        document.fonts.load('600 1em "Playfair Display"'),
      ])
        .then(() => {
          setFontsLoaded(true);
        })
        .catch(() => {
          // Fallback - assume fonts loaded after timeout
          setTimeout(() => setFontsLoaded(true), 3000);
        });
    } else {
      // Fallback for browsers without font loading API
      setTimeout(() => setFontsLoaded(true), 1000);
    }
  }, []);

  return fontsLoaded;
}

// Tailwind configuration for fonts
export const tailwindFontConfig = {
  fontFamily: {
    'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
    'serif': ['var(--font-playfair)', 'Georgia', 'serif'],
    'luxury': ['var(--font-cormorant)', 'Garamond', 'serif'],
    'display': ['var(--font-playfair)', 'Georgia', 'serif'],
  },
  fontDisplay: ['swap'],
};

// Component to prevent layout shift during font loading
interface FontOptimizedTextProps {
  children: React.ReactNode;
  className?: string;
  fallbackFont?: string;
  [key: string]: any;
}

export function FontOptimizedText({
  children,
  className = '',
  fallbackFont = 'sans-serif',
  ...props
}: FontOptimizedTextProps) {
  const fontsLoaded = useFontLoading();

  return (
    <span className={className}
      style={{
        fontFamily: fontsLoaded ? undefined : fallbackFont,
      }}
      {...props}
    >
      {children}
    </span>
  );
}