import { useQuery, useMutation, useQueryClient } from '@/lib/react-query-lite';
import { ordersApi } from '@/services/orders.api.js';

const ORDERS_QUERY_KEY = ['orders'];

/**
 * Hook para obtener órdenes del usuario
 * Cache: 2 minutos (órdenes pueden cambiar de estado)
 */
export const useOrders = (options = {}) => {
  const query = useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: () => ordersApi.getUserOrders(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 5 * 60 * 1000, // Auto-refetch cada 5 min si está montado
    ...options,
  });

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

/**
 * Hook para obtener orden individual
 * Cache: 1 minuto (puede cambiar estado/tracking)
 */
export const useOrder = (orderId, options = {}) => {
  const query = useQuery({
    queryKey: [...ORDERS_QUERY_KEY, 'detail', orderId],
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: Boolean(orderId),
    staleTime: 1 * 60 * 1000, // 1 minuto
    cacheTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 2 * 60 * 1000, // Refetch cada 2 min (tracking updates)
    ...options,
  });

  return {
    order: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
  };
};

/**
 * Hook para crear orden (mutation)
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => ordersApi.createOrder(orderData),
    onSuccess: (newOrder) => {
      // Invalidar lista de órdenes
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      
      // Agregar orden nueva al cache (optimistic update)
      queryClient.setQueryData([...ORDERS_QUERY_KEY, 'detail', newOrder.orden_id], newOrder);
      
      // Limpiar carrito después de crear orden
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Hook para cancelar orden
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => ordersApi.cancelOrder(orderId),
    onSuccess: (_, orderId) => {
      // Invalidar lista de órdenes y detalle específico
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEY, 'detail', orderId] });
    },
  });
};

/**
 * Hook para invalidar cache de órdenes
 */
export const useInvalidateOrders = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY }),
    invalidateOrder: (orderId) => queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEY, 'detail', orderId] }),
    refetchAll: () => queryClient.refetchQueries({ queryKey: ORDERS_QUERY_KEY }),
  };
};
