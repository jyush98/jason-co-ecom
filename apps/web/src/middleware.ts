import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define route matchers
const isPublicRoute = createRouteMatcher([
  '/',
  '/shop(.*)',
  '/gallery(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/products(.*)',
  '/api/products(.*)',
  '/api/health',
  '/about',
  '/contact',
  '/custom-orders/inquiry' // Public inquiry form
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
  '/dashboard/admin(.*)'
]);

const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/orders(.*)',
  '/cart',
  '/checkout(.*)',
  '/api/cart(.*)',
  '/api/orders(.*)',
  '/api/user(.*)',
  '/custom-orders/manage(.*)'
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const url = req.nextUrl;
  const { userId, redirectToSignIn } = await auth();

  // Handle sign-up continuation redirect
  if (url.pathname === "/sign-up/continue") {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Require authentication for protected routes
  if (isProtectedRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Handle admin routes
  if (isAdminRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Check admin permissions (this would be expanded based on your needs)
    try {
      // For now, we'll just check if user exists and let AuthIntegration handle permissions
      // In a more advanced setup, you could check admin status here
      return NextResponse.next();
    } catch (error) {
      console.error('Admin route access check failed:', error);
      return NextResponse.redirect(new URL('/', url.origin));
    }
  }

  // Background user sync for authenticated users
  if (userId) {
    // Trigger background sync - don't await to avoid blocking the request
    triggerBackgroundSync(userId).catch(error => {
      console.error('Background sync failed:', error);
    });
  }

  return NextResponse.next();
});

/**
 * Trigger background user synchronization
 * FIXED: Proper dynamic import and error handling
 */
async function triggerBackgroundSync(userId: string): Promise<void> {
  try {
    // Check if we're in development and skip sync if needed
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH_SYNC === 'true') {
      console.log(`Skipping auth sync for user: ${userId} (development mode)`);
      return;
    }

    // FIXED: Use a more robust import strategy
    let AuthIntegration;

    try {
      // Try to import the AuthIntegration class
      const authModule = await import('./lib/auth/integration');
      AuthIntegration = authModule.AuthIntegration;

      // Verify the method exists before calling
      if (!AuthIntegration || typeof AuthIntegration.syncUserWithDatabase !== 'function') {
        console.warn('AuthIntegration.syncUserWithDatabase method not available, skipping sync');
        return;
      }
    } catch (importError) {
      console.warn('Could not import AuthIntegration, skipping sync:', importError);
      return;
    }

    // Trigger user sync in background with timeout
    const syncPromise = AuthIntegration.syncUserWithDatabase();

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Sync timeout')), 10000); // 10 second timeout
    });

    await Promise.race([syncPromise, timeoutPromise]);

    console.log(`Background sync completed for user: ${userId}`);
  } catch (error) {
    // Log error but don't throw - we don't want to block the request
    console.error('Background sync error:', error);

    // Optional: Send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // You could send this to your error tracking service
      // await errorTracker.capture(error, { userId, context: 'middleware_sync' });
    }
  }
}

/**
 * Alternative: Simple user sync without full AuthIntegration
 * Use this if AuthIntegration continues to have issues
 */
// async function simpleUserSync(userId: string): Promise<void> {
//   try {
//     // Simple API call to ensure user exists
//     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${userId}/sync`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       // Add timeout
//       signal: AbortSignal.timeout(5000)
//     });

//     if (!response.ok) {
//       throw new Error(`Sync API error: ${response.status}`);
//     }

//     console.log(`Simple sync completed for user: ${userId}`);
//   } catch (error) {
//     console.error('Simple sync failed:', error);
//   }
// }

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};