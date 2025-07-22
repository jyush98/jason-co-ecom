// Export all custom hooks
export { useShopFilters } from './useShopFilters';
export { useProductSearch } from './useProductSearch';
export { useInfiniteCarousel, useResponsiveCarousel } from './useInfiniteCarousel';
export { useCartDrawer } from './useCartDrawer';
export { useCheckoutFlow } from './useCheckoutFlow';
export { useOrderTracking } from './useOrderTracking';

// Export hook types
export type { UseShopFiltersReturn } from './useShopFilters';
export type { UseProductSearchReturn } from './useProductSearch';
export type {
    UseInfiniteCarouselReturn,
    UseInfiniteCarouselOptions
} from '@/types/home';
export type { UseCartDrawerReturn } from './useCartDrawer';
export type { UseCheckoutFlowReturn } from './useCheckoutFlow';
export type { UseOrderTrackingReturn } from './useOrderTracking';