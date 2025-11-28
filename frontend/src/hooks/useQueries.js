import { useQuery } from "@hooks/useQuery.js";

export const useQueries = ({ queries }) => {
  if (!Array.isArray(queries)) {
    throw new Error("useQueries requiere un arreglo de queries");
  }
  return queries.map((queryOptions) => useQuery(queryOptions));
};
