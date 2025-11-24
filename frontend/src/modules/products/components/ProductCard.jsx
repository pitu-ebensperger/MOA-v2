import PropTypes from "prop-types";
import { memo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import { Price } from "@/components/data-display/Price.jsx"
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/config/constants.js"
import { API_PATHS } from "@/config/api-paths.js"
import { useAuth } from "@/context/auth-context.js"
import { ProductShape } from "@/utils/propTypes.js"
import { useCacheManager } from "@/hooks/useCacheManager.js"
import { useToast } from "@/components/ui/useToast.js"

import { Button } from "@/components/ui/Button.jsx"
import Badge from "@/components/ui/Badge.jsx"

const ProductCard = memo(function ProductCard({
  product = {},
  onAddToCart = () => {},
  onToggleWishlist = () => {},
  isInWishlist = false,
  onViewDetails,
  showBadge = false,
  badgeText = "NUEVO",
}) {
  const { id, slug, price, name, imgUrl, gallery, stock } = product;
  const isOutOfStock = !stock || stock <= 0;

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const cache = useCacheManager();
  const { info } = useToast();
  const requiresAuth = !isAuthenticated;
  
  const displayTitle = name ?? slug ?? "Nombre Producto";
  const displayImage = imgUrl ?? gallery?.[0] ?? DEFAULT_PLACEHOLDER_IMAGE;
  const displayPrice = price ?? 50000;
  const productSlug = slug ?? (id ? String(id) : null);
  const baseProductsPath = API_PATHS.products.products;
  const href = productSlug ? API_PATHS.products.productDetail(productSlug) : baseProductsPath;

  const [isLiked, setIsLiked] = useState(Boolean(isInWishlist));
  const [isHovered, setIsHovered] = useState(false);
  const [cartButtonPressed, setCartButtonPressed] = useState(false);
  const [detailsButtonPressed, setDetailsButtonPressed] = useState(false);

  useEffect(() => {
    setIsLiked(Boolean(isInWishlist));
  }, [isInWishlist]);

  const handleWishlistToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      info("Inicia sesión para agregar a favoritos", { duration: 3800 });
      return;
    }
    setIsLiked(!isLiked);
    onToggleWishlist(product);
  };

  useEffect(() => {
    if (!cartButtonPressed) return undefined;
    const timer = setTimeout(() => setCartButtonPressed(false), 280);
    return () => clearTimeout(timer);
  }, [cartButtonPressed]);

  const handleViewDetails = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!href) return;
    setDetailsButtonPressed(true);
    setTimeout(() => {
      if (typeof onViewDetails === "function") {
        onViewDetails(product);
      } else {
        navigate(href);
      }
    }, 120);
  };

  useEffect(() => {
    if (!detailsButtonPressed) return undefined;
    const timer = setTimeout(() => setDetailsButtonPressed(false), 280);
    return () => clearTimeout(timer);
  }, [detailsButtonPressed]);

  return (
    <article
      className="
        group relative mx-auto h-[404px] w-full max-w-[270px]
        overflow-hidden rounded-[9px] shadow-[0_8px_18px_-12px_rgba(15,23,42,0.28)]
        bg-[#44311417]
        transition duration-300 ease-out
        hover:scale-[1.01]
      "
      onMouseEnter={() => {
        setIsHovered(true);
        // Prefetch product details on hover
        if (id) {
          cache.prefetchProduct(id);
        }
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen base */}
      <div className="absolute inset-0 size-full rounded-[10px] overflow-hidden bg-[#44311417]">
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayTitle}
            className="
              absolute inset-0 size-full object-cover rounded-[10px]
              transition-transform duration-500 group-hover:scale-[1.03]
            "
          />
        ) : (
          <div className="absolute inset-0 bg-(--color-light)" />
        )}
      </div>

      <div
        className="
          pointer-events-none absolute left-0 right-0 bottom-0 h-[55%]
          bg-linear-to-t
          from-[rgba(63,44,24,0.72)] to-[rgba(80,57,33,0)]
          mix-blend-normal
        "
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-black/0 rounded-[10px] transition-opacity duration-300 group-hover:bg-black/10"
        aria-hidden
      />

      {isOutOfStock ? (
        <Badge className="absolute top-[311px] left-[21px] z-30 h-[16.665px] w-[123px] bg-red-600 text-white">
          SIN STOCK
        </Badge>
      ) : showBadge ? (
        <Badge className="absolute top-[311px] left-[21px] z-30 h-[16.665px] w-[123px]">
          {badgeText}
        </Badge>
      ) : null}

      <div
        className={`absolute inset-0 z-20 bg-[rgba(60,45,27,0.5)] mix-blend-multiply transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-disabled={requiresAuth}
          title={requiresAuth ? "Inicia sesión para guardar favoritos" : isLiked ? "Quitar de favoritos" : "Agregar a favoritos"}
          className={`
            absolute right-4 top-4 z-30 flex size-10 items-center justify-center rounded-full
            bg-white/20 text-white backdrop-blur-md
            transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
            ${requiresAuth ? 'opacity-60 cursor-not-allowed' : ''}
          `}
          aria-label={isLiked ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={isLiked}
        >
          <Heart
            className={`h-5 w-5 stroke-white transition ${
              isLiked ? "fill-white" : "fill-transparent"
            }`}
            strokeWidth={1.8}
          />
        </button>

      {/* Capa clickeable al detalle (centro de la tarjeta) */}
      <Link to={href} className="absolute inset-0" aria-label={`Ver detalle de ${displayTitle}`} />

      <div
        className={`absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-3 transition-all duration-300 ${
          isHovered ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
          <Button
            type="button"
            appearance="soft"
            intent="primary"
            elevation="md"
            size="md"
            disabled={isOutOfStock}
            aria-disabled={isOutOfStock || requiresAuth}
            title={requiresAuth ? "Inicia sesión para agregar al carrito" : isOutOfStock ? "Sin stock" : "Agregar al carrito"}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (isOutOfStock) return;
              if (requiresAuth) {
                info("Debes iniciar sesión para agregar productos al carrito", { duration: 4000 });
                return;
              }
              setCartButtonPressed(true);
              onAddToCart(product);
            }}
            leadingIcon={
              <ShoppingCart
                size={18}
                className="text-current"
              />
            }
            className={`
              w-40 gap-3 transition-colors duration-200
              border border-(--color-lightest)
              ${cartButtonPressed 
                ? "bg-(--color-primary3) text-white" 
                : ""
              }
              ${(isOutOfStock || requiresAuth) ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {isOutOfStock ? "Sin stock" : requiresAuth ? "Inicia sesión" : "Agregar"}
          </Button>

        <Button
          type="button"
          appearance="outline"
          intent="inverse"
          size="md"
          onClick={handleViewDetails}
          disabled={!href}
          leadingIcon={<Eye size={18} className="text-current" />}
          className={`
            w-40 gap-3 transition-colors duration-200
            hover:bg-white/10
            ${!href ? "pointer-events-none opacity-40" : ""}
          `}
        >
          Ver detalles
        </Button>
      </div>

      {/* Texto (abajo) */}
      <div
        className={`absolute bottom-5 left-5 right-5 z-30 transition-opacity duration-300 ${
          isHovered ? "opacity-50" : "opacity-100"
        }`}
      >        <Price value={displayPrice} className="text-white text-xl font-regular" />
 <h3 className="mb-1 text-sm font-regular tracking-[-0.01em] text-white">
          {displayTitle}
        </h3>
       
      </div>
    </article>
  );
});

ProductCard.propTypes = {
  product: ProductShape,
  onAddToCart: PropTypes.func,
  onToggleWishlist: PropTypes.func,
  isInWishlist: PropTypes.bool,
  onViewDetails: PropTypes.func,
  showBadge: PropTypes.bool,
  badgeText: PropTypes.string,
};

export default ProductCard;
export { ProductCard };
