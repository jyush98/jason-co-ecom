// hooks/useShop.ts - CORRECTED for Epic #11

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Product,
    Category,
    Collection,
    ProductFilters,
    ProductListResponse
} from '@/types/product';
import {
    fetchProducts,
    fetchCategories,
    fetchCollections,
    fetchCollectionProducts
} from '@/utils/api';

// ==========================================
// ENHANCED PRODUCT SEARCH HOOK - CORRECTED
// ==========================================

export const useProductSearch = (initialFilters: Partial<ProductFilters> = {}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<ProductFilters>({
        page: 1,
        pageSize: 20,
        sortBy: 'created_at',
        sortOrder: 'desc',
        status: 'active',
        ...initialFilters
    });

    const searchProducts = useCallback(async (searchFilters: ProductFilters) => {
        setLoading(true);
        setError(null);

        try {
            const response: ProductListResponse = await fetchProducts(searchFilters);
            setProducts(response.products);
            setTotal(response.total);
            setCurrentPage(response.page);
            setTotalPages(response.total_pages);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
            setProducts([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-search when filters change
    useEffect(() => {
        searchProducts(filters);
    }, [filters, searchProducts]);

    const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            page: newFilters.page ?? 1 // Reset to page 1 unless explicitly set
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            page: 1,
            pageSize: 20,
            sortBy: 'created_at',
            sortOrder: 'desc',
            status: 'active'
        });
    }, []);

    // CORRECTED: Only check for filters that actually exist in ProductFilters
    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.name ||
            filters.category_id ||
            filters.collection_id ||
            filters.minPrice ||
            filters.maxPrice ||
            filters.featured !== undefined ||
            filters.in_stock !== undefined
        );
    }, [filters]);

    return {
        // Data
        products,
        total,
        currentPage,
        totalPages,
        loading,
        error,

        // Filters
        filters,
        updateFilters,
        clearFilters,
        hasActiveFilters,

        // Actions
        searchProducts,

        // Pagination helpers
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        goToPage: (page: number) => updateFilters({ page }),
        nextPage: () => updateFilters({ page: currentPage + 1 }),
        prevPage: () => updateFilters({ page: currentPage - 1 })
    };
};

// ==========================================
// CATEGORIES HOOK - CORRECTED
// ==========================================

export const useCategories = (options: {
    includeInactive?: boolean;
    featuredOnly?: boolean;
    parentId?: number;
} = {}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const data = await fetchCategories(options);
                setCategories(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load categories');
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, [options.includeInactive, options.featuredOnly, options.parentId]);

    const categoryOptions = useMemo(() => {
        return categories.map(cat => ({
            value: cat.id,
            label: cat.full_path || cat.name,
            category: cat
        }));
    }, [categories]);

    const featuredCategories = useMemo(() => {
        return categories.filter(cat => cat.is_featured);
    }, [categories]);

    // ADDED: Active categories filter
    const activeCategories = useMemo(() => {
        return categories.filter(cat => cat.is_active);
    }, [categories]);

    // ADDED: Root categories (no parent)
    const rootCategories = useMemo(() => {
        return categories.filter(cat => !cat.parent_id);
    }, [categories]);

    return {
        categories,
        categoryOptions,
        featuredCategories,
        activeCategories,
        rootCategories,
        loading,
        error
    };
};

// ==========================================
// COLLECTIONS HOOK - CORRECTED
// ==========================================

