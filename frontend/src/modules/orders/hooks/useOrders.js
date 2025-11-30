import { useQuery, useMutation, useQueryClient } from '@/config/query.client.config.js';
import { getUserOrders, getOrderById, createOrder, cancelOrder } from '@/services/checkout.api.js';

const ORDERS_QUERY_KEY = ['orders'];

export const useOrders = (options = {}) => {
  const query = useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: () => getUserOrders(),
    staleTime: 2 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
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

export const useOrder = (orderId, options = {}) => {
  const query = useQuery({
    queryKey: [...ORDERS_QUERY_KEY, 'detail', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: Boolean(orderId),
    staleTime: 1 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    ...options,
  });

  return {
    order: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
  };
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => createOrder(orderData),
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.setQueryData([...ORDERS_QUERY_KEY, 'detail', newOrder.orden_id], newOrder);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => cancelOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEY, 'detail', orderId] });
    },
  });
};

export const useInvalidateOrders = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY }),
    invalidateOrder: (orderId) => queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEY, 'detail', orderId] }),
    refetchAll: () => queryClient.refetchQueries({ queryKey: ORDERS_QUERY_KEY }),
  };
};
