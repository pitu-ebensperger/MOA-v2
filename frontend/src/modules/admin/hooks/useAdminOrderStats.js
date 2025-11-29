import { useQuery } from "@config/react-query";
import { ordersAdminApi } from "@/services/ordersAdmin.api.js";

export function useAdminOrderStats(options = {}) {
  const { fecha_desde, fecha_hasta, enabled = true } = options;

  const params = {};
  if (fecha_desde) params.fecha_desde = fecha_desde;
  if (fecha_hasta) params.fecha_hasta = fecha_hasta;

  const query = useQuery({
    queryKey: ["admin-order-stats", params],
    queryFn: () => ordersAdminApi.getStats(params),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  return {
    stats: query.data?.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}