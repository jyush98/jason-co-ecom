// Clean exports for all home components
export { default as VideoHero } from './VideoHero';
export { default as FeaturedProducts } from './FeaturedProducts';
export { default as CollectionsShowcase } from './CollectionsShowcase';
export { default as CategoriesSection } from './CategoriesSection';

// Export component prop types for external use
export type {
    VideoHeroProps,
    FeaturedProductsProps,
    CollectionsShowcaseProps,
    CategoriesSectionProps
} from '@/types/home';