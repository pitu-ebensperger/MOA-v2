import { createStrictContext } from "@/context/createStrictContext.js"
import { useCart } from "@/modules/cart/hooks/useCart"

// ============================================
// CONTEXTO Y HOOK
// ============================================

export const [CartContext, useCartContext] = createStrictContext("Cart", {
  displayName: "CartContext",
  errorMessage: "useCartContext debe usarse dentro de CartProvider",
});

// ============================================
// PROVIDER
// ============================================

export const CartProvider = ({ children }) => {
  const cartState = useCart();
  return (
    <CartContext.Provider value={cartState}>
      {children}
    </CartContext.Provider>
  );
};
