import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Trash2 } from "lucide-react";
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/config/constants.js";
import { formatCurrencyCLP } from "@/utils/currency.js";
import { useRemoveFromWishlistMutation } from "@/modules/profile/hooks/useWishlistQuery.js";

const normalizeWishlistProduct = (product, index) => {
  if (!product || typeof product !== "object") {
    return {
      id: `wishlist-${index}`,
      name: `Producto ${index + 1}`,
      price: 0,
      img: DEFAULT_PLACEHOLDER_IMAGE,
    };
  }

  const price = Number(product.price ?? 0);
  return {
    id: product.id ?? product.slug ?? `wishlist-${index}`,
    name: product.name ?? product.slug ?? `Producto ${index + 1}`,
    price: Number.isFinite(price) ? price : 0,
    img: product.img ?? product.imgUrl ?? product.gallery?.[0] ?? DEFAULT_PLACEHOLDER_IMAGE,
  };
};

// Compact Horizontal Wishlist Card
const WishlistCard = ({ product, onRemove }) => {
  const removeMutation = useRemoveFromWishlistMutation();

  const handleRemove = () => {
    try {
      removeMutation.mutate(product.id, {
        onSuccess: () => {
          if (onRemove) onRemove(product.id);
        },
        onError: (err) => {
          console.error('Error removing from wishlist:', err);
        }
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  return (
    <div className="group relative flex gap-4 rounded-2xl bg-white/75 p-4 transition-all hover:bg-white hover:shadow-md">
      {/* Image */}
      <Link to={`/productos/${product.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        <img
          src={product.img || DEFAULT_PLACEHOLDER_IMAGE}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <Link to={`/productos/${product.id}`} className="block">
            <h3 className="line-clamp-2 text-sm font-semibold text-(--text-strong) transition-colors group-hover:text-(--color-primary1)">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-base font-bold text-(--color-primary1)">
            {formatCurrencyCLP(product.price)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to={`/productos/${product.id}`}
            className="group/btn flex h-8 w-8 items-center justify-center rounded-full bg-(--color-primary4) text-(--color-primary1) transition-all hover:bg-(--color-primary1) hover:text-white"
            title="Ver producto"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            className="group/btn flex h-8 w-8 items-center justify-center rounded-full bg-(--color-primary4) text-(--color-primary1) transition-all hover:bg-(--color-primary1) hover:text-white"
            title="Agregar al carrito"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
          <button
            onClick={handleRemove}
            className="group/btn flex h-8 w-8 items-center justify-center rounded-full bg-(--color-error)/10 text-(--color-error) transition-all hover:bg-(--color-error) hover:text-white"
            title="Eliminar de favoritos"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const WishlistSection = ({ products = [], isLoading = false, error = null, onRemove }) => {
  const sample = (Array.isArray(products) ? products : []).slice(0, 6).map(normalizeWishlistProduct);
  const hasItems = sample.length > 0;

  return (
    <section className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-(--text-strong)">Mis Favoritos</h2>
          <p className="text-sm text-(--text-secondary1) mt-1">Productos que te gustan</p>
        </div>
        <Link
          to="/wishlist"
          className="px-3 py-1 rounded-full bg-(--color-primary4) text-(--color-primary1) text-sm font-medium transition-all hover:bg-(--color-primary1) hover:text-white"
        >
          Ver más
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 rounded-3xl bg-(--color-light)">
        {isLoading && (
          <p className="text-center text-sm text-(--text-secondary1) py-8">Cargando favoritos...</p>
        )}
        {!isLoading && error && (
          <div className="text-center py-8">
            <p role="alert" className="text-sm text-(--color-error)">
              No pudimos cargar tus favoritos. Intenta nuevamente.
            </p>
          </div>
        )}
        {!isLoading && !error && hasItems ? (
          <div className="space-y-3">
            {sample.map((product) => (
              <WishlistCard key={product.id} product={product} onRemove={onRemove} />
            ))}
          </div>
        ) : null}
        {!isLoading && !error && !hasItems && (
          <div className="rounded-2xl border border-dashed border-(--color-primary1)/30 bg-(--color-primary4)/30 p-12 text-center">
            <Heart className="mx-auto mb-3 h-12 w-12 text-(--color-primary1)/30" />
            <p className="text-sm text-(--text-secondary1)">Aún no tienes productos guardados en favoritos.</p>
            <Link to="/productos" className="inline-block mt-4 text-sm text-(--color-primary1) font-medium hover:underline">
              Explorar productos
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

WishlistCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    img: PropTypes.string,
  }).isRequired,
  onRemove: PropTypes.func,
};

WishlistSection.propTypes = {
  products: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.any,
  onRemove: PropTypes.func,
};

export default WishlistSection;
