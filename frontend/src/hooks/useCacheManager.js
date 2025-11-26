import { useQueryClient } from '@/lib/react-query-lite';
import { QUERY_KEYS } from '@shared/constants/react-query.config.js';

/**
 * Hook para gestionar invalidación de cache
 */
export const useCacheManager = () => {
  const queryClient = useQueryClient();

  return {
    // Invalidar todas las queries del cache
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },

    // Invalidar por categoría
    invalidateProducts: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
    },
    
    invalidateCategories: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
    },
    
    invalidateOrders: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
    
    invalidateCart: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
    },
    
    invalidateWishlist: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist });
    },
    
    invalidateUser: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user });
    },

    // Limpiar cache específico
    clearProducts: () => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.products });
    },
    
    clearCart: () => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.cart });
      queryClient.setQueryData(QUERY_KEYS.cart, []);
    },
    
    clearWishlist: () => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.wishlist });
      queryClient.setQueryData(QUERY_KEYS.wishlist, []);
    },

    // Limpiar todo el cache de React Query (ejecutar al logout del usuario)
    clearAll: () => {
      queryClient.clear();
    },

    // Refetch específico
    refetchProducts: () => {
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.products });
    },
    
    refetchOrders: () => {
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.orders });
    },

    // Prefetch
    prefetchProduct: (productId) => {
      return queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.product(productId),
        queryFn: () => import('@/services/products.api.js').then(m => m.productsApi.getById(productId)),
      });
    },
    
    prefetchProducts: (filters) => {
      return queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.productsList(filters),
        queryFn: () => import('@/services/products.api.js').then(m => m.productsApi.list(filters)),
      });
    },
  };
};

/**
 * Hook para obtener estado del cache
 */
export const useCacheStatus = () => {
  const queryClient = useQueryClient();

  const getQueryStatus = (queryKey) => {
    const query = queryClient.getQueryState(queryKey);
    return {
      isFetching: query?.isFetching ?? false,
      isStale: query?.isInvalidated ?? false,
      dataUpdatedAt: query?.dataUpdatedAt ?? null,
      errorUpdatedAt: query?.errorUpdatedAt ?? null,
    };
  };

  return {
    products: getQueryStatus(QUERY_KEYS.products),
    categories: getQueryStatus(QUERY_KEYS.categories),
    cart: getQueryStatus(QUERY_KEYS.cart),
    wishlist: getQueryStatus(QUERY_KEYS.wishlist),
    orders: getQueryStatus(QUERY_KEYS.orders),
  };
};

/**
 * Utilidad para configurar optimistic updates
 */
export const createOptimisticUpdate = (queryClient, queryKey) => {
  return {
    async onMutate(newData) {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot del estado anterior
      const previousData = queryClient.getQueryData(queryKey);
      
      // Actualizar cache optimisticamente
      queryClient.setQueryData(queryKey, newData);
      
      return { previousData };
    },
    
    onError(err, newData, context) {
      // Rollback al estado anterior
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    
    onSettled() {
      // Refetch para sincronizar con servidor
      queryClient.invalidateQueries({ queryKey });
    },
  };
};

/**
 * Hook para debugging de React Query
 */
export const useQueryDebug = () => {
  const queryClient = useQueryClient();

  return {
    logCache: () => {
      console.group('🔍 React Query Cache');
      const cache = queryClient.getQueryCache().getAll();
      for (const query of cache) {
        console.log({
          queryKey: query.queryKey,
          state: query.state,
          dataUpdatedAt: new Date(query.state.dataUpdatedAt),
          isStale: query.isStale(),
          isFetching: query.state.isFetching,
        });
      }
      console.groupEnd();
    },
    
    getTotalQueries: () => {
      return queryClient.getQueryCache().getAll().length;
    },
    
    getActiveQueries: () => {
      return queryClient.getQueryCache().getAll().filter(q => q.observersCount > 0).length;
    },
    
    getCacheSize: () => {
      const cache = queryClient.getQueryCache().getAll();
      const sizeEstimate = JSON.stringify(cache.map(q => q.state.data)).length;
      return `${(sizeEstimate / 1024).toFixed(2)} KB`;
    },
  };
};
