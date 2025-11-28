import { createContext, useContext } from "react";
import { useCart } from "@/modules/cart/hooks/useCart"

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
export const [CartContext, useCartContext] = createStrictContext("Cart", {
  displayName: "CartContext",
  errorMessage: "useCartContext debe usarse dentro de CartProvider",
});

// Provider
export const CartProvider = ({ children }) => {
  const cartState = useCart();
  return (
    <CartContext.Provider value={cartState}>
      {children}
    </CartContext.Provider>
  );
};
