import { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

// ============================================
// CONTEXTOS DIVIDIDOS PARA OPTIMIZACIÓN
// ============================================
// En vez de un contexto gigante que re-renderiza todo,
// dividimos en 3 contextos independientes:
// 1. AuthStateContext: datos (user, token, status) - cambia poco
// 2. AuthActionsContext: funciones - nunca cambia
// 3. AuthMetaContext: flags derivados (isAdmin, isAuth) - cambia poco

const AuthStateContext = createContext(null);
const AuthActionsContext = createContext(null);
const AuthMetaContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState debe usarse dentro de AuthProvider');
  }
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthActions() {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error('useAuthActions debe usarse dentro de AuthProvider');
  }
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthMeta() {
  const context = useContext(AuthMetaContext);
  if (!context) {
    throw new Error('useAuthMeta debe usarse dentro de AuthProvider');
  }
  return context;
}

// Hook combinado para backwards compatibility
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const state = useAuthState();
  const actions = useAuthActions();
  const meta = useAuthMeta();
  
  return {
    ...state,
    ...actions,
    ...meta,
  };
}

/**
 * AuthProviderOptimized - Versión optimizada con contextos divididos
 * 
 * Reduce re-renders innecesarios al dividir en:
 * - State: datos que cambian (user, token, status)
 * - Actions: funciones que nunca cambian (login, logout)
 * - Meta: flags derivados (isAuthenticated, isAdmin)
 * 
 * Componentes que solo necesitan actions no se re-renderizarán
 * cuando el user cambie.
 */
export const AuthProviderOptimized = ({ 
  children,
  // Props del AuthProvider original
  user,
  token,
  status,
  error,
  login,
  register,
  logout,
  refreshProfile,
  isAdminRole,
}) => {
  // State context - cambia cuando user/token/status cambian
  const stateValue = useMemo(
    () => ({
      user,
      token,
      status,
      error,
    }),
    [user, token, status, error]
  );

  // Actions context - nunca cambia (funciones estables)
  const actionsValue = useMemo(
    () => ({
      login,
      register,
      logout,
      refreshProfile,
    }),
    [login, register, logout, refreshProfile]
  );

  // Meta context - flags derivados
  const metaValue = useMemo(
    () => ({
      isAuthenticated: !!token && !!user,
      isAdmin: isAdminRole(user),
      isLoading: status === 'loading',
    }),
    [token, user, status, isAdminRole]
  );

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        <AuthMetaContext.Provider value={metaValue}>
          {children}
        </AuthMetaContext.Provider>
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
};

AuthProviderOptimized.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
  token: PropTypes.string,
  status: PropTypes.string,
  error: PropTypes.string,
  login: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  refreshProfile: PropTypes.func.isRequired,
  isAdminRole: PropTypes.func.isRequired,
};
