"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { fetchProducts } from "@/utils/api";
import { Product } from "@/types/product";
import {
    ShopFilters,
    ProductGrid,
    LoadingSkeleton,
    EmptyState
} from "@/components/shop";
import { SHOP_CONFIG, getDefaultCategory, getDefaultSort } from "@/config";

interface ProductListProps {
    initialCategory?: string;
}

export default function ProductList({ initialCategory }: ProductListProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    // State management
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>(initialCategory || getDefaultCategory());
    const [loading, setLoading] = useState<boolean>(true);
    const [showFilters, setShowFilters] = useState<boolean>(false);

    // Pagination & Sorting
    const [page, setPage] = useState(1);
    const [pageSize] = useState(SHOP_CONFIG.resultsPerPage);
    const [sortBy, setSortBy] = useState(getDefaultSort().value.split("-")[0]);
    const [sortOrder, setSortOrder] = useState(getDefaultSort().value.split("-")[1]);

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Initialize search from URL params
    useEffect(() => {
        const querySearch = searchParams?.get("search") || "";
        setSearch(querySearch);
    }, [searchParams]);

    // Initialize category from props
    useEffect(() => {
        setCategory(initialCategory || getDefaultCategory());
    }, [initialCategory]);

    // Debounced product fetching
    const getProducts = useCallback(() => {
        setLoading(true);
        fetchProducts({ name: search, category, page, pageSize, sortBy, sortOrder })
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [search, category, page, pageSize, sortBy, sortOrder]);

    // Debounced effect for API calls
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            getProducts();
        }, SHOP_CONFIG.searchDebounce);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [search, category, page, pageSize, sortBy, sortOrder, getProducts]);

    // Handler functions
    const handleCategoryChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value === getDefaultCategory()) {
            params.delete("category");
        } else {
            params.set("category", value);
        }
        router.push(`/shop?${params.toString()}`);
        setCategory(value);
        setPage(1); // Reset pagination
    };

    const handleSortChange = (newSortBy: string, newSortOrder: string) => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setPage(1); // Reset pagination
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1); // Reset pagination
    };

    const clearFilters = () => {
        setSearch("");
        setCategory(getDefaultCategory());
        const defaultSort = getDefaultSort();
        const [defaultSortBy, defaultSortOrder] = defaultSort.value.split("-");
        setSortBy(defaultSortBy);
        setSortOrder(defaultSortOrder);
        setPage(1);
        router.push("/shop");
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    // Computed values
    const hasActiveFilters = Boolean(
        search ||
        category !== getDefaultCategory() ||
        sortBy !== getDefaultSort().value.split("-")[0] ||
        sortOrder !== getDefaultSort().value.split("-")[1]
    );

    // Loading state for initial load
    if (loading && products.length === 0) {
        return (
            <div className="pt-[var(--navbar-height)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20 bg-white text-black dark:bg-black dark:text-white transition-colors duration-500">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-serif tracking-wide mb-4">
                        {SHOP_CONFIG.messaging.title}
                    </h1>
                    <div className="w-24 h-px bg-gold mx-auto" />
                </div>
                <LoadingSkeleton />
            </div>
        );
    }

    return (
        <div className="pt-[var(--navbar-height)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20 bg-white text-black dark:bg-black dark:text-white transition-colors duration-500">

            {/* Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-3xl md:text-5xl font-serif tracking-wide mb-4">
                    {SHOP_CONFIG.messaging.title}
                </h1>
                <div className="w-24 h-px bg-gold mx-auto mb-6" />
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base tracking-wide max-w-2xl mx-auto">
                    {SHOP_CONFIG.messaging.subtitle}
                </p>
            </motion.div>

            {/* Filters */}
            <ShopFilters
                search={search}
                onSearchChange={handleSearchChange}
                category={category}
                onCategoryChange={handleCategoryChange}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                showFilters={showFilters}
                onToggleFilters={toggleFilters}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                resultCount={products.length}
                loading={loading}
            />

            {/* Content */}
            {loading ? (
                <LoadingSkeleton />
            ) : products.length > 0 ? (
                <ProductGrid
                    products={products}
                    showPrices={SHOP_CONFIG.showPrices}
                />
            ) : (
                <EmptyState
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                />
            )}

            {/* Pagination */}
            {products.length > 0 && (
                <motion.div
                    className="flex justify-center items-center mt-16 md:mt-20 space-x-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <button
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        className="group flex items-center gap-2 px-6 py-3 border border-current hover:bg-current hover:text-white dark:hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={page === 1}
                    >
                        <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="tracking-widest uppercase text-sm">Previous</span>
                    </button>

                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Page</span>
                        <span className="text-lg font-serif">{page}</span>
                    </div>

                    <button
                        onClick={() => setPage((prev) => prev + 1)}
                        className="group flex items-center gap-2 px-6 py-3 border border-current hover:bg-current hover:text-white dark:hover:text-black transition-all duration-300"
                        disabled={products.length < pageSize}
                    >
                        <span className="tracking-widest uppercase text-sm">Next</span>
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </motion.div>
            )}

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
      `}</style>
        </div>
    );
}