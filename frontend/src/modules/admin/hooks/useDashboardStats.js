import { useQuery } from '@/lib/react-query-lite';
import { apiClient } from '@/services/api-client';

/**
 * Hook para obtener estadísticas generales del dashboard
 */
export function useDashboardStats(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'stats', periodo],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/dashboard/stats?periodo=${periodo}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
}

/**
 * Hook para obtener estadísticas por método de pago
 */
export function usePaymentMethodStats(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'payment-methods', periodo],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/dashboard/payment-methods?periodo=${periodo}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

/**
 * Hook para obtener estadísticas por método de envío
 */
export function useShippingMethodStats(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'shipping-methods', periodo],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/dashboard/shipping-methods?periodo=${periodo}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

/**
 * Hook para obtener KPIs principales del dashboard
 */
export function useDashboardKPIs(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', periodo],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/dashboard/kpis?periodo=${periodo}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

/**
 * Hook para obtener top productos más vendidos
 */
export function useTopProducts(periodo = 30, limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'top-products', periodo, limit],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/dashboard/top-products?periodo=${periodo}&limit=${limit}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

/**
 * Hook para obtener evolución de ventas
 */
export function useSalesEvolution(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'sales-evolution', periodo],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/dashboard/sales-evolution?periodo=${periodo}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

/**
 * Hook para obtener distribución de órdenes por estado
 */
export function useOrdersByStatus() {
  return useQuery({
    queryKey: ['dashboard', 'orders-by-status'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/dashboard/orders-by-status`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}
