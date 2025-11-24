import { useQuery } from "@/lib/react-query-lite";
import { categoriesApi } from "@/services/categories.api.js";

export const ADMIN_CATEGORIES_QUERY_KEY = ["admin-categories"];

export function useAdminCategories() {
  const query = useQuery({
    queryKey: ADMIN_CATEGORIES_QUERY_KEY,
    queryFn: () => categoriesApi.list(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}
