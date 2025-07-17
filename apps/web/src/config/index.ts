// config/index.ts
import { HOME_CONFIG } from './homeConfig';
import { SHOP_CONFIG } from './shopConfig';
import { PRODUCT_CONFIG } from './productConfig';

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

// Helper functions for config access
export const getHomeConfig = (section: keyof typeof HOME_CONFIG) => HOME_CONFIG[section];
export const getShopConfig = (section: keyof typeof SHOP_CONFIG) => SHOP_CONFIG[section];
export const getProductConfig = (section: keyof typeof PRODUCT_CONFIG) => PRODUCT_CONFIG[section];

// Product-specific helper functions
export const getProductFeature = (feature: keyof typeof PRODUCT_CONFIG.features) => 
    PRODUCT_CONFIG.features[feature];

export const getProductAnimation = (animation: keyof typeof PRODUCT_CONFIG.animations) => 
    PRODUCT_CONFIG.animations[animation];

export const getProductMessaging = (message: keyof typeof PRODUCT_CONFIG.messaging) => 
    PRODUCT_CONFIG.messaging[message];