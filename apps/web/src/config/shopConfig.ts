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

    // Categories - FIXED: Display names with URL mapping
    categories: [
        "All",
        "Necklaces",
        "Bracelets",
        "Rings",
        "Watches"
    ],

    // Category mapping for URL compatibility
    categoryMapping: {
        // Display name -> URL value
        "All": "All",
        "Necklaces": "necklaces",
        "Bracelets": "bracelets",
        "Rings": "rings",
        "Watches": "watches"
    } as const,

    // Reverse mapping for URL -> Display
    categoryDisplayMapping: {
        // URL value -> Display name
        "All": "All",
        "all": "All",
        "": "All",
        "necklaces": "Necklaces",
        "bracelets": "Bracelets",
        "rings": "Rings",
        "watches": "Watches"
    } as const,

    // Sort options with labels
    sortOptions: [
        { value: "name-asc", label: "Name A-Z" },
        { value: "name-desc", label: "Name Z-A" },
        { value: "price-asc", label: "Price Low-High" },
        { value: "price-desc", label: "Price High-Low" },
        { value: "created_at-desc", label: "Newest First" },
        { value: "created_at-asc", label: "Oldest First" }
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
export type CategoryMapping = typeof SHOP_CONFIG.categoryMapping;
export type CategoryDisplayMapping = typeof SHOP_CONFIG.categoryDisplayMapping;

// Helper functions for common operations
export const getDefaultSort = () => SHOP_CONFIG.sortOptions[0];
export const getDefaultCategory = () => SHOP_CONFIG.categories[0];

// FIXED: Category mapping helpers
export const getCategoryUrlValue = (displayCategory: string): string => {
    return SHOP_CONFIG.categoryMapping[displayCategory as keyof CategoryMapping] || displayCategory.toLowerCase();
};

export const getCategoryDisplayName = (urlCategory: string): string => {
    return SHOP_CONFIG.categoryDisplayMapping[urlCategory as keyof CategoryDisplayMapping] || urlCategory;
};

// Validation helpers
export const isValidCategory = (category: string): category is Category => {
    return SHOP_CONFIG.categories.includes(category as Category);
};

export const isValidUrlCategory = (category: string): boolean => {
    return Object.keys(SHOP_CONFIG.categoryDisplayMapping).includes(category);
};

export const isValidSortOption = (option: string): boolean => {
    return SHOP_CONFIG.sortOptions.some(opt => opt.value === option);
};

// Enhanced category helpers for proper URL handling
export const normalizeCategory = (category: string): string => {
    // Handle empty or undefined category
    if (!category || category === "" || category === "all") {
        return "All";
    }

    // If it's already a display name, return it
    if (isValidCategory(category)) {
        return category;
    }

    // If it's a URL value, convert to display name
    const displayName = getCategoryDisplayName(category);
    if (displayName !== category) {
        return displayName;
    }

    // Default fallback
    return "All";
};

// Export for easier debugging
export const DEBUG_CATEGORY_INFO = {
    categories: SHOP_CONFIG.categories,
    mapping: SHOP_CONFIG.categoryMapping,
    displayMapping: SHOP_CONFIG.categoryDisplayMapping,
    getCategoryUrlValue,
    getCategoryDisplayName,
    normalizeCategory
};