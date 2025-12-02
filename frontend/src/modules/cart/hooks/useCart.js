import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext.jsx";
import { API_PATHS } from "@/config/app.routes.js";
import { alerts } from '@/utils/alerts.js';
import {
  useCartQuery,
  useAddToCart,
  useRemoveFromCart,
  useUpdateCartQuantity,
  useClearCart,
} from './useCartQuery.js';

// lightweight hook wrapper around React Query cart hooks

export const useCart = () => {
  const { token, status } = useAuth();
  const isSessionReady = Boolean(token) && status === "authenticated";

  // Use React Query based cart for server-backed persistence
  const { cartItems = [], isLoading } = useCartQuery();
  const addMutation = useAddToCart();
  const removeMutation = useRemoveFromCart();
  const updateMutation = useUpdateCartQuantity();
  const clearMutation = useClearCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const ensureAuthenticated = () => {
    if (isSessionReady) return true;
    globalThis.location.href = `${API_PATHS.auth.login}?authRequired=true`;
    return false;
  };

  // NOTE: normalization & enrichment are handled inside `useCartQuery`.

  // Cerrar drawer al desmontar el componente (prevenir memory leaks)
  useEffect(() => {
    return () => {
      setIsDrawerOpen(false);
    };
  }, []);

  // React Query handles fetching/enrichment; nothing else required here.

  const addToCart = async (product) => {
    if (!ensureAuthenticated()) return;
    const productId = product?.id ?? product?.producto_id;
    if (!productId) return;

    try {
      await addMutation.mutateAsync({ productId, quantity: 1 });
      const productName = product?.name || product?.nombre || 'Producto';
      alerts.success('Producto agregado', `${productName} se agregó al carrito`);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'No se pudo agregar el producto al carrito';
      alerts.error('Error al agregar producto', errorMsg);
      throw err;
    }
  };

  const removeFromCart = async (productId) => {
    if (!ensureAuthenticated()) return;
    try {
      await removeMutation.mutateAsync(productId);
    } catch (err) { // eslint-disable-line no-unused-vars
      // let caller handle/log if needed
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!ensureAuthenticated()) return;
    try {
      await updateMutation.mutateAsync({ productId, quantity });
    } catch (err) { // eslint-disable-line no-unused-vars
      // swallow; optimistic rollback handled in mutation
    }
  };

  const clearCart = async () => {
    if (!ensureAuthenticated()) return;
    try {
      await clearMutation.mutateAsync();
    } catch (err) { // eslint-disable-line no-unused-vars
      // ignore
    }
  };

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const total = useMemo(
    () =>
      (Array.isArray(cartItems) ? cartItems : []).reduce(
        (acc, item) => acc + (Number(item.price) || Number(item.precio_unit) || 0) * (item.quantity || 0),
        0,
      ),
    [cartItems],
  );

  return {
    cartItems,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    isLoading,
  };
};
