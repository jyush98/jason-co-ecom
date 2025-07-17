// config/productConfig.ts

export interface ProductFeatures {
    showProductOptions: boolean;
    showRelatedProducts: boolean;
    showReviews: boolean;
    showSocialShare: boolean;
    showZoomModal: boolean;
    show360View: boolean;
}

export interface ProductAnimations {
    pageEntrance: {
        duration: number;
        staggerDelay: number;
    };
    sectionEntrance: {
        duration: number;
        staggerDelay: number;
    };
    infoSection: {
        duration: number;
        staggerDelay: number;
    };
    imageTransition: {
        duration: number;
    };
}

export interface ProductConfig {
    features: ProductFeatures;
    showOriginalPrice: boolean;
    showDefaultDetails: boolean;
    imageGallery: {
        maxZoomLevel: number;
        enableRotation: boolean;
        enableFullscreen: boolean;
        thumbnailSize: number;
        autoplayModal: boolean;
    };
    relatedProducts: {
        itemWidth: number;
        gap: number;
        showPrices: boolean;
        maxItems: number;
    };
    reviews: {
        itemsPerPage: number;
        showRatingBreakdown: boolean;
        allowImageUploads: boolean;
    };
    animations: ProductAnimations;
    breakpoints: {
        mobile: number;
        tablet: number;
        desktop: number;
    };
    productOptions: {
        enableSizeGuide: boolean;
        enableCustomEngraving: boolean;
        enableGiftPackaging: boolean;
        maxCustomMessageLength: number;
    };
    socialShare: {
        platforms: string[];
        enableWishlist: boolean;
        enableSaveForLater: boolean;
    };
    messaging: {
        backToShop: string;
        sizeGuide: string;
        customOrder: string;
        authenticity: {
            title: string;
            features: string[];
        };
        purchaseNote: string;
    };
    seo: {
        titleSuffix: string;
        defaultDescription: string;
        openGraphType: string;
    };
}

export const PRODUCT_CONFIG: ProductConfig = {
    // Feature toggles
    features: {
        showProductOptions: true,
        showRelatedProducts: true,
        showReviews: true,
        showSocialShare: true,
        showZoomModal: true,
        show360View: false, // Future feature
    },

    // Display settings
    showOriginalPrice: false,
    showDefaultDetails: true,

    // Image gallery settings
    imageGallery: {
        maxZoomLevel: 2,
        enableRotation: true,
        enableFullscreen: true,
        thumbnailSize: 80,
        autoplayModal: false,
    },

    // Related products settings
    relatedProducts: {
        itemWidth: 280,
        gap: 24,
        showPrices: true,
        maxItems: 6,
    },

    // Reviews settings
    reviews: {
        itemsPerPage: 1,
        showRatingBreakdown: false,
        allowImageUploads: false,
    },

    // Animation settings
    animations: {
        pageEntrance: {
            duration: 0.8,
            staggerDelay: 0.1,
        },
        sectionEntrance: {
            duration: 0.6,
            staggerDelay: 0.15,
        },
        infoSection: {
            duration: 0.5,
            staggerDelay: 0.1,
        },
        imageTransition: {
            duration: 0.4,
        },
    },

    // Responsive breakpoints
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280,
    },

    // Product options configuration
    productOptions: {
        enableSizeGuide: true,
        enableCustomEngraving: true,
        enableGiftPackaging: true,
        maxCustomMessageLength: 50,
    },

    // Social sharing settings
    socialShare: {
        platforms: ['twitter', 'facebook', 'linkedin', 'pinterest', 'whatsapp'],
        enableWishlist: true,
        enableSaveForLater: true,
    },

    // Brand messaging
    messaging: {
        backToShop: "Back to Collection",
        sizeGuide: "Size Guide & Measurement Tips",
        customOrder: "Create Custom Order",
        authenticity: {
            title: "Authenticity & Quality",
            features: [
                "Certificate of authenticity included",
                "GIA certified diamonds (where applicable)",
                "Hallmarked precious metals",
                "Designed without limits, crafted for eternity"
            ]
        },
        purchaseNote: "Free shipping worldwide • 30-day returns • Lifetime warranty",
    },

    // SEO settings
    seo: {
        titleSuffix: " – Jason & Co. | WHERE AMBITION MEETS ARTISTRY",
        defaultDescription: "Discover this exceptional piece from Jason & Co. - Designed without Limits.",
        openGraphType: "product",
    },
} as const;