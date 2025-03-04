import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';

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