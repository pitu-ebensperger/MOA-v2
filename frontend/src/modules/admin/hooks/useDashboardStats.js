import { useQuery } from '@config/react-query';
import { apiClient } from '@/services/api-client';
import { env } from '@/config/env.js';

const extractPayload = (response) => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  return response;
};

const referenceDate = env.DASHBOARD_REFERENCE_DATE;
const referenceKey = referenceDate || 'auto';

const withReferenceDate = (params = {}) => {
  if (!referenceDate) return params;
  return { ...params, referenceDate };
};

export function useDashboardStats(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'stats', periodo, referenceKey],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/dashboard/stats`, {
        params: withReferenceDate({ periodo }),
      });
      return extractPayload(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
}

export function usePaymentMethodStats(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'payment-methods', periodo, referenceKey],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/dashboard/payment-methods`, {
        params: withReferenceDate({ periodo }),
      });
      return extractPayload(response);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

export function useShippingMethodStats(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'shipping-methods', periodo, referenceKey],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/dashboard/shipping-methods`, {
        params: withReferenceDate({ periodo }),
      });
      return extractPayload(response);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

export function useDashboardKPIs(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', periodo, referenceKey],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/dashboard/kpis`, {
        params: withReferenceDate({ periodo }),
      });
      return extractPayload(response);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

export function useTopProducts(periodo = 30, limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'top-products', periodo, limit, referenceKey],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/dashboard/top-products`, {
        params: withReferenceDate({ periodo, limit }),
      });
      return extractPayload(response);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

export function useSalesEvolution(periodo = 30) {
  return useQuery({
    queryKey: ['dashboard', 'sales-evolution', periodo, referenceKey],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/dashboard/sales-evolution`, {
        params: withReferenceDate({ periodo }),
      });
      return extractPayload(response);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

export function useOrdersByStatus() {
  return useQuery({
    queryKey: ['dashboard', 'orders-by-status', referenceKey],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/dashboard/orders-by-status`, {
        params: withReferenceDate(),
      });
      return extractPayload(response);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}
