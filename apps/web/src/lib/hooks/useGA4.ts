// hooks/useGA4.ts - Complete GA4 hooks implementation

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ga4, GA4Product, GA4CustomDimensions, determinePriceTier, getJewelryType } from '@/lib/analytics/ga4';

// ✅ SIMPLE: Define minimal interface for GA4 tracking
interface GA4TrackingItem {
    id: number;
    name: string;
    price: number;
    category?: string;
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

// ✅ SIMPLE: Convert any product-like object to GA4 format
function toGA4Product(item: GA4TrackingItem, quantity: number = 1): GA4Product {
    return {
        item_id: String(item.id),
        item_name: item.name,
        item_category: item.category || 'Jewelry',
        item_brand: 'Jason & Co',
        price: Number(item.price),
        currency: 'USD',
        quantity: quantity,
        affiliation: 'Jason & Co Jewelry'
    };
}

// ✅ SIMPLE: Extract metal type from product name
function extractMetalType(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('gold')) {
        if (lowerName.includes('rose') || lowerName.includes('pink')) return 'rose_gold';
        if (lowerName.includes('white')) return 'white_gold';
        return 'yellow_gold';
    }
    if (lowerName.includes('silver')) return 'silver';
    if (lowerName.includes('platinum')) return 'platinum';
    if (lowerName.includes('steel')) return 'stainless_steel';
    if (lowerName.includes('titanium')) return 'titanium';
    return 'mixed';
}

// ✅ SIMPLE: Extract collection from category
function extractCollection(category?: string): string {
    if (!category) return 'main';
    
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('ring')) return 'rings';
    if (lowerCategory.includes('necklace')) return 'necklaces';
    if (lowerCategory.includes('earring')) return 'earrings';
    if (lowerCategory.includes('bracelet')) return 'bracelets';
    if (lowerCategory.includes('watch')) return 'watches';
    return 'main';
}

// ✅ SIMPLE: Get custom dimensions for any item
function getCustomDimensions(item: GA4TrackingItem): GA4CustomDimensions {
    return {
        jewelry_type: getJewelryType(item.category || 'Jewelry'),
        metal_type: extractMetalType(item.name || ''),
        collection: extractCollection(item.category),
        price_tier: determinePriceTier(Number(item.price))
    };
}

// E-commerce tracking hook - works with ANY product-like object
export function useGA4Ecommerce() {
    const trackProductView = useCallback((product: GA4TrackingItem) => {
        try {
            const ga4Product = toGA4Product(product);
            const customDimensions = getCustomDimensions(product);
            ga4.viewItem(ga4Product, customDimensions);
            console.log('✅ GA4: Product view tracked', product.name);
        } catch (error) {
            console.error('❌ GA4: Product view tracking failed', error);
        }
    }, []);

    const trackAddToCart = useCallback((product: GA4TrackingItem, quantity: number = 1) => {
        try {
            const ga4Product = toGA4Product(product, quantity);
            const customDimensions = getCustomDimensions(product);
            ga4.addToCart(ga4Product, customDimensions);
            console.log('✅ GA4: Add to cart tracked', product.name, quantity);
        } catch (error) {
            console.error('❌ GA4: Add to cart tracking failed', error);
        }
    }, []);

    const trackRemoveFromCart = useCallback((product: GA4TrackingItem, quantity: number = 1) => {
        try {
            const ga4Product = toGA4Product(product, quantity);
            ga4.removeFromCart(ga4Product);
            console.log('✅ GA4: Remove from cart tracked', product.name);
        } catch (error) {
            console.error('❌ GA4: Remove from cart tracking failed', error);
        }
    }, []);

    // ✅ FLEXIBLE: Works with your actual cart items structure
    const trackPurchase = useCallback((orderData: {
        id: string;
        items: Array<{ product: GA4TrackingItem; quantity: number }>;
        total: number;
        currency?: string;
        coupon?: string;
        shipping?: number;
        tax?: number;
    }) => {
        try {
            const ga4Products = orderData.items.map(item =>
                toGA4Product(item.product, item.quantity)
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
            console.log('✅ GA4: Purchase tracked', orderData.id, orderData.total);
        } catch (error) {
            console.error('❌ GA4: Purchase tracking failed', error);
        }
    }, []);

    // ✅ FLEXIBLE: Works with your actual cart items structure
    const trackBeginCheckout = useCallback((cartItems: Array<{ product: GA4TrackingItem; quantity: number }>, total: number) => {
        try {
            const ga4Products = cartItems.map(item =>
                toGA4Product(item.product, item.quantity)
            );
            ga4.beginCheckout(ga4Products, total);
            console.log('✅ GA4: Begin checkout tracked', cartItems.length, 'items', total);
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

// Search tracking hook
export function useGA4Search() {
    const trackSearch = useCallback((query: string, results?: GA4TrackingItem[]) => {
        try {
            ga4.search(query, results?.length);
            console.log('✅ GA4: Search tracked', query, results?.length);
        } catch (error) {
            console.error('❌ GA4: Search tracking failed', error);
        }
    }, []);

    const trackSearchResultClick = useCallback((product: GA4TrackingItem, position: number) => {
        try {
            const ga4Product = { ...toGA4Product(product), index: position };
            ga4.viewItem(ga4Product, {
                jewelry_type: getJewelryType(product.category || 'Jewelry'),
                collection: 'search_results'
            });
            console.log('✅ GA4: Search result click tracked', product.name, position);
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
            console.log('✅ GA4: Gallery engagement tracked', action, imageName);
        } catch (error) {
            console.error('❌ GA4: Gallery engagement tracking failed', error);
        }
    }, []);

    const trackSocialShare = useCallback((platform: string, contentType: string, productId?: string) => {
        try {
            ga4.socialShare(platform, contentType, productId || 'general');
            console.log('✅ GA4: Social share tracked', platform, contentType);
        } catch (error) {
            console.error('❌ GA4: Social share tracking failed', error);
        }
    }, []);

    const trackVideoEngagement = useCallback((action: string, videoTitle: string, progress?: number) => {
        try {
            ga4.videoEngagement(action, videoTitle, progress);
            console.log('✅ GA4: Video engagement tracked', action, videoTitle);
        } catch (error) {
            console.error('❌ GA4: Video engagement tracking failed', error);
        }
    }, []);

    const trackNewsletterSignup = useCallback((source: string) => {
        try {
            ga4.generateLead('newsletter', 50);
            console.log('✅ GA4: Newsletter signup tracked', source);
        } catch (error) {
            console.error('❌ GA4: Newsletter signup tracking failed', error);
        }
    }, []);

    const trackContactFormSubmission = useCallback((formType: string, estimatedValue?: number) => {
        try {
            ga4.generateLead(formType, estimatedValue || 100);
            console.log('✅ GA4: Contact form submission tracked', formType);
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
                console.log('✅ GA4: Error tracked', error.message);
            } catch (trackingError) {
                console.error('❌ GA4: Error tracking failed', trackingError);
            }
        }
    }, []);

    return { trackError };
}