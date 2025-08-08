// types/product.ts - CORRECTED to match backend Epic #11 schema

// ==========================================
// JSON/JSONB FIELD TYPES
// ==========================================

export interface ProductDimensions {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
}

export interface GemstoneInfo {
    type: string;
    cut?: string;
    carat?: number;
    color?: string;
    clarity?: string;
    origin?: string;
    certification?: string;
    [key: string]: string | number | undefined;
}

export interface ProductDetails {
    style?: string;
    occasion?: string;
    collection?: string;
    limited_edition?: boolean;
    warranty_years?: number;
    [key: string]: string | number | boolean | undefined;
}

// ==========================================
// CORE PRODUCT TYPES
// ==========================================

export interface Product {
    // Core fields - MATCH ProductSummary from backend
    id: number;
    name: string;
    description?: string;
    price: number; // Price in cents (matches backend)
    price_display: string; // Formatted price display "$24.99"

    // Product identification
    sku?: string;
    slug?: string;
    short_description?: string; // Added to match backend

    // Pricing - ADDED to match backend
    compare_at_price?: number; // In cents
    cost_price?: number; // In cents

    // Relationships
    category_id?: number;
    category?: Category; // Will be populated from product_category relationship
    category_name?: string; // From ProductSummary
    collections?: Collection[];

    // Inventory - CORRECTED field names to match backend
    inventory_count: number;
    inventory_policy?: 'deny' | 'continue';
    track_inventory?: boolean;
    low_stock_threshold?: number;
    in_stock: boolean; // Computed field

    // Product attributes - CORRECTED types to match backend
    weight?: number;
    dimensions?: ProductDimensions; // JSONB in backend
    materials?: string[]; // ARRAY(String) in backend
    gemstones?: GemstoneInfo; // ✅ FIXED: JSONB in backend with proper typing
    care_instructions?: string;
    product_type?: string;

    // Media - CORRECTED field names to match backend
    image_url?: string;
    image_urls?: string[];
    featured_image?: string;
    image_alt_texts?: string[]; // FIXED: backend uses image_alt_texts, not alt_texts
    video_url?: string;

    // SEO - CORRECTED field names to match backend
    meta_title?: string;
    meta_description?: string;
    search_keywords?: string[]; // FIXED: backend uses search_keywords, not meta_keywords
    social_share_title?: string; // Added to match backend
    social_share_description?: string; // Added to match backend

    // Status
    status?: 'active' | 'draft' | 'archived';
    featured: boolean;
    searchable?: boolean; // Added to match backend
    available_online?: boolean; // Added to match backend
    available_in_store?: boolean; // Added to match backend

    // Business intelligence
    view_count?: number;
    conversion_rate?: number; // Added to match backend
    average_rating?: number;
    review_count?: number;

    // Legacy fields - Keep for compatibility
    details?: ProductDetails; // ✅ FIXED: JSONB in backend with proper typing
    display_theme?: string;

    // Admin
    admin_notes?: string;
    created_by?: string;
    last_modified_by?: string; // Added to match backend

    // Timestamps
    created_at: string;
    updated_at?: string;
    published_at?: string; // Added to match backend
    discontinued_at?: string; // Added to match backend
}

export interface Category {
    id: number;
    name: string;
    slug?: string;
    description?: string;

    // SEO
    meta_title?: string;
    meta_description?: string;

    // Hierarchy - ADDED to match backend
    parent_id?: number;
    level?: number; // Added to match backend
    sort_order: number;
    full_path?: string; // For breadcrumbs: "Jewelry > Rings > Engagement"

    // Display - ADDED to match backend
    image_url?: string;
    banner_image?: string;
    icon_class?: string;

    // Computed fields
    children_count: number;
    products_count: number;

    // Status
    is_active: boolean;
    is_featured: boolean;
    is_menu_visible?: boolean; // Added to match backend

    // Admin - ADDED to match backend
    created_by?: string;
    admin_notes?: string;

    // Timestamps
    created_at: string;
    updated_at?: string;
}

export interface Collection {
    id: number;
    name: string;
    slug?: string;
    description?: string;

