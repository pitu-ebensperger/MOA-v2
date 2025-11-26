import { createStrictContext } from "@/context/createStrictContext.js"
import { useWishlist } from "@/hooks/state/useWishlist"

// ============================================
// CONTEXTO Y HOOK
// ============================================

export const [WishlistContext, useWishlistContext] = createStrictContext("Wishlist", {
  displayName: "WishlistContext",
  errorMessage: "useWishlistContext debe usarse dentro de WishlistProvider",
});

// ============================================
// PROVIDER
// ============================================

export const WishlistProvider = ({ children }) => {
  const wishlistState = useWishlist();
  return (
    <WishlistContext.Provider value={wishlistState}>
      {children}
    </WishlistContext.Provider>
  );
};
