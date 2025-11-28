import PropTypes from "prop-types";
import { memo } from "react";
import { Search } from "lucide-react";
import ProductCard from "@/modules/products/components/ProductCard.jsx"
import { useWishlistQuery, useToggleWishlist } from "@/modules/profile/hooks/useWishlistQuery.js"
import { ProductShape } from "@/utils/propTypes.js"
import {
  EmptyPlaceholder,
  EmptyPlaceholderDescription,
  EmptyPlaceholderIcon,
  EmptyPlaceholderTitle,
} from "@/components/ui/primitives";

const ProductGallery = memo(function ProductGallery({ products = [], onAddToCart }) {
  const { items: wishlist } = useWishlistQuery();
  const { toggle: toggleWishlist } = useToggleWishlist();

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholderIcon>
          <Search className="h-6 w-6" />
        </EmptyPlaceholderIcon>
        <EmptyPlaceholderTitle>No hay productos por ahora</EmptyPlaceholderTitle>
        <EmptyPlaceholderDescription>
          Ajusta los filtros o prueba una búsqueda distinta para encontrar lo que necesitas.
        </EmptyPlaceholderDescription>
      </EmptyPlaceholder>
    );
  }

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const isSaved = wishlist.some(
          (item) =>
            item.producto_id === product.id || item.id === product.id
        );

        return (
          <ProductCard
            key={product.id}
            product={product}
            isInWishlist={isSaved}
            onToggleWishlist={toggleWishlist}

            onAddToCart={() => onAddToCart(product)}
          />
        );
      })}
    </section>
  );
});

ProductGallery.propTypes = {
  products: PropTypes.arrayOf(ProductShape),
  onAddToCart: PropTypes.func,
};

export default ProductGallery;
