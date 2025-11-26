import { createStrictContext } from "@/context/createStrictContext.js"
import { useOrders } from "@/hooks/state/useOrders"

// ============================================
// CONTEXTO Y HOOK
// ============================================

export const [OrderContext, useOrderContext] = createStrictContext("Order", {
  displayName: "OrderContext",
  errorMessage: "useOrderContext debe usarse dentro de OrderProvider",
});

// ============================================
// PROVIDER
// ============================================

export const OrderProvider = ({ children }) => {
  const orderState = useOrders();
  return (
    <OrderContext.Provider value={orderState}>
      {children}
    </OrderContext.Provider>
  );
};