export const useCollections = (options: {
    featuredOnly?: boolean;
    collectionType?: string;
    includeInactive?: boolean;
} = {}) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCollections = async () => {
            try {
                setLoading(true);
                const data = await fetchCollections(options);
                setCollections(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load collections');
                setCollections([]);
            } finally {
                setLoading(false);
            }
        };

        loadCollections();
    }, [options.featuredOnly, options.collectionType, options.includeInactive]);

    const collectionOptions = useMemo(() => {
        return collections.map(collection => ({
            value: collection.id,
            label: collection.name,
            collection
        }));
    }, [collections]);

    const featuredCollections = useMemo(() => {
        return collections.filter(collection => collection.is_featured);
    }, [collections]);

    const activeCollections = useMemo(() => {
        return collections.filter(collection => {
            if (!collection.is_active) return false;

            // CORRECTED: Check campaign dates for seasonal collections (not 'campaign')
            if (collection.collection_type === 'seasonal') {
                const now = new Date();
                const start = collection.campaign_start ? new Date(collection.campaign_start) : null;
                const end = collection.campaign_end ? new Date(collection.campaign_end) : null;

                if (start && now < start) return false;
                if (end && now > end) return false;
            }

            return true;
        });
    }, [collections]);

    // ADDED: Collections by type
    const collectionsByType = useMemo(() => {
        return {
            manual: collections.filter(c => c.collection_type === 'manual'),
            smart: collections.filter(c => c.collection_type === 'smart'),
            seasonal: collections.filter(c => c.collection_type === 'seasonal')
        };
    }, [collections]);

    return {
        collections,
        collectionOptions,
        featuredCollections,
        activeCollections,
        collectionsByType,
        loading,
        error
    };
};

// ==========================================
// COLLECTION PRODUCTS HOOK - ENHANCED
// ==========================================

export const useCollectionProducts = (collectionId: number | null) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProducts = useCallback(async (page: number = 1, pageSize: number = 20) => {
        if (!collectionId) {
            setProducts([]);
            setTotal(0);
            setCurrentPage(1);
            setTotalPages(0);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetchCollectionProducts(collectionId, page, pageSize);
            setProducts(response.products);
            setTotal(response.total);
            setCurrentPage(response.page);
            setTotalPages(response.total_pages);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load collection products');
            setProducts([]);
            setTotal(0);
            setCurrentPage(1);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [collectionId]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // ADDED: Refresh function
    const refresh = useCallback(() => {
        loadProducts(currentPage);
    }, [loadProducts, currentPage]);

    return {
        products,
        total,
        currentPage,
        totalPages,
        loading,
        error,
        loadProducts,
        refresh,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        goToPage: (page: number) => loadProducts(page),
        nextPage: () => loadProducts(currentPage + 1),
        prevPage: () => loadProducts(currentPage - 1)
    };
};

// ==========================================
// SINGLE PRODUCT HOOK - NEW
// ==========================================

export const useProduct = (productId: number | null) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!productId) {
            setProduct(null);
            return;
        }

        const loadProduct = async () => {
            setLoading(true);
            setError(null);

            try {
                const { fetchProduct } = await import('@/utils/api');
                const productData = await fetchProduct(productId);
                setProduct(productData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load product');
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [productId]);

    const refresh = useCallback(() => {
        if (productId) {
            // Trigger re-fetch by updating effect dependency
            setLoading(true);
        }
    }, [productId]);

    return {
        product,
        loading,
        error,
        refresh
    };
};

// ==========================================
// CATEGORY HIERARCHY HOOK - NEW
// ==========================================

export const useCategoryHierarchy = (categoryId: number | null) => {
    const [breadcrumbs, setBreadcrumbs] = useState<Category[]>([]);
    const [children, setChildren] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!categoryId) {
            setBreadcrumbs([]);
            setChildren([]);
            return;
        }

        const loadHierarchy = async () => {
            setLoading(true);
            try {
                // Load current category to get breadcrumbs
                const { fetchCategory } = await import('@/utils/api');
                const category = await fetchCategory(categoryId);

                if (category) {
                    // Build breadcrumbs from full_path or fetch parent chain
                    const crumbs = category.full_path
                        ? category.full_path.split(' > ').map((name, index) => ({
                            id: index, // This would need proper ID mapping
                            name,
                            is_active: true,
                            is_featured: false,
                            sort_order: index,
                            children_count: 0,
                            products_count: 0,
                            created_at: ''
                        }))
                        : [category];

                    setBreadcrumbs(crumbs);
                }

                // Load child categories
                const childCategories = await fetchCategories({ parentId: categoryId });
                setChildren(childCategories);
            } catch (err) {
                console.error('Failed to load category hierarchy:', err);
            } finally {
                setLoading(false);
            }
        };

        loadHierarchy();
    }, [categoryId]);

    return {
        breadcrumbs,
        children,
        loading
    };
};