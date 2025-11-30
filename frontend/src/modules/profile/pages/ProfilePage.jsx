import { useEffect, useState } from "react";
import UserInfoSection from '../components/UserInfoSection.jsx';
import WishlistSection from '../components/WishlistSection.jsx';
import MyOrdersSection from '../components/MyOrdersSection.jsx';
import { AddressesSection } from '../components/AddressesSection.jsx';
import { useUserOrders } from '../../../hooks/useUserOrders.js';
import { useQueryClient } from '@/config/query.client.config.js';
import { useWishlistQuery } from '../hooks/useWishlistQuery.js';
import { useErrorHandler } from '@/hooks/useErrorHandler.js';
import { useCartContext } from '@/context/CartContext.jsx';

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { addToCart } = useCartContext();
  const { items: wishlistItems, isLoading: isLoadingWishlist, error: wishlistError } = useWishlistQuery();
  const [activeTab, setActiveTab] = useState('overview'); // overview, addresses
  const { handleError } = useErrorHandler({
    showAlert: false,
    defaultMessage: 'No pudimos recuperar tu información. Intenta nuevamente.',
  });

  // Limpieza de seguridad: remover overlays trabados al montar
  useEffect(() => {
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = '';
      document.body.style.removeProperty('overflow');
    }
  }, []);

  useEffect(() => {
    if (wishlistError) {
      handleError(wishlistError, 'No pudimos cargar tus favoritos');
    }
  }, [wishlistError, handleError]);

  const handleRemoveFromWishlist = () => {
    // The actual removal is performed inside the card (wishlistApi.remove),
    // so simply invalidate the wishlist query to refetch fresh data.
    queryClient.invalidateQueries({ queryKey: ['wishlist'] });
  };

  const {
    orders = [],
    isLoading,
    error,
  } = useUserOrders({ limit: 4 });

  useEffect(() => {
    if (error) {
      handleError(error, 'No pudimos cargar tus últimas órdenes');
    }
  }, [error, handleError]);

  return (
    <div className="min-h-screen bg-(--color-light) pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
        <UserInfoSection />

        {/* Tabs de navegación */}
        <div className="border-b border-(--border)">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-(--color-primary1) text-(--color-primary1)'
                  : 'border-transparent text-(--text-secondary1) hover:text-(--text-strong) hover:border-(--border)'
              }`}
            >
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'addresses'
                  ? 'border-(--color-primary1) text-(--color-primary1)'
                  : 'border-transparent text-(--text-secondary1) hover:text-(--text-strong) hover:border-(--border)'
              }`}
            >
              Mis Direcciones
            </button>
          </nav>
        </div>

        {/* Contenido según tab activo */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <WishlistSection 
              products={wishlistItems} 
              isLoading={isLoadingWishlist} 
              error={wishlistError}
              onRemove={handleRemoveFromWishlist}
              onAddToCart={addToCart}
            />

            <MyOrdersSection 
              orders={orders} 
              isLoading={isLoading} 
              error={error} 
            />
          </div>
        )}

        {activeTab === 'addresses' && (
          <AddressesSection />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
