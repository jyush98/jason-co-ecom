// hooks/useGA4.ts
// React hooks for Google Analytics 4 integration

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ga4, GA4Product, GA4CustomDimensions, createProductFromData, determinePriceTier, getJewelryType } from '@/lib/analytics/ga4';

export interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    image_urls: string[] | null;
    category: string;
    featured: boolean;
    details: Record<string, any> | null;
    display_theme: string;
}

export interface CartProduct {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    category: string;
    description?: string;
}

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

// ✅ FIXED: Safe GA4 product conversion
function safeCreateGA4Product(product: Product | CartProduct, quantity: number = 1): GA4Product {
    return {
        item_id: String(product.id),
        item_name: product.name || 'Unknown Product',
        item_category: product.category || 'Jewelry',
        item_brand: 'Jason & Co',
        price: Number(product.price) || 0,
        currency: 'USD',
        quantity: quantity,
        affiliation: 'Jason & Co Jewelry'
    };
}

// ✅ FIXED: Safe custom dimensions extraction
function extractCustomDimensions(product: Product | CartProduct): Partial<GA4CustomDimensions> {
    return {
        jewelry_type: getJewelryType(product.category),
        metal_type: extractMetalType(product),
        collection: extractCollection(product),
        price_tier: determinePriceTier(product.price)
    };
}

// ✅ FIXED: Safe metal type extraction
function extractMetalType(product: Product | CartProduct): string {
    const searchText = `${product.name || ''} ${('description' in product) ? product.description || '' : ''}`.toLowerCase();

    if (searchText.includes('gold')) {
        if (searchText.includes('rose') || searchText.includes('pink')) return 'rose_gold';
        if (searchText.includes('white')) return 'white_gold';
        return 'yellow_gold';
    }
    if (searchText.includes('silver')) return 'silver';
    if (searchText.includes('platinum')) return 'platinum';
    if (searchText.includes('steel')) return 'stainless_steel';

    return 'mixed';
}

// ✅ FIXED: Safe collection extraction
function extractCollection(product: Product | CartProduct): string {
    if ('featured' in product && product.featured) {
        return 'featured';
    }

    // Check if it's a custom product based on category or name
    const name = (product.name || '').toLowerCase();
    const category = (product.category || '').toLowerCase();

    if (name.includes('custom') || category.includes('custom')) {
        return 'custom';
    }

    return 'main';
}

// E-commerce tracking hook with proper typing
export function useGA4Ecommerce() {
    const trackProductView = useCallback((product: Product) => {
        try {
            const ga4Product = safeCreateGA4Product(product);
            const customDimensions = extractCustomDimensions(product);

            ga4.viewItem(ga4Product, customDimensions);
            console.log('✅ GA4: Product view tracked', { product: product.name, category: product.category });
        } catch (error) {
            console.error('❌ GA4: Product view tracking failed', error);
        }
    }, []);

    const trackAddToCart = useCallback((product: Product | CartProduct, quantity: number = 1) => {
        try {
            const ga4Product = safeCreateGA4Product(product, quantity);
            const customDimensions = extractCustomDimensions(product);

            ga4.addToCart(ga4Product, customDimensions);
            console.log('✅ GA4: Add to cart tracked', { product: product.name, quantity, category: product.category });
        } catch (error) {
            console.error('❌ GA4: Add to cart tracking failed', error);
        }
    }, []);

    const trackRemoveFromCart = useCallback((product: Product | CartProduct, quantity: number = 1) => {
        try {
            const ga4Product = safeCreateGA4Product(product, quantity);
            ga4.removeFromCart(ga4Product);
            console.log('✅ GA4: Remove from cart tracked', { product: product.name });
        } catch (error) {
            console.error('❌ GA4: Remove from cart tracking failed', error);
        }
    }, []);

    const trackPurchase = useCallback((orderData: {
        id: string;
        items: Array<{ product: Product | CartProduct; quantity: number }>;
        total: number;
        currency?: string;
        coupon?: string;
        shipping?: number;
        tax?: number;
    }) => {
        try {
            const ga4Products = orderData.items.map(item =>
                safeCreateGA4Product(item.product, item.quantity)
            );

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
            console.log('✅ GA4: Purchase tracked', { orderId: orderData.id, total: orderData.total });
        } catch (error) {
            console.error('❌ GA4: Purchase tracking failed', error);
        }
    }, []);

    const trackBeginCheckout = useCallback((cartItems: Array<{ product: Product | CartProduct; quantity: number }>, total: number) => {
        try {
            const ga4Products = cartItems.map(item =>
                safeCreateGA4Product(item.product, item.quantity)
            );
            ga4.beginCheckout(ga4Products, total);
            console.log('✅ GA4: Begin checkout tracked', { itemCount: cartItems.length, total });
        } catch (error) {
            console.error('❌ GA4: Begin checkout tracking failed', error);
        }
    }, []);

    return {
        trackProductView,
        trackAddToCart,
        trackRemoveFromCart,
        trackPurchase,
        trackBeginCheckout
    };
}

