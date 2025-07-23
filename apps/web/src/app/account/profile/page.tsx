// app/account/profile/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AccountLayout from "@/components/account/AccountLayout";
import ProfileSettings from "@/components/account/ProfileSettings";

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    // Redirect if not signed in
    useEffect(() => {
        if (isLoaded && !user) {
            router.push('/sign-in?redirect_url=/account/profile');
        }
    }, [isLoaded, user, router]);

    // Show loading while Clerk loads
    if (!isLoaded) {
        return (
            <AccountLayout>
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </AccountLayout>
        );
    }

    // Redirect if no user
    if (!user) {
        return null;
    }

    return (
        <AccountLayout>
            <ProfileSettings />
        </AccountLayout>
    );
}