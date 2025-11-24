import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import PropTypes from 'prop-types';
import ProductCard from '@/modules/products/components/ProductCard.jsx';
import { useWishlistQuery, useToggleWishlist } from '@/modules/profile/hooks/useWishlistQuery.js';
import { ProductShape } from '@/utils/propTypes.js';

/** ProductGalleryVirtualized 
 * Renderiza solo los visibles en pantalla para mejorar rendimiento
 * @param {Array} products - Lista de productos a mostrar
 * @param {Function} onAddToCart - Callback para agregar al carrito
 * @param {number} itemHeight - Altura estimada de cada ProductCard (default: 450px)
 * @param {number} overscan - Número de items extra a renderizar arriba/abajo (default: 3)
 */
export function ProductGalleryVirtualized({ 
  products = [], 
  onAddToCart,
  itemHeight = 450,
  overscan = 3,
}) {
  const parentRef = useRef(null);
  const { items: wishlist } = useWishlistQuery();
  const { toggle: toggleWishlist } = useToggleWishlist();

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-300px)] overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const product = products[virtualRow.index];
          const isSaved = wishlist.some(
            (item) => item.producto_id === product.id || item.id === product.id
          );

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="px-3 pb-6">
                <ProductCard
                  product={product}
                  isInWishlist={isSaved}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={() => onAddToCart(product)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

ProductGalleryVirtualized.propTypes = {
  products: PropTypes.arrayOf(ProductShape),
  onAddToCart: PropTypes.func.isRequired,
  itemHeight: PropTypes.number,
  overscan: PropTypes.number,
};

export default ProductGalleryVirtualized;
