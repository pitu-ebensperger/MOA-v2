/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

// Contexto
export const QueryClientContext = createContext(null);

// Hook
export const useQueryClient = () => {
  const ctx = useContext(QueryClientContext);
  if (!ctx) {
    throw new Error("useQueryClient debe usarse dentro de QueryClientProvider");
  }
  return ctx;
};

// Provider
export const QueryClientProvider = ({ client, children }) => {
  if (!client) {
    throw new Error("QueryClientProvider requiere un cliente");
  }
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
};

QueryClientProvider.propTypes = {
  client: PropTypes.shape({
    fetchQuery: PropTypes.func.isRequired,
  }).isRequired,
  children: PropTypes.node,
};
