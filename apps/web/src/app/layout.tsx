import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { AuthButtons } from '../components/AuthButtons';

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
            <AuthButtons />
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}