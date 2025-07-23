// app/account/wishlist/page.tsx - Wishlist Page Route
"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import WishlistPage from "@/components/wishlist/WishlistPage";

export default function WishlistPageRoute() {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    // Redirect to sign-in if not authenticated
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in?redirect_url=/account/wishlist');
        }
    }, [isLoaded, isSignedIn, router]);

    // Show loading while auth is being checked
    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    // Don't render anything if not signed in (will redirect)
    if (!isSignedIn) {
        return null;
    }

    return <WishlistPage />;
}