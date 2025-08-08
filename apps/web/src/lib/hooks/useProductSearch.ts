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
      const searchParams = {
        name: search,
        category: category === SHOP_CONFIG.categories[0] ? undefined : category, // Don't send "All"
        page,
        pageSize,
        sortBy,
        sortOrder,
      };

      // FIXED: Handle the normalized API response structure
      const result = await fetchProducts(searchParams);

      // Only update if request wasn't aborted
      if (!abortController.current?.signal.aborted) {
        // FIXED: Extract products and total from the normalized response
        const productsData = result?.products || [];
        const total = result?.total || 0;

        setProducts(productsData);
        setTotalCount(total); // Use actual total count from API
        setError(null);
      }
    } catch (err) {
      // Only set error if request wasn't aborted
      if (!abortController.current?.signal.aborted) {
        console.error("Failed to fetch products:", err);
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

  // Debounced effect for search
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchProductsData();
    }, SHOP_CONFIG.searchDebounce);

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