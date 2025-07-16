// Homepage data and content

import { Collection, Category } from '@/types/home';

export const defaultCollections: Collection[] = [
    {
        name: "Necklaces",
        image: "/images/collection1.png",
        path: "/shop?category=necklaces",
        featured: true
    },
    {
        name: "Bracelets",
        image: "/images/collection3.png",
        path: "/shop?category=bracelets"
    },
    {
        name: "Rings",
        image: "/images/collection3.png",
        path: "/shop?category=rings"
    },
    {
        name: "Watches",
        image: "/images/collection3.png",
        path: "/shop?category=watches"
    }
];

export const defaultCategories: Category[] = [
    {
        name: "Necklaces",
        image: "/images/collection1.png",
        path: "/shop?category=necklaces"
    },
    {
        name: "Bracelets",
        image: "/images/collection3.png",
        path: "/shop?category=bracelets"
    },
    {
        name: "Rings",
        image: "/images/collection3.png",
        path: "/shop?category=rings"
    },
    {
        name: "Earrings",
        image: "/images/collection1.png",
        path: "/shop?category=earrings"
    },
    {
        name: "Watches",
        image: "/images/collection1.png",
        path: "/shop?category=watches"
    },
    {
        name: "Grillz",
        image: "/images/collection3.png",
        path: "/shop?category=grillz"
    }
];

// Hero video configuration
export const heroVideoConfig = {
    src: "/hero-video.mp4",
    fallback: "/patek.jpg",
    format: "video/mp4",
    autoplay: true,
    loop: true,
    muted: true // Will be controlled by user toggle
};

// Homepage messaging
export const homepageMessaging = {
    hero: {
        primary: "WHERE AMBITION MEETS ARTISTRY",
        secondary: "Designed without Limits"
    },
    featured: {
        title: "SIGNATURE PIECES",
        subtitle: "Crafted for those who demand excellence"
    },
    collections: {
        title: "COLLECTIONS"
    },
    categories: {
        title: "EXPLORE BY CATEGORY"
    }
};