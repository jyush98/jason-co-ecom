"use client";

import { motion } from "framer-motion";
import { SHOP_CONFIG } from "@/config/shopConfig";

interface LoadingSkeletonProps {
    count?: number;
    showPrices?: boolean;
}

export default function LoadingSkeleton({
    count = SHOP_CONFIG.skeleton.itemCount,
    showPrices = SHOP_CONFIG.showPrices
}: LoadingSkeletonProps) {

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut",
            },
        },
    };

    return (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="space-y-4"
                    variants={itemVariants}
                >
                    {/* Image Skeleton */}
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer"
                            style={{
                                animation: `shimmer ${SHOP_CONFIG.skeleton.animationDuration} infinite linear`,
                                transform: "translateX(-100%)",
                            }}
                        />
                    </div>

                    {/* Content Skeleton */}
                    <div className="space-y-3 p-2">
                        {/* Product Name */}
                        <div className="space-y-2">
                            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse rounded w-4/5" />
                            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse rounded w-1/3" />
                        </div>

                        {/* Price Skeleton (if prices are shown) */}
                        {showPrices && (
                            <div className="flex items-center justify-between">
                                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse rounded w-1/4" />
                                <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse rounded-full" />
                            </div>
                        )}

                        {/* Quick View Button Skeleton */}
                        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse rounded" />
                    </div>
                </motion.div>
            ))}

            <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer ${SHOP_CONFIG.skeleton.animationDuration} infinite linear;
        }
      `}</style>
        </motion.div>
    );
}