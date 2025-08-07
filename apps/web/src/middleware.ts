// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route matchers for different access levels
const isPublicRoute = createRouteMatcher([
  '/',
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
 * This runs asynchronously and doesn't block the middleware
 */
async function triggerBackgroundSync(userId: string): Promise<void> {
  try {
    // Import dynamically to avoid edge runtime issues
    const { AuthIntegration } = await import('./lib/auth/integration');

    // Trigger user sync in background
    await AuthIntegration.syncUserWithDatabase();

    console.log(`Background sync triggered for user: ${userId}`);
  } catch (error) {
    // Log error but don't throw - we don't want to block the request
    console.error('Background sync error:', error);
  }
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};