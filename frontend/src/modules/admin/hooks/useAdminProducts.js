import { useMemo } from "react";
import { useQuery } from "@/config/query.client.config.js";
import { productsApi } from "@/services/products.api.js"

const ADMIN_PRODUCTS_QUERY_KEY = ["admin-products"];

const buildAdminParams = ({
  page = 1,
  limit = 20,
  search = "",
  status = "",
  categoryId = "",
  onlyLowStock = false,
}) => {
  const safeLimit = Math.max(1, limit);
  const safePage = Math.max(1, page);

  const params = {
    offset: (safePage - 1) * safeLimit,
    limit: safeLimit,
    scope: "admin",
  };

  if (search.trim()) params.search = search.trim();
  if (status) params.status = status;
  if (categoryId) params.categoryId = categoryId;
  if (onlyLowStock) params.low_stock = true;

  return params;
};

export function useAdminProducts({ page, limit, search, status, categoryId, onlyLowStock }) {
  const params = useMemo(
    () => buildAdminParams({ page, limit, search, status, categoryId, onlyLowStock }),
    [page, limit, search, status, categoryId, onlyLowStock],
  );

  const queryKey = useMemo(() => [...ADMIN_PRODUCTS_QUERY_KEY, params], [params]);

  const query = useQuery({
    queryKey,
    queryFn: () => productsApi.list(params),
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? items.length;

  const offset = query.data?.page?.offset ?? params.offset;
  const pageSize = query.data?.page?.limit ?? params.limit;
  const pageNumber = Math.floor(offset / pageSize) + 1;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    total,
    page: pageNumber,
    pageSize,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}

// Fetch completo sin paginación para exportación
export async function fetchAllAdminProducts({ search = "", status = "", categoryId = "", onlyLowStock = false }) {
  const params = {
    scope: "admin",
    limit: 10000, // Límite alto para obtener todos los productos
  };

  if (search.trim()) params.search = search.trim();
  if (status) params.status = status;
  if (categoryId) params.categoryId = categoryId;
  if (onlyLowStock) params.low_stock = true;

  return await productsApi.list(params);
}
