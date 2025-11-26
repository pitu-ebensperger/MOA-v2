import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { ShoppingCart, LogOut, LayoutDashboard, User } from "lucide-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { useCartContext } from '@/context/CartContext.jsx';
import { API_PATHS } from '@/config/api-paths.js';

const NAV_ITEMS = [
  { label: 'Inicio', href: API_PATHS.home.landing },
  { label: 'Productos', href: API_PATHS.products.products },
  { label: 'Categorías', href: API_PATHS.products.categories },
  { label: 'Contacto', href: API_PATHS.support.contact },
];

export function Navbar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { cartItems } = useCartContext();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY >= 90);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href) => location.pathname === href;

  const handleLogout = () => {
    logout();
    navigate(API_PATHS.home.landing);
  };

  return (
    <div className={`nav-container shadow-md fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md ${isScrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to={API_PATHS.home.landing}
          className="brand cursor-pointer transition-transform hover:scale-105"
          onClick={() => onNavigate?.('home')}
        >
          MOA
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`nav-items ${isActive(item.href) ? 'text-(--color-secondary1) underline underline-offset-4' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <>
              <Link to={API_PATHS.auth.register} className="nav-items nav-btn">Registrarme</Link>
              <Link to={API_PATHS.auth.login} className="nav-items nav-btn nav-btn-primary">Iniciar sesión</Link>
              <button
                type="button"
                aria-label="Carrito (requiere login)"
                className="nav-icon-bg relative"
                onClick={() => navigate(API_PATHS.auth.login, { state: { authRequired: true } })}
              >
                <ShoppingCart className="nav-icon" />
              </button>
            </>
          )}
          {isAuthenticated && (
            <>
              {isAdmin ? (
                <>
                  <Link
                    to={API_PATHS.admin.dashboard}
                    className="nav-btn nav-btn-primary flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="nav-icon-bg text-red-600"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="nav-icon" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    aria-label="Ver carrito"
                    className="nav-icon-bg relative"
                    onClick={() => navigate('/cart')}
                  >
                    <ShoppingCart className="nav-icon" />
                    {cartItems.length > 0 && (
                      <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-(--color-primary1) shadow-sm" />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="Ver perfil"
                    className="nav-icon-bg"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="nav-icon" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="nav-icon-bg text-red-600"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="nav-icon" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Navbar.propTypes = {
  onNavigate: PropTypes.func,
};
