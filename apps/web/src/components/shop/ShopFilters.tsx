"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { SHOP_CONFIG } from "@/config/shopConfig";

interface ShopFiltersProps {
    // Search state
    search: string;
    onSearchChange: (value: string) => void;

    // Category state
    category: string;
    onCategoryChange: (value: string) => void;

    // Sort state
    sortBy: string;
    sortOrder: string;
    onSortChange: (sortBy: string, sortOrder: string) => void;

    // Filter state
    showFilters: boolean;
    onToggleFilters: () => void;

    // Actions
    onClearFilters: () => void;
    hasActiveFilters: boolean;

    // Results info
    resultCount?: number;
    loading?: boolean;
}

export default function ShopFilters({
    search,
    onSearchChange,
    category,
    onCategoryChange,
    sortBy,
    sortOrder,
    onSortChange,
    showFilters,
    onToggleFilters,
    onClearFilters,
    hasActiveFilters,
    resultCount,
    loading
}: ShopFiltersProps) {

    const handleSortChange = (value: string) => {
        const [field, direction] = value.split("-");
        onSortChange(field, direction);
    };

    const currentSortValue = `${sortBy}-${sortOrder}`;

    return (
        <motion.div
            className="mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
                <button
                    onClick={onToggleFilters}
                    className="w-full flex items-center justify-center gap-3 py-3 border border-current hover:bg-current hover:text-white dark:hover:text-black transition-all duration-300"
                >
                    <Filter size={18} />
                    <span className="tracking-widest uppercase text-sm">
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </span>
                    {hasActiveFilters && (
                        <div className="w-2 h-2 bg-gold rounded-full" />
                    )}
                </button>
            </div>

            {/* Desktop Filters (always visible) & Mobile Filters (toggleable) */}
            <AnimatePresence>
                {(showFilters || window.innerWidth >= SHOP_CONFIG.filters.mobileBreakpoint) && (
                    <motion.div
                        className="space-y-6 lg:space-y-0"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Search Bar */}
                        <div className="relative pb-3">
                            <Search
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder="Search our collection..."
                                className="w-full pl-12 pr-4 py-4 bg-transparent border border-gray-300 dark:border-gray-600 text-base tracking-wide placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-300"
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                            {search && (
                                <button
                                    onClick={() => onSearchChange("")}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-current transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Category Pills & Sort Controls */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-6">
                            {/* Category Pills */}
                            <div className="flex flex-wrap gap-3">
                                {SHOP_CONFIG.categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => onCategoryChange(cat)}
                                        className={`px-4 py-2 text-sm tracking-widest uppercase transition-all duration-300 border ${category === cat
                                                ? "bg-gold text-black border-gold"
                                                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gold hover:text-gold"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Sort & Clear Controls */}
                            <div className="flex items-center gap-4">
                                {/* Sort Dropdown */}
                                <select
                                    value={currentSortValue}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 text-sm tracking-wide focus:outline-none focus:border-gold transition-colors duration-300"
                                >
                                    {SHOP_CONFIG.sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                {/* Clear Filters */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={onClearFilters}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-current transition-colors"
                                        aria-label="Clear all filters"
                                    >
                                        <X size={16} />
                                        <span>Clear</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Summary */}
            {!loading && resultCount !== undefined && (
                <motion.div
                    className="flex justify-between items-center mt-8 mb-8 text-sm text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <span>
                        {resultCount === 0
                            ? "No pieces found"
                            : `${resultCount} piece${resultCount !== 1 ? "s" : ""} found`
                        }
                    </span>
                    {hasActiveFilters && SHOP_CONFIG.filters.showActiveIndicator && (
                        <span className="text-gold">Filters applied</span>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}