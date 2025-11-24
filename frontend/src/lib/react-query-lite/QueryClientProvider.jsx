import PropTypes from "prop-types";
import { QueryClientContext } from "./context.js";

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
