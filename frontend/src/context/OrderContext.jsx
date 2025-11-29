/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { useOrders } from "@/hooks/state/useOrders"

// Contexto estricto inline
const CONTEXT_NOT_SET = Symbol("STRICT_CONTEXT_NOT_SET");

const createStrictContext = (
  label = "Context",
  { displayName = `${label}Context`, errorMessage } = {},
) => {
  const Context = createContext(CONTEXT_NOT_SET);
  Context.displayName = displayName;

  const useStrictContext = () => {
    const ctx = useContext(Context);
    if (ctx === CONTEXT_NOT_SET) {
      throw new Error(errorMessage ?? `use${label} debe usarse dentro de ${label}Provider`);
    }
    return ctx;
  };

  return [Context, useStrictContext];
};

// Contexto y Hook
export const [OrderContext, useOrderContext] = createStrictContext("Order", {
  displayName: "OrderContext",
  errorMessage: "useOrderContext debe usarse dentro de OrderProvider",
});

// PROVIDER
export const OrderProvider = ({ children }) => {
  const orderState = useOrders();
  return (
    <OrderContext.Provider value={orderState}>
      {children}
    </OrderContext.Provider>
  );
};
