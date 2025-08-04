// Homepage configuration and settings
export const HOME_CONFIG = {
    // Video Hero settings
    hero: {
        autoplay: true,
        showControls: true,
        fallbackImage: "/hero-fallback.jpg",
        title: "WHERE AMBITION MEETS ARTISTRY",
        subtitle: "Designed without Limits",
        ctaText: "Explore Gallery",
        ctaLink: "/gallery"
    },

    // Featured products settings
    featuredProducts: {
        itemWidth: 400,
        gap: 32,
        showPrices: true,
        title: "SIGNATURE PIECES",
        subtitle: "Crafted for those who demand excellence",
        viewAllLink: "/shop",
        animation: {
            staggerDelay: 0.1,
            duration: 0.6
        }
    },

    // Collections settings
    collections: {
        title: "COLLECTIONS",
        animation: {
            staggerDelay: 0.2,
            duration: 0.8
        },
        cta: {
            primary: {
                text: "Explore All Collections",
                link: "/shop"
            },
            secondary: {
                text: "Custom Orders",
                link: "/custom-orders"
            }
        }
    },

    // Categories settings
    categories: {
        autoplay: true,
        autoplayInterval: 5000,
        title: "EXPLORE BY CATEGORY",
        animation: {
            staggerDelay: 0.1,
            duration: 0.6
        },
        responsive: {
            lg: { slidesToShow: 4, slideWidth: 300 },
            md: { slidesToShow: 3, slideWidth: 250 },
            sm: { slidesToShow: 2, slideWidth: 200 },
            xs: { slidesToShow: 1, slideWidth: 280 }
        }
    },

    // Global animation settings
    animations: {
        scrollReveal: {
            threshold: 0.3,
            once: true
        },
        transitions: {
            duration: 0.8,
            ease: "easeOut"
        }
    }
} as const;

// Type helpers
export type HomeConfig = typeof HOME_CONFIG;
export type ResponsiveSettings = typeof HOME_CONFIG.categories.responsive;
export type AnimationConfig = typeof HOME_CONFIG.animations;