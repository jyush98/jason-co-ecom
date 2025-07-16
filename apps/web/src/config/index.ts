import { HOME_CONFIG } from './homeConfig';
import { SHOP_CONFIG } from './shopConfig';

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

// Helper functions for home config
export const getHomeConfig = (section: keyof typeof HOME_CONFIG) => HOME_CONFIG[section];
export const getShopConfig = (section: keyof typeof SHOP_CONFIG) => SHOP_CONFIG[section];