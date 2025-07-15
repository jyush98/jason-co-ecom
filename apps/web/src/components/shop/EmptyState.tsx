"use client";

import { motion } from "framer-motion";
import { SHOP_CONFIG } from "@/config/shopConfig";

interface EmptyStateProps {
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    icon?: string;
    title?: string;
    description?: string;
}

export default function EmptyState({
    hasActiveFilters,
    onClearFilters,
    icon = SHOP_CONFIG.messaging.emptyState.icon,
    title = SHOP_CONFIG.messaging.emptyState.title,
    description = SHOP_CONFIG.messaging.emptyState.description
}: EmptyStateProps) {

    return (
        <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Icon */}
            <motion.div
                className="text-6xl mb-6 opacity-20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {icon}
            </motion.div>

            {/* Title */}
            <motion.h3
                className="text-xl md:text-2xl font-serif mb-4 text-gray-800 dark:text-gray-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                {title}
            </motion.h3>

            {/* Description */}
            <motion.p
                className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                {description}
            </motion.p>

            {/* Clear Filters Button (only show if filters are active) */}
            {hasActiveFilters && (
                <motion.button
                    onClick={onClearFilters}
                    className="px-6 py-3 border border-current hover:bg-current hover:text-white dark:hover:text-black transition-all duration-300 tracking-widest uppercase text-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Clear All Filters
                </motion.button>
            )}

            {/* Additional suggestions when no filters are active */}
            {!hasActiveFilters && (
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        Try browsing our categories or contact us for custom pieces
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="/custom"
                            className="px-4 py-2 bg-gold text-black hover:bg-gold/90 transition-all duration-300 tracking-widest uppercase text-sm"
                        >
                            Custom Orders
                        </a>
                        <a
                            href="/contact"
                            className="px-4 py-2 border border-current hover:bg-current hover:text-white dark:hover:text-black transition-all duration-300 tracking-widest uppercase text-sm"
                        >
                            Contact Us
                        </a>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}