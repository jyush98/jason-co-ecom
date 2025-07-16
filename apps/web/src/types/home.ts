// Homepage component type definitions

import { Product } from './product';

// Homepage component type definitions

export interface Collection {
    name: string;
    image: string;
    path: string;
    featured?: boolean;
}

export interface Category {
    name: string;
    image: string;
    path: string;
}

// Component Props Interfaces
export interface VideoHeroProps {
    videoSrc?: string;
    fallbackImage?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    autoplay?: boolean;
    showControls?: boolean;
}

export interface FeaturedProductsProps {
    products: Product[];
    title?: string;
    subtitle?: string;
    showPrices?: boolean;
    viewAllLink?: string;
}

export interface CollectionsShowcaseProps {
    collections?: Collection[];
    title?: string;
}

export interface CategoriesSectionProps {
    categories?: Category[];
    title?: string;
    autoplay?: boolean;
    autoplayInterval?: number;
}

// Carousel Hook Types
export interface UseInfiniteCarouselReturn {
    currentIndex: number;
    goLeft: () => void;
    goRight: () => void;
    goToSlide: (index: number) => void;
    setAutoplay: (active: boolean) => void;
}

export interface UseInfiniteCarouselOptions {
    itemCount: number;
    autoplay?: boolean;
    autoplayInterval?: number;
    onSlideChange?: (index: number) => void;
}

// Responsive Settings
export interface ResponsiveCarouselSettings {
    slidesToShow: number;
    slideWidth: number;
}

export interface ResponsiveBreakpoints {
    lg: ResponsiveCarouselSettings;
    md: ResponsiveCarouselSettings;
    sm: ResponsiveCarouselSettings;
    xs: ResponsiveCarouselSettings;
}

// Re-export Product type for convenience
export type { Product } from './product';