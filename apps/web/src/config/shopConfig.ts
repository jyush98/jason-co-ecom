// Centralized configuration for all shop-related settings
export const SHOP_CONFIG = {
    // Display settings
    showPrices: true, // Master toggle for price display
    resultsPerPage: 12,
    searchDebounce: 400, // ms

    // Grid & Animation settings
    animation: {
        staggerDelay: 0.1, // Delay between item animations
        itemDuration: 0.6, // Individual item animation duration
        hoverScale: 1.02,
        hoverRotation: 1, // degrees
        shadowIntensity: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    },

    // Categories - easy to modify
    categories: [
        "All",
        "Necklaces",
        "Bracelets",
        "Rings",
        "Watches"
    ],

    // Sort options with labels
    sortOptions: [
        { value: "name-asc", label: "Name A-Z" },
        { value: "name-desc", label: "Name Z-A" },
        { value: "price-asc", label: "Price Low-High" },
        { value: "price-desc", label: "Price High-Low" }
    ],

    // Grid responsive breakpoints
    grid: {
        mobile: 1, // columns
        tablet: 2,
        desktop: 3,
        gap: {
            mobile: "2rem",
            tablet: "3rem",
            desktop: "4rem"
        }
    },

    // Loading skeleton settings
    skeleton: {
        itemCount: 6,
        animationDuration: "1.5s"
    },

    // Filter UI settings
    filters: {
        mobileBreakpoint: 1024, // px - when to show mobile filter toggle
        showActiveIndicator: true,
        collapsible: true
    },

    // Brand messaging
    messaging: {
        title: "Our Collection",
        subtitle: "Designed without Limits. Each creation pushes boundaries and redefines what's achievable in luxury craftsmanship.",
        emptyState: {
            icon: "💎",
            title: "No pieces match your search",
            description: "Try adjusting your filters or browse our full collection"
        }
    },

    // Quick View settings
    quickView: {
        enabled: true,
        showPriceInModal: true,
        blurIntensity: "backdrop-blur-sm"
    }
} as const;

// Type helpers for better TypeScript support
export type ShopConfig = typeof SHOP_CONFIG;
export type SortOption = typeof SHOP_CONFIG.sortOptions[number];
export type Category = typeof SHOP_CONFIG.categories[number];

// Helper functions for common operations
export const getDefaultSort = () => SHOP_CONFIG.sortOptions[0];
export const getDefaultCategory = () => SHOP_CONFIG.categories[0];

// Validation helpers
export const isValidCategory = (category: string): category is Category => {
    return SHOP_CONFIG.categories.includes(category as Category);
};

export const isValidSortOption = (option: string): boolean => {
    return SHOP_CONFIG.sortOptions.some(opt => opt.value === option);
};