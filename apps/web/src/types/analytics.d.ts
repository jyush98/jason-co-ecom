// types/analytics.d.ts - Analytics tracking types

// ==========================================
// ANALYTICS PARAMETER TYPES
// ==========================================

export interface GAEventParameters {
    // Standard GA4 event parameters
    event_category?: string;
    event_label?: string;
    value?: number;
    currency?: string;

    // E-commerce parameters
    transaction_id?: string;
    affiliation?: string;
    coupon?: string;
    items?: GAItem[];

    // Custom parameters
    custom_parameter?: string | number | boolean;
    user_id?: string;
    session_id?: string;

    // Allow additional string, number, or boolean values
    [key: string]: string | number | boolean | GAItem[] | undefined;
}

export interface GAItem {
    item_id?: string;
    item_name?: string;
    category?: string;
    quantity?: number;
    price?: number;
    currency?: string;
    variant?: string;
    coupon?: string;
    item_category2?: string;
    item_category3?: string;
    item_category4?: string;
    item_category5?: string;
    item_list_id?: string;
    item_list_name?: string;
    index?: number;
    discount?: number;
    affiliation?: string;
    promotion_id?: string;
    promotion_name?: string;
    creative_name?: string;
    creative_slot?: string;
    location_id?: string;
}

export interface DataLayerEvent {
    event: string;
    event_category?: string;
    event_action?: string;
    event_label?: string;
    value?: number;
    custom_data?: Record<string, string | number | boolean>;
    timestamp?: number;
    user_properties?: Record<string, string | number | boolean>;
}

export interface VAEventData {
    // Vercel Analytics event data
    category?: string;
    action?: string;
    label?: string;
    value?: number;
    custom_properties?: Record<string, string | number | boolean>;
}

// ==========================================
// GTAG COMMAND TYPES
// ==========================================

export type GtagCommand =
    | 'config'
    | 'event'
    | 'js'
    | 'set'
    | 'get'
    | 'consent';

export type GtagConfigParams = {
    page_title?: string;
    page_location?: string;
    send_page_view?: boolean;
    custom_map?: Record<string, string>;
    allow_google_signals?: boolean;
    allow_ad_personalization_signals?: boolean;
    cookie_expires?: number;
    [key: string]: string | number | boolean | Record<string, string> | undefined;
};

// ==========================================
// GLOBAL WINDOW DECLARATIONS
// ==========================================

declare global {
    interface Window {
        gtag?: {
            // ✅ FIXED: Proper typing for gtag function
            (command: GtagCommand, targetId: string, parameters?: GtagConfigParams): void;
            (command: 'event', eventName: string, parameters?: GAEventParameters): void;
            (command: 'config', targetId: string, parameters?: GtagConfigParams): void;
            (command: 'set', parameters: Record<string, string | number | boolean>): void;
            (command: 'get', targetId: string, fieldName: string, callback?: (value: string) => void): void;
            (command: 'consent', consentAction: 'default' | 'update', parameters: Record<string, string | boolean>): void;
        };

        // ✅ FIXED: Proper typing for dataLayer
        dataLayer: DataLayerEvent[];

        // ✅ FIXED: Proper typing for Vercel Analytics
        va?: (
            command: 'event',
            parameters: {
                name: string;
                data?: VAEventData;
            }
        ) => void;

        // Additional analytics services
        fbq?: (
            command: 'track' | 'trackCustom' | 'init',
            eventName: string,
            parameters?: Record<string, string | number | boolean>
        ) => void;

        // Pinterest analytics
        pintrk?: (
            command: 'track',
            eventName: string,
            parameters?: Record<string, string | number | boolean>
        ) => void;

        // TikTok Pixel
        ttq?: {
            track: (eventName: string, parameters?: Record<string, string | number | boolean>) => void;
            page: () => void;
            identify: (parameters: Record<string, string | number>) => void;
        };
    }
}

// ==========================================
// ANALYTICS EVENT TYPES
// ==========================================

export interface AnalyticsEvent {
    name: string;
    category?: string;
    action?: string;
    label?: string;
    value?: number;
    parameters?: GAEventParameters;
    timestamp?: number;
}

export interface EcommerceEvent extends AnalyticsEvent {
    transaction_id?: string;
    currency?: string;
    value: number;
    items: GAItem[];
    coupon?: string;
    affiliation?: string;
}

export interface PageViewEvent {
    page_title: string;
    page_location: string;
    page_path?: string;
    content_group1?: string;
    content_group2?: string;
    custom_parameters?: Record<string, string | number | boolean>;
}

// ==========================================
// ANALYTICS UTILITY TYPES
// ==========================================

export interface AnalyticsConfig {
    google_analytics_id?: string;
    google_tag_manager_id?: string;
    facebook_pixel_id?: string;
    pinterest_tag_id?: string;
    tiktok_pixel_id?: string;
    vercel_analytics_enabled?: boolean;
    debug_mode?: boolean;
    cookie_consent_required?: boolean;
}

export interface UserProperties {
    user_id?: string;
    customer_id?: string;
    user_type?: 'guest' | 'registered' | 'premium';
    subscription_status?: 'active' | 'cancelled' | 'expired';
    total_orders?: number;
    total_spent?: number;
    first_visit_date?: string;
    last_visit_date?: string;
    preferred_category?: string;
    marketing_consent?: boolean;
}

// ==========================================
// TRACKING EVENT INTERFACES
// ==========================================

export interface ProductViewEvent extends AnalyticsEvent {
    name: 'view_item';
    parameters: {
        currency: string;
        value: number;
        items: [GAItem];
    };
}

export interface AddToCartEvent extends AnalyticsEvent {
    name: 'add_to_cart';
    parameters: {
        currency: string;
        value: number;
        items: GAItem[];
    };
}

export interface PurchaseEvent extends AnalyticsEvent {
    name: 'purchase';
    parameters: {
        transaction_id: string;
        currency: string;
        value: number;
        items: GAItem[];
        coupon?: string;
        affiliation?: string;
    };
}

export interface SearchEvent extends AnalyticsEvent {
    name: 'search';
    parameters: {
        search_term: string;
        search_results?: number;
        search_category?: string;
    };
}

// ==========================================
// CONSENT MANAGEMENT
// ==========================================

export interface ConsentSettings {
    analytics_storage?: 'granted' | 'denied';
    ad_storage?: 'granted' | 'denied';
    functionality_storage?: 'granted' | 'denied';
    personalization_storage?: 'granted' | 'denied';
    security_storage?: 'granted' | 'denied';
    ad_user_data?: 'granted' | 'denied';
    ad_personalization?: 'granted' | 'denied';
}

// Export empty object to make this a module
export { };