// config/index.ts
import { HOME_CONFIG } from './homeConfig';
import { SHOP_CONFIG } from './shopConfig';
import { PRODUCT_CONFIG } from './productConfig';
import { CART_CONFIG } from './cartConfig';

// Centralized config exports
export {
    SHOP_CONFIG,
    getDefaultSort,
    getDefaultCategory,
    isValidCategory,
    isValidSortOption
} from './shopConfig';

export { HOME_CONFIG } from './homeConfig';
export { GALLERY_CONFIG } from './galleryConfig';
export { PRODUCT_CONFIG } from './productConfig';
export {
    CART_CONFIG,
    getCartMessage,
    getCartFeature,
    getCartAnimation,
    formatCartPrice
} from './cartConfig';

// Export config types
export type {
    ShopConfig,
    SortOption,
    Category
} from './shopConfig';

export type {
    HomeConfig,
    ResponsiveSettings,
    AnimationConfig
} from './homeConfig';

export type {
    ProductConfig,
    ProductFeatures,
    ProductAnimations
} from './productConfig';

export type {
    CartConfig,
    CartDrawerConfig,
    CheckoutConfig,
    CartFeatures,
    CartAnimations,
    CartMessaging
} from './cartConfig';

// Helper functions for config access
export const getHomeConfig = (section: keyof typeof HOME_CONFIG) => HOME_CONFIG[section];
export const getShopConfig = (section: keyof typeof SHOP_CONFIG) => SHOP_CONFIG[section];
export const getProductConfig = (section: keyof typeof PRODUCT_CONFIG) => PRODUCT_CONFIG[section];
export const getCartConfig = (section: keyof typeof CART_CONFIG) => CART_CONFIG[section];

// Product-specific helper functions
export const getProductFeature = (feature: keyof typeof PRODUCT_CONFIG.features) =>
    PRODUCT_CONFIG.features[feature];

export const getProductAnimation = (animation: keyof typeof PRODUCT_CONFIG.animations) =>
    PRODUCT_CONFIG.animations[animation];

export const getProductMessaging = (message: keyof typeof PRODUCT_CONFIG.messaging) =>
    PRODUCT_CONFIG.messaging[message];

// Cart-specific helper functions
export const getCartDrawerConfig = () => CART_CONFIG.drawer;
export const getCheckoutConfig = () => CART_CONFIG.checkout;
export const getCartCurrency = () => CART_CONFIG.currency;

// Validation helpers
export const validateCartQuantity = (quantity: number): boolean => {
    return quantity > 0 && quantity <= CART_CONFIG.features.maxQuantityPerItem;
};

export const validateCartSize = (itemCount: number): boolean => {
    return itemCount <= CART_CONFIG.features.maxItemsInCart;
};

// Responsive helpers
export const getCartBreakpoint = (breakpoint: 'mobile' | 'tablet' | 'desktop'): number => {
    return CART_CONFIG.breakpoints[breakpoint];
};

// Animation duration helpers
export const getDrawerAnimationDuration = (): number => {
    return CART_CONFIG.animations.drawerSlide;
};

export const getCheckoutTransitionDuration = (): number => {
    return CART_CONFIG.animations.checkoutTransition;
};