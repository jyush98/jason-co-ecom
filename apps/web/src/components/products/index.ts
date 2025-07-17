// components/product/index.ts

// Main components
export { default as ProductDetailView } from './ProductDetailView';
export { default as ProductImageGallery } from './ProductImageGallery';
export { default as ProductInfo } from './ProductInfo';
export { default as ProductOptions } from './ProductOptions';
export { default as RelatedProducts } from './RelatedProducts';
export { default as ProductReviews } from './ProductReviews';
export { default as SocialShare } from './SocialShare';

// Type exports for external use
export interface ProductImageGalleryProps {
    images: string[];
    productName: string;
    isDark?: boolean;
}

export interface ProductInfoProps {
    product: import('@/types/product').Product;
    isDark?: boolean;
}

export interface ProductOptionsProps {
    product: import('@/types/product').Product;
    isDark?: boolean;
}

export interface RelatedProductsProps {
    products: import('@/types/product').Product[];
    isLoading?: boolean;
    currentProductCategory?: string;
    isDark?: boolean;
}

export interface ProductReviewsProps {
    productId: number;
    productName: string;
    isDark?: boolean;
}

export interface SocialShareProps {
    product: import('@/types/product').Product;
    isDark?: boolean;
}