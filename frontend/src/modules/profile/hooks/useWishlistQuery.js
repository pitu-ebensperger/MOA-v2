import { useQuery, useMutation, useQueryClient } from '@config/react-query';
import { wishlistApi } from '@/services/wishlist.api.js';
import { toast } from '@/components/ui';
import { useAuth } from '@/context/AuthContext.jsx';

const WISHLIST_QUERY_KEY = ['wishlist'];

//Hook optimizado para obtener wishlist con React Query
export const useWishlistQuery = () => {
  const { token, status } = useAuth();
  const queryClient = useQueryClient();
  const isSessionReady = Boolean(token) && status === 'authenticated';

  const query = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: async () => {
      const data = await wishlistApi.get();
      return Array.isArray(data?.items) ? data.items : [];
    },
    enabled: isSessionReady, // Solo fetch si hay sesión
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
    // Limpiar wishlist al desloguear
    onError: (error) => {
      if (error?.status === 401) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, []);
      }
    },
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

/**
 * Hook para agregar producto a wishlist con optimistic update
 */
export const useAddToWishlistMutation = () => {
  const queryClient = useQueryClient();
  const { token, status } = useAuth();
  const isSessionReady = Boolean(token) && status === 'authenticated';

  return useMutation({
    mutationFn: (productId) => {
      if (!isSessionReady) {
        toast.info('Debes iniciar sesión para usar favoritos');
        throw new Error('No authenticated');
      }
      return wishlistApi.add(productId);
    },
    // Optimistic update
    onMutate: async (productId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      // Snapshot del estado anterior
      const previousWishlist = queryClient.getQueryData(WISHLIST_QUERY_KEY);

      // Optimistic update
      queryClient.setQueryData(WISHLIST_QUERY_KEY, (old = []) => {
        // Evitar duplicados
        if (old.some(item => item.producto_id === productId || item.id === productId)) {
          return old;
        }
        return [...old, { producto_id: productId }];
      });

      return { previousWishlist };
    },
    // Rollback en error
    onError: (err, productId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previousWishlist);
      }
      console.error('Error agregando a wishlist:', err);
    },
    // Refetch después de éxito para sincronizar
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
};

/**
 * Hook para remover producto de wishlist con optimistic update
 */
export const useRemoveFromWishlistMutation = () => {
  const queryClient = useQueryClient();
  const { token, status } = useAuth();
  const isSessionReady = Boolean(token) && status === 'authenticated';

  return useMutation({
    mutationFn: (productId) => {
      if (!isSessionReady) {
        throw new Error('No authenticated');
      }
      return wishlistApi.remove(productId);
    },
    // Optimistic update
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });
      
      const previousWishlist = queryClient.getQueryData(WISHLIST_QUERY_KEY);

      queryClient.setQueryData(WISHLIST_QUERY_KEY, (old = []) => 
        old.filter(item => 
          item.producto_id !== productId && 
          item.id !== productId
        )
      );

      return { previousWishlist };
    },
    onError: (err, productId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previousWishlist);
      }
      console.error('Error removiendo de wishlist:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
};

/**
 * Hook para verificar si producto está en wishlist
 */
export const useIsInWishlist = (productId) => {
  const { items } = useWishlistQuery();
  
  return items.some(item => 
    item.producto_id === productId || 
    item.id === productId
  );
};

/**
 * Hook para toggle wishlist (agregar/remover)
 */
export const useToggleWishlist = () => {
  const addMutation = useAddToWishlistMutation();
  const removeMutation = useRemoveFromWishlistMutation();
  const { items } = useWishlistQuery();

  const toggle = (product) => {
    const productId = product?.id ?? product?.producto_id;
    if (!productId) {
      console.warn('useToggleWishlist: productId inválido');
      return;
    }

    const isInWishlist = items.some(item => 
      item.producto_id === productId || 
      item.id === productId
    );

    if (isInWishlist) {
      removeMutation.mutate(productId);
    } else {
      addMutation.mutate(productId);
    }
  };

  return {
    toggle,
    isLoading: addMutation.isLoading || removeMutation.isLoading,
    isAdding: addMutation.isLoading,
    isRemoving: removeMutation.isLoading,
  };
};

/**
 * Hook para limpiar wishlist (invalidar cache)
 */
export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.setQueryData(WISHLIST_QUERY_KEY, []);
    queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
  };
};
