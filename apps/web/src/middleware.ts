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
    // TODO: Re-implement background sync without import conflicts
    // The dynamic import was causing server/client boundary issues
    console.log(`User ${userId} authenticated - sync disabled temporarily`);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};