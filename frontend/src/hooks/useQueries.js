import { useQuery } from "@hooks/useQuery.js";

export const useQueries = ({ queries }) => {
  if (!Array.isArray(queries)) {
    throw new Error("useQueries requiere un arreglo de queries");
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return queries.map((queryOptions) => useQuery(queryOptions));
};
