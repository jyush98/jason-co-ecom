import { useState, useEffect, useRef, useCallback } from "react";
import { fetchProducts } from "@/utils/api";
import { Product } from "@/types/product";
import { SHOP_CONFIG } from "@/config";

export interface UseProductSearchParams {
  search: string;
  category: string;
  sortBy: string;
  sortOrder: string;
  page: number;
  pageSize?: number;
}

export interface UseProductSearchReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  refetch: () => Promise<void>;
}

export function useProductSearch(params: UseProductSearchParams): UseProductSearchReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const {
    search,
    category,
    sortBy,
    sortOrder,
    page,
    pageSize = SHOP_CONFIG.resultsPerPage
  } = params;

  // FIXED: Proper category normalization
  const shouldFilterByCategory = (cat: string): boolean => {
    if (!cat) return false;
    const normalizedCat = cat.toLowerCase();
    return normalizedCat !== "all" && normalizedCat !== "";
  };

  // Memoized fetch function
  const fetchProductsData = useCallback(async () => {
    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    // Create new abort controller
    abortController.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      // FIXED: Proper parameter construction
      const searchParams = {
        // Search by name
        name: search || undefined,

        // FIXED: Category filtering logic
        category: shouldFilterByCategory(category) ? category : undefined,

        // Pagination
        page,
        pageSize,

        // Sorting
        sortBy,
        sortOrder,
      };

      // Debug logging - remove in production
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 useProductSearch - API Request:', {
          originalParams: params,
          searchParams,
          shouldFilter: shouldFilterByCategory(category)
        });
      }

      // FIXED: Handle the normalized API response structure
      const result = await fetchProducts(searchParams);

      // Debug logging - remove in production
      if (process.env.NODE_ENV === 'development') {
        console.log('📦 useProductSearch - API Response:', {
          total: result?.total,
          productsCount: result?.products?.length,
          firstProduct: result?.products?.[0]?.name
        });
      }

      // Only update if request wasn't aborted
      if (!abortController.current?.signal.aborted) {
        // FIXED: Extract products and total from the normalized response
        const productsData = result?.products || [];
        const total = result?.total || 0;

        setProducts(productsData);
        setTotalCount(total);
        setError(null);
      }
    } catch (err) {
      // Only set error if request wasn't aborted
      if (!abortController.current?.signal.aborted) {
        console.error("❌ useProductSearch - Failed to fetch products:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch products");
        setProducts([]);
        setTotalCount(0);
      }
    } finally {
      // Only update loading if request wasn't aborted
      if (!abortController.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [search, category, page, pageSize, sortBy, sortOrder]);

  // FIXED: Debounced effect with proper dependencies
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // For search queries, use debounce. For filters (category, sort), execute immediately
    const shouldDebounce = search && search.length > 0;
    const delay = shouldDebounce ? SHOP_CONFIG.searchDebounce : 0;

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchProductsData();
    }, delay);

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchProductsData]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    await fetchProductsData();
  }, [fetchProductsData]);

  // FIXED: Computed values - properly calculate hasMore based on pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = page < totalPages;

  return {
    products,
    loading,
    error,
    totalCount,
    hasMore,
    refetch,
  };
}