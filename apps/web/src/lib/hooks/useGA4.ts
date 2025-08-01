// hooks/useGA4.ts
// React hooks for Google Analytics 4 integration

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ga4, GA4Product, GA4CustomDimensions, createProductFromData, determinePriceTier, getJewelryType } from '@/lib/analytics/ga4';

// Page tracking hook - automatically tracks page views
export function useGA4PageTracking() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!pathname) return;

        const url = window.location.href;
        const title = document.title;

        // Determine custom dimensions based on page
        const customDimensions: Partial<GA4CustomDimensions> = {};

        if (pathname.includes('/shop')) {
            customDimensions.jewelry_type = 'shop_browse';
        } else if (pathname.includes('/product/')) {
            customDimensions.jewelry_type = 'product_detail';
        } else if (pathname.includes('/gallery')) {
            customDimensions.jewelry_type = 'gallery_view';
        } else if (pathname.includes('/custom-orders')) {
            customDimensions.jewelry_type = 'custom_inquiry';
        }

        ga4.pageView(url, title, customDimensions);
    }, [pathname, searchParams]);
}

// E-commerce tracking hook
export function useGA4Ecommerce() {
    const trackProductView = useCallback((product: any) => {
        const ga4Product = createProductFromData(product);
        const customDimensions: Partial<GA4CustomDimensions> = {
            jewelry_type: getJewelryType(product.category),
            metal_type: product.metal?.toLowerCase() || 'unknown',
            collection: product.collection || 'main',
            price_tier: determinePriceTier(product.price)
        };

        ga4.viewItem(ga4Product, customDimensions);
    }, []);

    const trackAddToCart = useCallback((product: any, quantity: number = 1) => {
        const ga4Product = { ...createProductFromData(product), quantity };
        const customDimensions: Partial<GA4CustomDimensions> = {
            jewelry_type: getJewelryType(product.category),
            metal_type: product.metal?.toLowerCase() || 'unknown',
            price_tier: determinePriceTier(product.price)
        };

        ga4.addToCart(ga4Product, customDimensions);
    }, []);

    const trackRemoveFromCart = useCallback((product: any, quantity: number = 1) => {
        const ga4Product = { ...createProductFromData(product), quantity };
        ga4.removeFromCart(ga4Product);
    }, []);

    const trackPurchase = useCallback((orderData: {
        id: string;
        items: any[];
        total: number;
        currency?: string;
        coupon?: string;
        shipping?: number;
        tax?: number;
    }) => {
        const ga4Products = orderData.items.map(item => createProductFromData(item));

        ga4.purchase(
            orderData.id,
            ga4Products,
            orderData.total,
            orderData.currency || 'USD',
            {
                shipping: orderData.shipping,
                tax: orderData.tax,
                coupon: orderData.coupon
            }
        );
    }, []);

    const trackBeginCheckout = useCallback((cartItems: any[], total: number) => {
        const ga4Products = cartItems.map(item => createProductFromData(item));
        ga4.beginCheckout(ga4Products, total);
    }, []);

    return {
        trackProductView,
        trackAddToCart,
        trackRemoveFromCart,
        trackPurchase,
        trackBeginCheckout
    };
}

// Search tracking hook
export function useGA4Search() {
    const trackSearch = useCallback((query: string, results?: any[]) => {
        ga4.search(query, results?.length);
    }, []);

    const trackSearchResultClick = useCallback((product: any, position: number) => {
        // Track when users click on search results
        const ga4Product = { ...createProductFromData(product), index: position };
        ga4.viewItem(ga4Product, {
            jewelry_type: getJewelryType(product.category),
            collection: 'search_results'
        });
    }, []);

    return {
        trackSearch,
        trackSearchResultClick
    };
}

// Custom events hook for luxury jewelry specific tracking
export function useGA4LuxuryEvents() {
    const trackCustomOrderInquiry = useCallback((formData: {
        orderType: string;
        estimatedValue?: number;
        metalPreference?: string;
        stonePreference?: string;
    }) => {
        ga4.customOrderInquiry(formData.orderType, formData.estimatedValue, {
            jewelry_type: 'custom_order',
            metal_type: formData.metalPreference?.toLowerCase() || 'unknown',
            stone_type: formData.stonePreference?.toLowerCase(),
            collection: 'custom'
        });
    }, []);

    const trackGalleryEngagement = useCallback((action: string, imageName: string, timeSpent?: number) => {
        ga4.galleryEngagement(action, imageName, timeSpent);
    }, []);

    const trackSocialShare = useCallback((platform: string, contentType: string, productId?: string) => {
        ga4.socialShare(platform, contentType, productId || 'general');
    }, []);

    const trackVideoEngagement = useCallback((action: string, videoTitle: string, progress?: number) => {
        ga4.videoEngagement(action, videoTitle, progress);
    }, []);

    const trackNewsletterSignup = useCallback((source: string) => {
        ga4.generateLead('newsletter', 50); // Assign estimated value to newsletter signups
    }, []);

    const trackContactFormSubmission = useCallback((formType: string, estimatedValue?: number) => {
        ga4.generateLead(formType, estimatedValue || 100);
    }, []);

    return {
        trackCustomOrderInquiry,
        trackGalleryEngagement,
        trackSocialShare,
        trackVideoEngagement,
        trackNewsletterSignup,
        trackContactFormSubmission
    };
}

// Error tracking hook
export function useGA4ErrorTracking() {
    const trackError = useCallback((error: Error, errorInfo?: any) => {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'exception', {
                description: error.message,
                fatal: false,
                error_type: error.name,
                page_location: window.location.href
            });
        }
    }, []);

    return { trackError };
}