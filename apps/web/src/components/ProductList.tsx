"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchProducts } from "../utils/api";
import { Product } from "../types/product";
import ProductGrid from "./ProductGrid";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SortAsc, X } from "lucide-react";

const categories = ["All", "Necklaces", "Bracelets", "Rings", "Watches"];

// Configuration
const CONFIG = {
    showPrices: true, // Easy toggle for price display
    resultsPerPage: 12,
    searchDebounce: 400,
};

export default function ProductList({ initialCategory }: { initialCategory?: string }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>(initialCategory || "All");
    const [loading, setLoading] = useState<boolean>(true);
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(CONFIG.resultsPerPage);
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const querySearch = searchParams?.get("search") || "";
        setSearch(querySearch);
    }, [searchParams]);

    const getProducts = useCallback(() => {
        setLoading(true);
        fetchProducts({ name: search, category, page, pageSize, sortBy, sortOrder })
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [search, category, page, pageSize, sortBy, sortOrder]);

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            getProducts();
        }, CONFIG.searchDebounce);
    }, [search, category, page, pageSize, sortBy, sortOrder, getProducts]);

    useEffect(() => {
        setCategory(initialCategory || "All");
    }, [initialCategory]);

    const handleCategoryChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value === "All") {
            params.delete("category");
        } else {
            params.set("category", value);
        }
        router.push(`/shop?${params.toString()}`);
        setCategory(value);
        setPage(1); // Reset pagination
    };

    const clearFilters = () => {
        setSearch("");
        setCategory("All");
        setSortBy("name");
        setSortOrder("asc");
        setPage(1);
        router.push("/shop");
    };

    const hasActiveFilters = search || category !== "All" || sortBy !== "name" || sortOrder !== "asc";

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse rounded-sm" />
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-1/2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    );

    if (loading && products.length === 0) {
        return (
            <div className="pt-[var(--navbar-height)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-serif tracking-wide mb-4">
                        Our Collection
                    </h1>
                    <div className="w-24 h-px bg-gold mx-auto" />
                </div>
                <LoadingSkeleton />
            </div>
        );
    }

    return (
        <div className="pt-[var(--navbar-height)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20 bg-white text-black dark:bg-black dark:text-white transition-colors duration-500">

            {/* Bold Header */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-3xl md:text-5xl font-serif tracking-wide mb-4">
                    Our Collection
                </h1>
                <div className="w-24 h-px bg-gold mx-auto mb-6" />
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base tracking-wide max-w-2xl mx-auto">
                    Designed without Limits. Each creation pushes boundaries and redefines what's achievable in luxury craftsmanship.
                </p>
            </motion.div>

            {/* Search & Filter Controls */}
            <motion.div
                className="mb-12 md:mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden mb-6">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
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

                {/* Filters Container */}
                <AnimatePresence>
                    {(showFilters || window.innerWidth >= 1024) && (
                        <motion.div
                            className="space-y-6 lg:space-y-0"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Search Bar */}
                            <div className="relative pb-3">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search our collection..."
                                    className="w-full pl-12 pr-4 py-4 bg-transparent border border-gray-300 dark:border-gray-600 text-base tracking-wide placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-300"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-current transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            {/* Category Pills & Sort */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-6">
                                {/* Category Pills */}
                                <div className="flex flex-wrap gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => handleCategoryChange(cat)}
                                            className={`px-4 py-2 text-sm tracking-widest uppercase transition-all duration-300 border ${category === cat
                                                    ? "bg-gold text-black border-gold"
                                                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gold hover:text-gold"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Sort & Clear */}
                                <div className="flex items-center gap-4">
                                    <select
                                        value={`${sortBy}-${sortOrder}`}
                                        onChange={(e) => {
                                            const [field, direction] = e.target.value.split("-");
                                            setSortBy(field);
                                            setSortOrder(direction);
                                        }}
                                        className="px-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 text-sm tracking-wide focus:outline-none focus:border-gold"
                                    >
                                        <option value="name-asc">Name A-Z</option>
                                        <option value="name-desc">Name Z-A</option>
                                        <option value="price-asc">Price Low-High</option>
                                        <option value="price-desc">Price High-Low</option>
                                    </select>

                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-current transition-colors"
                                        >
                                            <X size={16} />
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Results Info */}
            {!loading && (
                <motion.div
                    className="flex justify-between items-center mb-8 text-sm text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <span>
                        {products.length === 0 ? "No pieces found" : `${products.length} piece${products.length !== 1 ? "s" : ""} found`}
                    </span>
                    {hasActiveFilters && (
                        <span className="text-gold">Filters applied</span>
                    )}
                </motion.div>
            )}

            {/* Product Grid or Empty State */}
            {loading ? (
                <LoadingSkeleton />
            ) : products.length > 0 ? (
                <ProductGrid products={products} showPrices={CONFIG.showPrices} />
            ) : (
                <motion.div
                    className="text-center py-20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="text-6xl mb-6 opacity-20">💎</div>
                    <h3 className="text-xl font-serif mb-4">No pieces match your search</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Try adjusting your filters or browse our full collection
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 border border-current hover:bg-current hover:text-white dark:hover:text-black transition-all duration-300 tracking-widest uppercase text-sm"
                        >
                            Clear All Filters
                        </button>
                    )}
                </motion.div>
            )}

            {/* Elegant Pagination */}
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
                
                @media (min-width: 1024px) {
                    [data-filters] {
                        display: block !important;
                        opacity: 1 !important;
                        height: auto !important;
                    }
                }
            `}</style>
        </div>
    );
}