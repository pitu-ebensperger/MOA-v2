import { createContext, useContext } from "react";

export const QueryClientContext = createContext(null);

export const useQueryClientContext = () => {
  const ctx = useContext(QueryClientContext);
  if (!ctx) {
    throw new Error("useQueryClient debe usarse dentro de QueryClientProvider");
  }
  return ctx;
};
