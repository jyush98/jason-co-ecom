// lib/analytics/ga4.ts
// UPDATED: Compatible with Epic #11 Product and Cart types

import { Product } from '@/types/product';
import { CartItem } from '@/types/cart';

export interface GA4Product {
    item_id: string;
    item_name: string;
    item_category: string;
    item_category2?: string;
    item_brand: string;
    price: number;
    currency: string;
    quantity?: number;
    item_variant?: string; // For different metals, sizes, etc.
    affiliation?: string;
    coupon?: string;
    discount?: number;
    index?: number;
    promotion_id?: string;
    promotion_name?: string;
    creative_name?: string;
    creative_slot?: string;
    location_id?: string;
}

export interface GA4CustomDimensions {
    // Luxury jewelry specific dimensions
    jewelry_type: string; // ring, necklace, earrings, bracelet
    metal_type: string; // gold, silver, platinum
    stone_type?: string; // diamond, pearl, gemstone
    collection: string; // featured, seasonal, custom
    price_tier: string; // luxury, premium, custom
    customer_segment?: string; // new, returning, vip
    design_style?: string; // vintage, modern, classic
}

class GA4Analytics {
    private measurementId: string;
    private isInitialized: boolean = false;

    constructor(measurementId: string) {
        this.measurementId = measurementId;
    }

    // Initialize GA4 with enhanced e-commerce
    init(): void {
        if (typeof window === 'undefined' || this.isInitialized) return;

        // Load GA4 script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
        document.head.appendChild(script);

        // Initialize dataLayer and gtag
        window.dataLayer = window.dataLayer || [];

        // FIXED: Proper gtag function declaration with correct typing
        window.gtag = function (...args: any[]) {
            // FIXED: Use rest parameters and convert to proper DataLayerEvent format
            const [command, ...params] = args;
            const dataLayerEvent: any = {
                event: command,
                ...params
            };
            window.dataLayer.push(dataLayerEvent);
        };

        // FIXED: Proper null check and correct parameter types
        if (window.gtag) {
            window.gtag('js', new Date().toString()); // Convert Date to string
            window.gtag('config', this.measurementId, {
                send_page_view: true,
                custom_map: {
                    'custom_dimension_1': 'jewelry_type',
                    'custom_dimension_2': 'metal_type',
                    'custom_dimension_3': 'collection',
                    'custom_dimension_4': 'price_tier',
                    'custom_dimension_5': 'customer_segment'
                }
            });
        }

        this.isInitialized = true;
    }

    // FIXED: Enhanced safe gtag invocation with proper typing
    private safeGtag(command: 'event', action: string, parameters?: Record<string, any>): void {
        if (typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function') {
            try {
                // FIXED: Use proper event command typing
                window.gtag('event', action, parameters);
            } catch (error) {
                console.warn('GA4 tracking error:', error);
            }
        }
    }

    // Track page views with custom dimensions
    pageView(url: string, title: string, customDimensions?: Partial<GA4CustomDimensions>): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'page_view', {
            page_title: title,
            page_location: url,
            ...customDimensions
        });
    }

    // Product Detail View - Critical for jewelry e-commerce
    viewItem(product: GA4Product, customDimensions?: Partial<GA4CustomDimensions>): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'view_item', {
            currency: product.currency,
            value: product.price,
            items: [product],
            ...customDimensions
        });
    }

    // Product List Views (Shop page, Category pages)
    viewItemList(items: GA4Product[], listName: string, customDimensions?: Partial<GA4CustomDimensions>): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'view_item_list', {
            item_list_id: listName.toLowerCase().replace(/\s+/g, '_'),
            item_list_name: listName,
            items: items.map((item, index) => ({ ...item, index })),
            ...customDimensions
        });
    }

    // Add to Cart - High-value luxury jewelry event
    addToCart(product: GA4Product, customDimensions?: Partial<GA4CustomDimensions>): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'add_to_cart', {
            currency: product.currency,
            value: product.price * (product.quantity || 1),
            items: [product],
            ...customDimensions
        });
    }

    // Remove from Cart
    removeFromCart(product: GA4Product): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'remove_from_cart', {
            currency: product.currency,
            value: product.price * (product.quantity || 1),
            items: [product]
        });
    }

    // Begin Checkout - Critical conversion funnel event
    beginCheckout(items: GA4Product[], value: number, currency: string = 'USD'): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'begin_checkout', {
            currency,
            value,
            items,
            coupon: items.find(item => item.coupon)?.coupon
        });
    }

    // Add Payment Info
    addPaymentInfo(items: GA4Product[], value: number, currency: string = 'USD', paymentType?: string): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'add_payment_info', {
            currency,
            value,
            payment_type: paymentType,
            items
        });
    }

    // Purchase - Ultimate conversion event for luxury jewelry
    purchase(transactionId: string, items: GA4Product[], value: number, currency: string = 'USD', additionalData?: any): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'purchase', {
            transaction_id: transactionId,
            currency,
            value,
            items,
            affiliation: 'Jason & Co Jewelry',
            ...additionalData
        });
    }

    // Search Events - Important for product discovery
    search(searchTerm: string, results?: number): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'search', {
            search_term: searchTerm,
            search_results: results
        });
    }

    // Custom Orders - Unique to luxury jewelry business
    customOrderInquiry(orderType: string, estimatedValue?: number, customDimensions?: Partial<GA4CustomDimensions>): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'custom_order_inquiry', {
            event_category: 'Custom Orders',
            event_label: orderType,
            value: estimatedValue,
            ...customDimensions
        });
    }

    // Gallery Engagement - Track art/design appreciation
    galleryEngagement(action: string, imageName: string, timeSpent?: number): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'gallery_engagement', {
            event_category: 'Gallery',
            event_action: action,
            event_label: imageName,
            value: timeSpent
        });
    }

    // Social Sharing - Luxury brands benefit from social proof
    socialShare(platform: string, contentType: string, contentId: string): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'share', {
            method: platform,
            content_type: contentType,
            content_id: contentId
        });
    }

    // Video Engagement - For product videos, craftsmanship videos
    videoEngagement(action: string, videoTitle: string, progress?: number): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'video_engagement', {
            event_category: 'Video',
            event_action: action,
            event_label: videoTitle,
            value: progress
        });
    }

    // Lead Generation - Contact form, newsletter signups
    generateLead(method: string, value?: number): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'generate_lead', {
            currency: 'USD',
            value: value || 0,
            method
        });
    }

    // User Engagement Score - Custom metric for luxury brands
    userEngagement(score: number, actions: string[]): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'user_engagement', {
            engagement_score: score,
            actions_taken: actions.join(','),
            event_category: 'Engagement'
        });
    }

    // Conversion Funnel Tracking
    trackFunnelStep(step: string, stepNumber: number, value?: number): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', 'funnel_step', {
            funnel_step: step,
            step_number: stepNumber,
            value: value || 0,
            event_category: 'Conversion Funnel'
        });
    }

    // Custom event for any other tracking needs
    customEvent(eventName: string, parameters: Record<string, any>): void {
        if (!this.isInitialized) return;

        this.safeGtag('event', eventName, parameters);
    }
}

