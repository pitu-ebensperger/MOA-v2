import { useMemo } from "react";
import { useQuery } from "@config/react-query";
import { ordersAdminApi } from "@/services/ordersAdmin.api.js"

const buildAdminParams = ({ 
  page = 1, 
  limit = 20, 
  estado_pago = "", 
  estado_envio = "", 
  metodo_despacho = "",
  search = "",
  fecha_desde = "",
  fecha_hasta = ""
}) => {
  const safeLimit = Math.max(1, Number(limit) || 20);
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;

  const params = {
    limit: safeLimit,
    offset,
  };

  if (estado_pago) params.estado_pago = estado_pago;
  if (estado_envio) params.estado_envio = estado_envio;
  if (metodo_despacho) params.metodo_despacho = metodo_despacho;
  if (search) params.search = search;
  if (fecha_desde) params.fecha_desde = fecha_desde;
  if (fecha_hasta) params.fecha_hasta = fecha_hasta;

  return params;
};

export function useAdminOrders(options = {}) {
  const params = useMemo(
    () => buildAdminParams(options),
    [options],
  );

  const query = useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => ordersAdminApi.getAll(params),
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });

  const orders = query.data?.data ?? [];
  const pagination = query.data?.pagination ?? {};
  const total = pagination.total ?? 0;
  const limit = pagination.limit ?? params.limit;
  const offset = pagination.offset ?? 0;
  const pageNumber = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items: orders,
    orders,
    total,
    page: pageNumber,
    pageSize: limit,
    totalPages,
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}
