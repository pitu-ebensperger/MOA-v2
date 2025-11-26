import React, { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { WifiOff } from 'lucide-react'

import { Navbar } from '@/components/layout/Navbar.jsx'
import { Footer } from '@/components/layout/Footer.jsx'
import { API_PATHS } from '@/config/api-paths.js'
import { AddressProvider } from '@/context/AddressContext.jsx'
import ErrorBoundary from '@/components/error/ErrorBoundary.jsx'
import { ScrollToTop } from '@/components/layout/ScrollToTop.jsx'
import { AdminRoute, ProtectedRoute } from '@/modules/auth/hooks/useAuth.jsx'
import { observability } from '@/services/observability.js';

// Eager load - Componentes críticos que se cargan inmediatamente
import { HomePage } from '@/modules/home/pages/HomePage.jsx'
import { CartDrawer } from '@/modules/cart/components/CartDrawer.jsx'

// Lazy load - Páginas principales
const CategoriesPage = lazy(() => import('@/modules/categories/pages/CategoriesPage.jsx'))
const ProductsPage = lazy(() => import('@/modules/products/pages/ProductsPage.jsx'))
const ProductDetailPage = lazy(() => import('@/modules/products/pages/ProductDetailPage.jsx'))
const CartPage = lazy(() => import('@/modules/cart/pages/CartPage.jsx'))
const CheckoutPage = lazy(() => import('@/modules/cart/pages/CheckoutPage.jsx'))

// Lazy load - Autenticación
const RegisterPage = lazy(() => import('@/modules/auth/pages/RegisterPage.jsx'))
const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage.jsx'))
const ForgotPasswordPage = lazy(() => import('@/modules/auth/pages/ForgotPasswordPage.jsx'))
const ResetPasswordPage = lazy(() => import('@/modules/auth/pages/ResetPasswordPage.jsx'))

// Lazy load - Perfil de usuario
const ProfilePage = lazy(() => import('@/modules/profile/pages/ProfilePage.jsx'))
const WishlistPage = lazy(() => import('@/modules/profile/pages/WishlistPage.jsx'))
const MyOrdersPage = lazy(() => import('@/modules/profile/pages/MyOrdersPage.jsx'))
const OrderConfirmationPage = lazy(() => import('@/modules/orders/pages/OrderConfirmationPage.jsx'))

// Lazy load - Soporte
const ContactPage = lazy(() => import('@/modules/support/pages/ContactPage.jsx'))
const FAQPage = lazy(() => import('@/modules/support/pages/FAQPage.jsx'))
const PrivacyPage = lazy(() => import('@/modules/support/pages/PrivacyPage.jsx'))
const TermsPage = lazy(() => import('@/modules/support/pages/TermsPage.jsx'))
const ReturnsAndExchangesPage = lazy(() => import('@/modules/support/pages/ReturnsAndExchangesPage.jsx'))
const LegalNoticePage = lazy(() => import('@/modules/support/pages/LegalNoticePage.jsx'))
const NotFoundPage = lazy(() => import('@/modules/support/pages/NotFoundPage.jsx'))
const ServerErrorPage = lazy(() => import('@/modules/support/pages/ServerErrorPage.jsx'))

// Lazy load - Admin (chunk separado grande)
const EntornoAdmin = lazy(() => import('@/modules/admin/components/EntornoAdmin.jsx'))
const AdminDashboardPage = lazy(() => import('@/modules/admin/pages/AdminDashboardPage.jsx'))
const OrdersAdminPage = lazy(() => import('@/modules/admin/pages/orders/OrdersAdminPageV2.jsx'))
const OrderDetailPage = lazy(() => import('@/modules/admin/pages/orders/OrderDetailPage.jsx'))
const AdminProductsPage = lazy(() => import('@/modules/admin/pages/AdminProductsPage.jsx'))
const AdminCategoriesPage = lazy(() => import('@/modules/admin/pages/AdminCategoriesPage.jsx'))
const CustomersPage = lazy(() => import('@/modules/admin/pages/CustomersPage.jsx'))
const StoreSettingsPage = lazy(() => import('@/modules/admin/pages/StoreSettingsPage.jsx'))

import '@/styles/global.css'
import '@/styles/tokens.css'
import '@/styles/components/buttons.css'
import '@/styles/sweetalert.css'

// Componente de loading para páginas
const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="text-center space-y-4">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-(--color-primary1,#6B5444)"></div>
      <p className="text-sm text-(--text-weak)">Cargando...</p>
    </div>
  </div>
)

// Componente de error para lazy loading fallido
const LazyLoadError = () => {
  React.useEffect(() => {
    // Auto-reload después de 100ms si es error de HMR
    const timer = setTimeout(() => {
      if (import.meta.hot) {
        console.log('[HMR] Auto-recargando por error de módulo...');
        window.location.reload();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center mb-2">
          <WifiOff className="h-16 w-16 text-(--color-error)" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-(--text-strong)">Recargando módulo...</h2>
        <p className="text-sm text-(--text-weak)">
          Detectamos una actualización. La página se recargará automáticamente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 text-sm bg-(--color-primary1) text-white rounded-full hover:bg-(--color-hover) transition-colors shadow-sm hover:shadow-md"
        >
          Recargar ahora
        </button>
      </div>
    </div>
  );
}

// ErrorBoundary específico para Suspense (captura errores de lazy loading)
class SuspenseErrorBoundary extends ErrorBoundary {
  render() {
    if (this.state.hasError) {
      return <LazyLoadError />;
    }
    return this.props.children;
  }
}

export const App = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const { home, auth, products, support, admin } = API_PATHS

  // Global error handlers
  useEffect(() => {
    // Captura errores síncronos no manejados (window.onerror)
    const handleError = (event) => {
      console.error('[Global Error Handler]', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });

      // Enviar a servicio de logging en producción
      if (import.meta.env.PROD) {
        observability.captureException(event.error || event.message, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      }

      // No prevenir el comportamiento por defecto para que ErrorBoundary lo capture
      // return true; // Esto evitaría que se propague
    };

    // Captura promesas rechazadas sin .catch() (unhandledrejection)
    const handleUnhandledRejection = (event) => {
      console.error('[Unhandled Promise Rejection]', {
        reason: event.reason,
        promise: event.promise,
      });

      // Enviar a servicio de logging en producción
      if (import.meta.env.PROD) {
        observability.captureException(event.reason, {
          type: 'unhandledrejection',
        });
      }

      // Prevenir que el error se muestre en consola por defecto
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <AddressProvider>
          <div className="min-h-screen w-full overflow-x-hidden bg-(--color-light)">
            {!isAdminRoute && <Navbar />}
            {!isAdminRoute && <CartDrawer />}
            <ScrollToTop />
            <main className='main w-full'>
          <SuspenseErrorBoundary>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path={home.landing} element={<HomePage />} />
              <Route path='/cart' element={<CartPage />} />
              <Route path='/checkout' element={<CheckoutPage />} />
              <Route path={products.categories} element={<CategoriesPage />} />
              <Route path={products.products} element={<ProductsPage />} />
              <Route path={products.productDetail(':id')} element={<ProductDetailPage />} />
              <Route path={auth.login} element={<LoginPage />} />
              <Route path={auth.register} element={<RegisterPage />} />
              <Route path={auth.forgot} element={<ForgotPasswordPage />} />
              <Route path={auth.reset} element={<ResetPasswordPage />} />
              <Route path='/order-confirmation/:orderId' element={<OrderConfirmationPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path={auth.profile} element={<ProfilePage />} />
                <Route path='/profile' element={<ProfilePage />} />
                <Route path='/wishlist' element={<WishlistPage />} />
                <Route path='/myorders' element={<MyOrdersPage />} />
              </Route>
              <Route path={support.contact} element={<ContactPage />} /> 
              <Route path={support.privacy} element={<PrivacyPage />} /> 
              <Route path={support.terms} element={<TermsPage />} /> 
              <Route path={support.faq} element={<FAQPage />} /> 
              <Route path={support.returns} element={<ReturnsAndExchangesPage />} /> 
              <Route path={support.legalNotice} element={<LegalNoticePage />} /> 
              <Route path='*' element={<NotFoundPage />} />

              <Route element={<AdminRoute />}>
                <Route path={admin.dashboard} element={<EntornoAdmin><AdminDashboardPage /></EntornoAdmin>} />
                <Route path={admin.orders} element={<EntornoAdmin><OrdersAdminPage /></EntornoAdmin>} />
                <Route path="/admin/orders/:orderId" element={<EntornoAdmin><OrderDetailPage /></EntornoAdmin>} />
                <Route path={admin.products} element={<EntornoAdmin><AdminProductsPage /></EntornoAdmin>} />
                <Route path={admin.categories} element={<EntornoAdmin><AdminCategoriesPage /></EntornoAdmin>} />
                <Route path={admin.customers} element={<EntornoAdmin><CustomersPage /></EntornoAdmin>} />
                <Route path={admin.settings} element={<EntornoAdmin><StoreSettingsPage /></EntornoAdmin>} />
              </Route>
            
            {/* Error Routes */}
              <Route path="/error/500" element={<ServerErrorPage statusCode={500} />} />
              <Route path="/error/502" element={<ServerErrorPage statusCode={502} />} />
              <Route path="/error/503" element={<ServerErrorPage statusCode={503} />} />
              <Route path="/error/504" element={<ServerErrorPage statusCode={504} />} />
            </Routes>
          </Suspense>
          </SuspenseErrorBoundary>
        </main>
            {!isAdminRoute && <Footer />}
          </div>
        </AddressProvider>
    </ErrorBoundary>
  )
}