    // Collection type - CORRECTED to match backend
    collection_type: 'manual' | 'smart' | 'seasonal'; // Updated types
    purpose?: string; // Added to match backend
    smart_rules?: string; // Text field in backend, not Record

    // Visual and marketing - ADDED to match backend
    image_url?: string;
    banner_image?: string;
    video_url?: string;
    color_theme?: string; // Renamed from theme_color
    marketing_copy?: string;

    // Access control - CORRECTED to match backend
    is_public?: boolean; // Boolean in backend
    requires_password?: boolean; // Boolean in backend
    access_password?: string;

    // Campaign tracking - ADDED to match backend
    campaign_start?: string;
    campaign_end?: string;
    view_count: number;
    conversion_rate: number;

    // SEO
    meta_title?: string;
    meta_description?: string;

    // Computed/display
    products_count: number;
    sort_order: number;
    products_sort_by?: string; // Added to match backend

    // Status
    is_active: boolean;
    is_featured: boolean;

    // Admin - ADDED to match backend
    created_by?: string;
    admin_notes?: string;

    // Timestamps
    created_at: string;
    updated_at?: string;
}

export interface ProductListResponse {
    products: Product[]; // These are actually ProductSummary objects
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface CategoryListResponse {
    categories: Category[];
    total: number;
}

export interface CollectionListResponse {
    collections: Collection[];
    total: number;
}

// ==========================================
// FILTER TYPES - CORRECTED
// ==========================================

export interface ProductFilters {
    // Search
    name?: string;

    // Category filtering
    category_id?: number;
    category?: string; // Legacy support

    // Collection filtering
    collection_id?: number;

    // Price filtering (in dollars - will be converted to cents)
    minPrice?: number;
    maxPrice?: number;

    // Status filtering
    featured?: boolean;
    status?: 'active' | 'draft' | 'archived';
    in_stock?: boolean;

    // Pagination
    page?: number;
    pageSize?: number;

    // Sorting
    sortBy?: 'name' | 'price' | 'created_at' | 'view_count' | 'average_rating';
    sortOrder?: 'asc' | 'desc';
}

export interface CategoryFilters {
    parent_id?: number;
    include_inactive?: boolean;
    featured_only?: boolean;
}

export interface CollectionFilters {
    collection_type?: 'manual' | 'smart' | 'seasonal';
    featured_only?: boolean;
    include_inactive?: boolean;
}

// ==========================================
// FORM TYPES - CORRECTED
// ==========================================

export interface ProductCreateForm {
    name: string;
    description?: string;
    price: number; // In dollars (will be converted to cents)
    category_id: number;
    sku?: string;
    slug?: string;

    // Inventory
    inventory_count: number;
    inventory_policy: 'deny' | 'continue';
    track_inventory: boolean;

    // Attributes
    weight?: number;
    dimensions?: ProductDimensions;
    materials?: string[];
    gemstones?: GemstoneInfo; // ✅ FIXED: Proper typing instead of any
    care_instructions?: string;

    // Media
    image_url?: string;
    image_urls?: string[];
    image_alt_texts?: string[]; // FIXED: field name
    video_url?: string;

    // SEO
    meta_title?: string;
    meta_description?: string;
    search_keywords?: string[]; // FIXED: field name

    // Status
    status: 'active' | 'draft' | 'archived';
    featured: boolean;

