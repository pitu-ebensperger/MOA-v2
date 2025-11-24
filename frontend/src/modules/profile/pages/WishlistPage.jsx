import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, RefreshCw, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "@/modules/products/components/ProductCard.jsx";
import { useProducts } from "@/modules/products/hooks/useProducts.js";
import { productsApi } from "@/services/products.api.js";
import { useWishlistQuery, useToggleWishlist, useClearWishlist } from "@/modules/profile/hooks/useWishlistQuery.js";
import { useCartContext } from "@/context/cart-context.js";
import { Button } from "@/components/shadcn/ui/button.jsx";
import { EmptyPlaceholder, EmptyPlaceholderDescription, EmptyPlaceholderIcon, EmptyPlaceholderTitle } from "@/components/shadcn/ui/empty-state.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/shadcn/ui/card.jsx";

// Limite ajustado a 100 (backend exige 1-100). Se filtra luego por ids en wishlist.
const WISHLIST_PRODUCT_FILTERS = Object.freeze({ limit: 100 });

export const WishlistPage = () => {
  const { addToCart } = useCartContext();
  const { items: wishlist, isLoading: isLoadingWishlist } = useWishlistQuery();
  const { toggle: toggleWishlist } = useToggleWishlist();
  const { clear: clearWishlist } = useClearWishlist();
  const { products = [], isLoading: isLoadingProducts, error: productsError, refetch } = useProducts(WISHLIST_PRODUCT_FILTERS);

  const [isClearing, setIsClearing] = useState(false);
  const [enrichedWishlistProducts, setEnrichedWishlistProducts] = useState([]);
  const [isEnriching, setIsEnriching] = useState(false);

  // Combina productos detallados con ids guardados en wishlist
  const wishlistProducts = useMemo(() => {
    if (!Array.isArray(products) || !Array.isArray(wishlist)) return [];
    return products.filter((p) => wishlist.some((w) => w.producto_id === p.id || w.id === p.id));
  }, [products, wishlist]);

  // Enriquecer productos que están en wishlist pero no llegaron en el listado (ej: límite 100)
  useEffect(() => {
    if (!Array.isArray(wishlist)) return;
    const idsInWishlist = wishlist.map((w) => w.producto_id ?? w.id).filter(Boolean);
    const idsAlreadyPresent = new Set(wishlistProducts.map((p) => p.id));
    const missingIds = idsInWishlist.filter((id) => !idsAlreadyPresent.has(id));
    if (!missingIds.length) {
      // Si no faltan, sincronizamos directamente con lista actual
      setEnrichedWishlistProducts(wishlistProducts);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setIsEnriching(true);
        console.log('[WishlistPage] Enrichment start. Missing IDs:', missingIds);
        const fetched = [];
        for (const id of missingIds) {
          try {
            const data = await productsApi.getById(id);
            if (data) fetched.push(data);
          } catch (err) {
            console.warn('[WishlistPage] Failed to enrich product id', id, err);
          }
        }
        if (cancelled) return;
        const merged = [...wishlistProducts, ...fetched];
        setEnrichedWishlistProducts(merged);
        console.log('[WishlistPage] Enrichment done. Added', fetched.length, 'products');
      } finally {
        if (!cancelled) setIsEnriching(false);
      }
    })();
    return () => { cancelled = true; };
  }, [wishlist, wishlistProducts]);

  const isLoading = isLoadingProducts || isLoadingWishlist || isEnriching;
  const error = productsError; // podríamos combinar errores si hubiera más

  const handleRefresh = useCallback(() => {
    refetch?.();
  }, [refetch]);

  const handleClearAll = useCallback(async () => {
    if (!wishlistProducts.length) return;
    
    const { confirm, toast } = await import('@/components/ui');
    const confirmed = await confirm.delete(
      "¿Limpiar todos los favoritos?",
      "Esta acción no se puede deshacer"
    );
    
    if (!confirmed) return;
    
    setIsClearing(true);
    try {
      await clearWishlist();
      toast.success("Favoritos limpiados correctamente");
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error("Error al limpiar favoritos");
    } finally {
      setTimeout(() => setIsClearing(false), 400);
    }
  }, [wishlistProducts.length, clearWishlist]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 mt-20">
      {/* Encabezado */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-(--color-primary2)">
            Lista de deseos
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearAll}
            disabled={isClearing || !wishlistProducts.length}
            className="inline-flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Estado: cargando */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={`wishlist-skeleton-${i}`} className="h-[404px] w-full" />
          ))}
        </div>
      )}

      {/* Estado: error */}
      {!isLoading && error && (
        <Card className="border-(--color-error) bg-(--color-error)/5 mb-10">
          <CardHeader>
            <CardTitle>Error al cargar favoritos</CardTitle>
            <CardDescription>Intenta nuevamente o recarga la página.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Estado: vacío */}
      {!isLoading && !error && enrichedWishlistProducts.length === 0 && (
        <EmptyPlaceholder className="mb-12">
          <EmptyPlaceholderIcon>
            <Heart className="h-10 w-10" />
          </EmptyPlaceholderIcon>
            <EmptyPlaceholderTitle>Aún no guardas productos</EmptyPlaceholderTitle>
          <EmptyPlaceholderDescription>
            Explora el catálogo y marca como favorito lo que te guste para verlo aquí.
          </EmptyPlaceholderDescription>
          <Link
            to="/productos"
            className="inline-flex items-center mt-2 gap-2 px-3 py-2 rounded-md border border-(--color-primary1) text-(--color-primary1) text-sm font-medium transition hover:bg-(--color-primary1) hover:text-white"
          >
            Buscar productos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </EmptyPlaceholder>
      )}

      {/* Lista de favoritos */}
      {!isLoading && !error && enrichedWishlistProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-(--color-text-secondary)">
              {enrichedWishlistProducts.length} producto{enrichedWishlistProducts.length === 1 ? "" : "s"} guardado{enrichedWishlistProducts.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {enrichedWishlistProducts.map((product) => {
              const inList = wishlist.some(
                (w) => String(w.producto_id ?? w.id) === String(product.id)
              );
              return (
                <div key={product.id} className="relative">
                  <ProductCard
                    product={product}
                    isInWishlist={inList}
                    onToggleWishlist={toggleWishlist}
                    onAddToCart={() => addToCart(product)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
};