// ==========================================
// CONVERSION HELPERS - UPDATED for Epic #11
// ==========================================

/**
 * Convert Product to GA4Product format
 * Handles your enhanced Product type from Epic #11
 */
export function convertProductToGA4(product: Product): GA4Product {
    const price = product.price ? product.price / 100 : 0; // Convert cents to dollars for GA4
    const categoryName = getCategoryName(product); // This ensures we always have a string

    return {
        item_id: product.sku || product.id.toString(),
        item_name: product.name,
        item_category: categoryName,
        item_category2: product.product_type || undefined,
        item_brand: 'Jason & Co',
        price: price,
        currency: 'USD',
        quantity: 1,
        item_variant: getMaterialVariant(product),
        affiliation: 'Jason & Co Jewelry'
    };
}

/**
 * Convert CartItem to GA4Product format
 * Handles your enhanced CartItem type from Epic #11
 */
export function convertCartItemToGA4(cartItem: CartItem): GA4Product {
    const price = cartItem.product.price ? cartItem.product.price / 100 : 0; // Convert cents to dollars
    const categoryName = cartItem.product.category || 'Jewelry'; // Ensure we have a string

    return {
        item_id: cartItem.product.id.toString(),
        item_name: cartItem.product.name,
        item_category: categoryName,
        item_brand: 'Jason & Co',
        price: price,
        currency: 'USD',
        quantity: cartItem.quantity,
        affiliation: 'Jason & Co Jewelry'
    };
}

/**
 * Convert array of CartItems to GA4Products
 */
export function convertCartItemsToGA4(cartItems: CartItem[]): GA4Product[] {
    return cartItems.map(convertCartItemToGA4);
}

/**
 * Legacy function - updated to use new types
 */
export function createProductFromData(productData: Product | CartItem | any): GA4Product {
    // Handle different data structures
    if ('product' in productData) {
        // It's a CartItem
        return convertCartItemToGA4(productData as CartItem);
    } else if ('price' in productData && 'id' in productData) {
        // It's a Product
        return convertProductToGA4(productData as Product);
    } else {
        // Legacy/unknown structure - fallback
        return {
            item_id: productData.id || productData.sku || 'unknown',
            item_name: productData.name || productData.title || 'Unknown Product',
            item_category: productData.category || 'Jewelry',
            item_category2: productData.subcategory,
            item_brand: 'Jason & Co',
            price: parseFloat(productData.price) || 0,
            currency: productData.currency || 'USD',
            quantity: productData.quantity || 1,
            item_variant: productData.variant || productData.metal,
            affiliation: 'Jason & Co Jewelry'
        };
    }
}

// ==========================================
// HELPER FUNCTIONS - UPDATED
// ==========================================

/**
 * Safely get category name from Product
 */
export function getCategoryName(product: Product): string {
    if (product.category_name) return product.category_name;
    if (product.category && typeof product.category === 'object' && 'name' in product.category) {
        return product.category.name;
    }
    if (typeof product.category === 'string') return product.category;
    return 'Jewelry';
}

/**
 * Get material variant for GA4 tracking
 */
function getMaterialVariant(product: Product): string | undefined {
    if (product.materials && product.materials.length > 0) {
        return product.materials[0]; // Primary material
    }
    return undefined;
}

export function determinePriceTier(price: number): string {
    // Price is in dollars for this function
    if (price >= 5000) return 'luxury';
    if (price >= 1000) return 'premium';
    if (price >= 500) return 'mid-range';
    return 'accessible';
}

export function getJewelryType(category: string): string {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('ring')) return 'ring';
    if (categoryLower.includes('necklace')) return 'necklace';
    if (categoryLower.includes('earring')) return 'earrings';
    if (categoryLower.includes('bracelet')) return 'bracelet';
    if (categoryLower.includes('pendant')) return 'pendant';
    return 'other';
}

// Singleton instance
let ga4Instance: GA4Analytics | null = null;

export function getGA4Instance(): GA4Analytics {
    if (!ga4Instance) {
        const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';
        ga4Instance = new GA4Analytics(measurementId);

        // Auto-initialize on client side
        if (typeof window !== 'undefined') {
            ga4Instance.init();
        }
    }
    return ga4Instance;
}

// Export the singleton instance
export const ga4 = getGA4Instance();