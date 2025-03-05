import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Head from 'next/head';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/" signInForceRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/" signUpForceRedirectUrl="/dashboard">
      <html lang="en">
        <Head>
          <title>Jason & Co.</title>
          <meta name="description" content="Jason & Co. - Custom Jewelry" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet"/>

        </Head>
        <body>
          <header>
            <Navbar />
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}