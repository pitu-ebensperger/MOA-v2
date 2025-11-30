import { useMemo } from "react";
import { useQuery, useQueryClient } from "@/config/query.client.config.js";
import { productsApi } from "@/services/products.api.js"

const PRODUCTS_QUERY_KEY = ["products"];

const normalizeFilters = (filters) => {
  if (!filters || typeof filters !== "object") return {};
  return filters;
};

export const useProducts = (filters) => {
  const queryClient = useQueryClient();
  const normalizedFilters = useMemo(() => normalizeFilters(filters), [filters]);
  
  const queryKey = useMemo(() => [...PRODUCTS_QUERY_KEY, normalizedFilters], [normalizedFilters]);

  const query = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      try {
        const data = await productsApi.list(normalizedFilters);
        return data;
      } catch (err) {
        console.error('[useProducts] Fetch error', {
          message: err.message,
          status: err.status,
          data: err.data,
        });
        throw err;
      }
    },
    // Configuración optimizada de cache
    staleTime: 3 * 60 * 1000, // 3 minutos - productos cambian poco
    cacheTime: 10 * 60 * 1000, // 10 minutos en cache
    keepPreviousData: true, // UX smooth durante paginación/filtros
    refetchOnWindowFocus: false, // No refetch innecesario
    // Prefetch siguiente página si hay filtros de paginación
    onSuccess: (data) => {
        if (data?.pagination?.hasNextPage && normalizedFilters?.page) {
        // Prefetch silencioso de siguiente página
        queryClient.prefetchQuery({
          queryKey: [...PRODUCTS_QUERY_KEY, { ...normalizedFilters, page: normalizedFilters.page + 1 }],
          queryFn: () => productsApi.list({ ...normalizedFilters, page: normalizedFilters.page + 1 }),
        });
      }
    },
  });

  return {
    products: query.data?.items ?? [],
    total: query.data?.total ?? query.data?.items?.length ?? 0,
    isLoading: query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
    isFetching: query.isFetching,
    isStale: query.isStale,
  };
};

// Hook para obtener producto individual (con cache)
export const useProduct = (productId, options = {}) => {
  const query = useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'detail', productId],
    queryFn: () => productsApi.getById(productId),
    enabled: Boolean(productId), // Solo fetch si hay ID
    staleTime: 5 * 60 * 1000, // 5 minutos - detalles cambian poco
    cacheTime: 15 * 60 * 1000, // 15 minutos en cache
    ...options,
  });

  return {
    product: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
  };
};

// Hook para invalidar cache de productos (útil después de crear/editar)
export const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY, exact: false }),
    invalidateProduct: (productId) => queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, 'detail', productId] }),
  };
};
