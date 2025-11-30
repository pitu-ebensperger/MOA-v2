import { useQuery, useMutation, useQueryClient } from '@/config/query.client.config.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { cartApi } from '@/services/cart.api.js';
import { productsApi } from '@/services/products.api.js';


const CART_QUERY_KEY = ['cart'];

// Normalizar items del carrito
const normalizeCartItem = (item) => ({
  id: item.producto_id ?? item.product_id ?? item.id,
  quantity: Number(item.cantidad ?? item.quantity ?? 0),
  price: Number(item.precio_unit ?? item.precio ?? item.price ?? 0),
  ...item,
});

// Enriquecer items con datos de producto si faltan
const enrichCartItems = async (items) => {
  const enriched = [];
  for (const item of items) {
    const hasBasicData = item.name && item.imgUrl;
    if (hasBasicData) {
      enriched.push(item);
      continue;
    }
    try {
      const productDetail = await productsApi.getById(item.id);
      enriched.push({ ...item, ...productDetail });
    } catch (e) {
      console.warn('[Cart] Failed to enrich item', item.id, e);
      enriched.push(item);
    }
  }
  return enriched;
};

// Fetch carrito del backend
const fetchCart = async () => {
  const data = await cartApi.get();
  if (!Array.isArray(data?.items)) return [];
  
  const normalized = data.items.map(normalizeCartItem);
  const enriched = await enrichCartItems(normalized);
  return enriched;
};

export const useCartQuery = () => {
  const { token, status } = useAuth();
  const isAuthenticated = Boolean(token) && status === 'authenticated';

  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCart,
    enabled: isAuthenticated, // Solo fetch si está autenticado
    staleTime: 2 * 60 * 1000, // 2 minutos - carrito puede cambiar
    cacheTime: 10 * 60 * 1000, // 10 minutos en memoria
    retry: 1, // Solo 1 reintento para carrito
  });

  return {
    cartItems: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
  };
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }) => {
      const response = await cartApi.add(productId, quantity);
      return response?.item ? normalizeCartItem(response.item) : null;
    },
    onMutate: async ({ productId, quantity }) => {
      // Cancelar queries en vuelo
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      // Snapshot del estado anterior (para rollback)
      const previousCart = queryClient.getQueryData(CART_QUERY_KEY);

      // Optimistic update: actualizar caché inmediatamente
      queryClient.setQueryData(CART_QUERY_KEY, (old = []) => {
        const existing = old.find((item) => item.id === productId);
        if (existing) {
          return old.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        // Si es nuevo, agregar con datos básicos (se enriquecerá después)
        return [...old, { id: productId, quantity }];
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      // Rollback en caso de error
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSuccess: () => {
      // Refetch para obtener datos completos del backend
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }) => {
      if (quantity <= 0) {
        await cartApi.remove(productId);
        return null;
      }
      const response = await cartApi.updateQuantity(productId, quantity);
      return response?.item ? normalizeCartItem(response.item) : null;
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData(CART_QUERY_KEY);

      queryClient.setQueryData(CART_QUERY_KEY, (old = []) => {
        if (quantity <= 0) {
          return old.filter((item) => item.id !== productId);
        }
        return old.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) => cartApi.remove(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData(CART_QUERY_KEY);

      queryClient.setQueryData(CART_QUERY_KEY, (old = []) =>
        old.filter((item) => item.id !== productId)
      );

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => {
      queryClient.setQueryData(CART_QUERY_KEY, []);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};
