import { createContext, useContext } from "react";
import { useWishlist } from "@/hooks/state/useWishlist"

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
export const [WishlistContext, useWishlistContext] = createStrictContext("Wishlist", {
  displayName: "WishlistContext",
  errorMessage: "useWishlistContext debe usarse dentro de WishlistProvider",
});

// Provider
export const WishlistProvider = ({ children }) => {
  const wishlistState = useWishlist();
  return (
    <WishlistContext.Provider value={wishlistState}>
      {children}
    </WishlistContext.Provider>
  );
};
