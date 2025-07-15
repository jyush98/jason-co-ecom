import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SHOP_CONFIG, getDefaultCategory, getDefaultSort } from "@/config";

export interface UseShopFiltersReturn {
    // Filter state
    search: string;
    category: string;
    sortBy: string;
    sortOrder: string;
    page: number;
    showFilters: boolean;

    // Actions
    setSearch: (value: string) => void;
    setCategory: (value: string) => void;
    setSortBy: (value: string) => void;
    setSortOrder: (value: string) => void;
    setPage: (value: number) => void;
    setShowFilters: (value: boolean) => void;

    // Computed values
    hasActiveFilters: boolean;
    currentSortValue: string;

    // Handler functions
    handleSearchChange: (value: string) => void;
    handleCategoryChange: (value: string) => void;
    handleSortChange: (sortBy: string, sortOrder: string) => void;
    toggleFilters: () => void;
    clearAllFilters: () => void;

    // URL state management
    updateURLParams: () => void;
}

interface UseShopFiltersOptions {
    initialCategory?: string;
    initialSearch?: string;
}

export function useShopFilters(options: UseShopFiltersOptions = {}): UseShopFiltersReturn {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params or defaults
    const [search, setSearch] = useState(
        options.initialSearch || searchParams?.get("search") || ""
    );
    const [category, setCategory] = useState(
        options.initialCategory || searchParams?.get("category") || getDefaultCategory()
    );

    // Initialize sort from default
    const defaultSort = getDefaultSort();
    const [defaultSortBy, defaultSortOrder] = defaultSort.value.split("-");
    const [sortBy, setSortBy] = useState(defaultSortBy);
    const [sortOrder, setSortOrder] = useState(defaultSortOrder);

    // UI state
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // Computed values
    const hasActiveFilters = Boolean(
        search ||
        category !== getDefaultCategory() ||
        sortBy !== defaultSortBy ||
        sortOrder !== defaultSortOrder
    );

    const currentSortValue = `${sortBy}-${sortOrder}`;

    // URL state management
    const updateURLParams = useCallback(() => {
        const params = new URLSearchParams();

        if (search) params.set("search", search);
        if (category !== getDefaultCategory()) params.set("category", category);
        if (sortBy !== defaultSortBy || sortOrder !== defaultSortOrder) {
            params.set("sort", currentSortValue);
        }
        if (page > 1) params.set("page", page.toString());

        const queryString = params.toString();
        const newURL = queryString ? `/shop?${queryString}` : "/shop";
        router.push(newURL);
    }, [search, category, sortBy, sortOrder, page, router, currentSortValue, defaultSortBy, defaultSortOrder]);

    // Handler functions
    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        setPage(1); // Reset pagination
    }, []);

    const handleCategoryChange = useCallback((value: string) => {
        setCategory(value);
        setPage(1); // Reset pagination

        // Update URL immediately for category changes
        const params = new URLSearchParams(window.location.search);
        if (value === getDefaultCategory()) {
            params.delete("category");
        } else {
            params.set("category", value);
        }
        router.push(`/shop?${params.toString()}`);
    }, [router]);

    const handleSortChange = useCallback((newSortBy: string, newSortOrder: string) => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setPage(1); // Reset pagination
    }, []);

    const toggleFilters = useCallback(() => {
        setShowFilters(prev => !prev);
    }, []);

    const clearAllFilters = useCallback(() => {
        setSearch("");
        setCategory(getDefaultCategory());
        setSortBy(defaultSortBy);
        setSortOrder(defaultSortOrder);
        setPage(1);
        router.push("/shop");
    }, [router, defaultSortBy, defaultSortOrder]);

    return {
        // State
        search,
        category,
        sortBy,
        sortOrder,
        page,
        showFilters,

        // Setters
        setSearch,
        setCategory,
        setSortBy,
        setSortOrder,
        setPage,
        setShowFilters,

        // Computed
        hasActiveFilters,
        currentSortValue,

        // Handlers
        handleSearchChange,
        handleCategoryChange,
        handleSortChange,
        toggleFilters,
        clearAllFilters,

        // URL management
        updateURLParams,
    };
}