    // Admin
    admin_notes?: string;
}

export interface CategoryCreateForm {
    name: string;
    slug?: string;
    description?: string;
    meta_title?: string;
    meta_description?: string;
    parent_id?: number;
    sort_order: number;
    is_active: boolean;
    is_featured: boolean;
}

export interface CollectionCreateForm {
    name: string;
    slug?: string;
    description?: string;
    collection_type: 'manual' | 'smart' | 'seasonal';
    smart_rules?: string; // Text field
    marketing_copy?: string;
    is_public: boolean;
    requires_password: boolean;
    access_password?: string;
    color_theme?: string;
    campaign_start?: string;
    campaign_end?: string;
    meta_title?: string;
    meta_description?: string;
    sort_order: number;
    is_active: boolean;
    is_featured: boolean;
}

// ==========================================
// COMPONENT PROP TYPES
// ==========================================

export interface ProductCardProps {
    product: Product;
    showPrice?: boolean;
    showCategory?: boolean;
    showRating?: boolean;
    index?: number;
    className?: string;
    disableRotation?: boolean;
    onClick?: (product: Product) => void;
}

export interface CategoryCardProps {
    category: Category;
    showProductCount?: boolean;
    showDescription?: boolean;
    className?: string;
    onClick?: (category: Category) => void;
}

export interface CollectionCardProps {
    collection: Collection;
    showProductCount?: boolean;
    showDescription?: boolean;
    className?: string;
    onClick?: (collection: Collection) => void;
}

export interface ProductGridProps {
    products: Product[];
    loading?: boolean;
    error?: string | null;
    showPrices?: boolean;
    showCategories?: boolean;
    className?: string;
    onProductClick?: (product: Product) => void;
}

export interface CategoryGridProps {
    categories: Category[];
    loading?: boolean;
    error?: string | null;
    showProductCounts?: boolean;
    className?: string;
    onCategoryClick?: (category: Category) => void;
}

export interface ProductFiltersProps {
    filters: ProductFilters;
    categories: Category[];
    collections: Collection[];
    onFiltersChange: (filters: Partial<ProductFilters>) => void;
    onClearFilters: () => void;
    totalResults?: number;
    loading?: boolean;
}

// ==========================================
// LEGACY COMPATIBILITY TYPES
// ==========================================

export interface ProductLegacy {
    id: number;
    name: string;
    description?: string;
    price: number; // In dollars
    image_url?: string;
    category?: string; // Category name as string
    featured: boolean;
}

export interface ProductListResponseLegacy {
    products: ProductLegacy[];
    total: number;
    page: number;
    pageSize: number;
}

// ==========================================
// UTILITY TYPES
// ==========================================

export type ProductStatus = 'active' | 'draft' | 'archived';
export type InventoryPolicy = 'deny' | 'continue';
export type CollectionType = 'manual' | 'smart' | 'seasonal';
export type SortOrder = 'asc' | 'desc';
export type SortField = 'name' | 'price' | 'created_at' | 'view_count' | 'average_rating';

// ==========================================
// TYPE GUARDS - ✅ FIXED: Proper typing instead of any
// ==========================================

export const isProduct = (item: unknown): item is Product => {
    return Boolean(
        item &&
        typeof item === 'object' &&
        'id' in item &&
        'name' in item &&
        'price' in item &&
        typeof (item as Product).id === 'number' &&
        typeof (item as Product).name === 'string' &&
        typeof (item as Product).price === 'number'
    );
};

export const isCategory = (item: unknown): item is Category => {
    return Boolean(
        item &&
        typeof item === 'object' &&
        'id' in item &&
        'name' in item &&
        typeof (item as Category).id === 'number' &&
        typeof (item as Category).name === 'string'
    );
};

export const isCollection = (item: unknown): item is Collection => {
    return Boolean(
        item &&
        typeof item === 'object' &&
        'id' in item &&
        'name' in item &&
        'collection_type' in item &&
        typeof (item as Collection).id === 'number' &&
        typeof (item as Collection).name === 'string' &&
        typeof (item as Collection).collection_type === 'string'
    );
};

// ==========================================
// CONSTANTS
// ==========================================

export const PRODUCT_STATUSES = ['active', 'draft', 'archived'] as const;
export const INVENTORY_POLICIES = ['deny', 'continue'] as const;
export const COLLECTION_TYPES = ['manual', 'smart', 'seasonal'] as const;

export const SORT_OPTIONS = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'created_at', label: 'Date Added' },
    { value: 'view_count', label: 'Popularity' },
    { value: 'average_rating', label: 'Rating' }
] as const;

export const JEWELRY_MATERIALS = [
    'Gold', '14K Gold', '18K Gold', 'White Gold', 'Rose Gold',
    'Silver', 'Sterling Silver', 'Platinum', 'Titanium',
    'Stainless Steel', 'Copper', 'Bronze'
] as const;