// Search tracking hook with proper typing
export function useGA4Search() {
    const trackSearch = useCallback((query: string, results?: Product[]) => {
        try {
            ga4.search(query, results?.length);
            console.log('✅ GA4: Search tracked', { query, resultCount: results?.length });
        } catch (error) {
            console.error('❌ GA4: Search tracking failed', error);
        }
    }, []);

    const trackSearchResultClick = useCallback((product: Product, position: number) => {
        try {
            const ga4Product = { ...safeCreateGA4Product(product), index: position };
            ga4.viewItem(ga4Product, {
                jewelry_type: getJewelryType(product.category),
                collection: 'search_results'
            });
            console.log('✅ GA4: Search result click tracked', { product: product.name, position });
        } catch (error) {
            console.error('❌ GA4: Search result click tracking failed', error);
        }
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
        try {
            ga4.customOrderInquiry(formData.orderType, formData.estimatedValue, {
                jewelry_type: 'custom_order',
                metal_type: formData.metalPreference?.toLowerCase() || 'unknown',
                stone_type: formData.stonePreference?.toLowerCase(),
                collection: 'custom'
            });
            console.log('✅ GA4: Custom order inquiry tracked', formData);
        } catch (error) {
            console.error('❌ GA4: Custom order inquiry tracking failed', error);
        }
    }, []);

    const trackGalleryEngagement = useCallback((action: string, imageName: string, timeSpent?: number) => {
        try {
            ga4.galleryEngagement(action, imageName, timeSpent);
            console.log('✅ GA4: Gallery engagement tracked', { action, imageName, timeSpent });
        } catch (error) {
            console.error('❌ GA4: Gallery engagement tracking failed', error);
        }
    }, []);

    const trackSocialShare = useCallback((platform: string, contentType: string, productId?: string) => {
        try {
            ga4.socialShare(platform, contentType, productId || 'general');
            console.log('✅ GA4: Social share tracked', { platform, contentType, productId });
        } catch (error) {
            console.error('❌ GA4: Social share tracking failed', error);
        }
    }, []);

    const trackVideoEngagement = useCallback((action: string, videoTitle: string, progress?: number) => {
        try {
            ga4.videoEngagement(action, videoTitle, progress);
            console.log('✅ GA4: Video engagement tracked', { action, videoTitle, progress });
        } catch (error) {
            console.error('❌ GA4: Video engagement tracking failed', error);
        }
    }, []);

    const trackNewsletterSignup = useCallback((source: string) => {
        try {
            ga4.generateLead('newsletter', 50);
            console.log('✅ GA4: Newsletter signup tracked', { source });
        } catch (error) {
            console.error('❌ GA4: Newsletter signup tracking failed', error);
        }
    }, []);

    const trackContactFormSubmission = useCallback((formType: string, estimatedValue?: number) => {
        try {
            ga4.generateLead(formType, estimatedValue || 100);
            console.log('✅ GA4: Contact form submission tracked', { formType, estimatedValue });
        } catch (error) {
            console.error('❌ GA4: Contact form submission tracking failed', error);
        }
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
            try {
                window.gtag('event', 'exception', {
                    description: error.message,
                    fatal: false,
                    error_type: error.name,
                    page_location: window.location.href
                });
                console.log('✅ GA4: Error tracked', { error: error.message });
            } catch (trackingError) {
                console.error('❌ GA4: Error tracking failed', trackingError);
            }
        }
    }, []);

    return { trackError };
}