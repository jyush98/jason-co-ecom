import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Head from 'next/head';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import ThemeInitializer from '@/components/ThemeInitializer';
import { ThemeProvider } from 'next-themes';

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
      <html lang="en" suppressHydrationWarning>
        <Head>
          <title>Jason & Co.</title>
          <meta name="description" content="Jason & Co." />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="min-h-screen flex flex-col text-black dark:text-white">
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <ThemeInitializer />
            <Toaster position="top-center" />
            <header>
              <Navbar />
            </header>
            <main className="flex-grow">{children}</main>
            <footer>
              <Footer />
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
