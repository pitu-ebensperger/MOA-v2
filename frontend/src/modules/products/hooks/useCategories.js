import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@config/react-query';
import { productsApi } from '@/services/products.api.js'
import { normalizeCategoryList } from '@/utils/normalizers.js'

const CATEGORIES_QUERY_KEY = ['categories'];

export function useCategories({ enabled = true } = {}) {
  const normalizedEnabled = useMemo(() => Boolean(enabled), [enabled]);
  
  const query = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => normalizeCategoryList(await productsApi.listCategories()),
    enabled: normalizedEnabled,
    // Configuración agresiva de cache - categorías rara vez cambian
    staleTime: Infinity, // Nunca marcar como stale (casi estático)
    cacheTime: 30 * 60 * 1000, // 30 minutos en cache
    refetchOnMount: false, // No refetch al montar
    refetchOnWindowFocus: false, // No refetch al enfocar
    refetchOnReconnect: false, // No refetch al reconectar
  });

  return {
    categories: query.data ?? [],
    isLoading: normalizedEnabled ? query.isLoading : false,
    error: normalizedEnabled ? query.error ?? null : null,
    refresh: query.refetch,
    isFetching: query.isFetching,
  };
}

// Hook para obtener categoría individual
export function useCategory(categoryId) {
  const { categories } = useCategories();
  
  return useMemo(() => {
    const category = categories.find(cat => 
      cat.id === categoryId || cat.categoria_id === categoryId
    );
    return category ?? null;
  }, [categories, categoryId]);
}

// Hook para invalidar cache de categorías (útil después de crear/editar)
export function useInvalidateCategories() {
  const queryClient = useQueryClient();
  
  return {
    invalidate: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
    refetch: () => queryClient.refetchQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  };
}
