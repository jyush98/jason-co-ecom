"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AccountLayout from "@/components/account/AccountLayout";
import OrderHistory from "@/components/account/OrderHistory";

export default function OrderHistoryPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    // Redirect if not signed in
    useEffect(() => {
        if (isLoaded && !user) {
            router.push('/sign-in?redirect_url=/account/orders');
        }
    }, [isLoaded, user, router]);

    // Show loading or nothing while Clerk loads
    if (!isLoaded || !user) {
        return (
            <AccountLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
                        ))}
                    </div>
                </div>
            </AccountLayout>
        );
    }

    return (
        <AccountLayout>
            <OrderHistory
                limit={50}
                showPagination={true}
                className="max-w-none"
            />
        </AccountLayout>
    );
}