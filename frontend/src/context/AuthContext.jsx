/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useLayoutEffect, useRef } from "react";
import { useQueryClient } from '@/config/query.client.config.js';
import PropTypes from "prop-types";
import { setOnUnauthorized, setTokenGetter } from "@/services/api-client.js"
import { authApi } from "@/services/auth.api.js"
import { usePersistentState } from "@/hooks/usePersistentState.js"
import { useNavigate } from "react-router-dom";
import { observability } from '@/services/observability.js';
import { useSessionMonitor } from "@/hooks/useSessionMonitor.js";
import { SessionExpirationDialog } from "@/modules/auth/components/SessionExpirationDialog.jsx";
import { Alert } from "@/components/ui";

// Contexto estricto inline
const CONTEXT_NOT_SET = Symbol("STRICT_CONTEXT_NOT_SET");

const createStrictContext = (
  label = "Context",
  { displayName = `${label}Context`, errorMessage } = {},
) => {
  const Context = createContext(CONTEXT_NOT_SET);
  Context.displayName = displayName;

  const useStrictContext = () => {
    const ctx = useContext(Context);
    if (ctx === CONTEXT_NOT_SET) {
      throw new Error(errorMessage ?? `use${label} debe usarse dentro de ${label}Provider`);
    }
    return ctx;
  };

  return [Context, useStrictContext];
};

// Contexto y Hook
export const [AuthContext, useAuth] = createStrictContext("Auth", {
  displayName: "AuthContext",
  errorMessage: "useAuth debe usarse dentro de AuthProvider",
});

// UTILIDADES
const normalizeRoleValue = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : ""

const ADMIN_ROLE_ALIASES = new Set(["admin", "administrador"]);

export const isAdminRole = (user) => {
  if (!user) return false;
  const roleValue = normalizeRoleValue(user?.rol_code ?? user?.role_code ?? "");
  return ADMIN_ROLE_ALIASES.has(roleValue);
};

const TOKEN_KEY = "moa.accessToken";
const USER_KEY  = "moa.user";
const STATUS = { IDLE: "idle", LOADING: "loading", AUTH: "authenticated" };

const safeParseJson = (value) => {
  try { return JSON.parse(value); } catch { return null; }
};

const identity = (value) => value;
const DEBUG_LOGS = import.meta.env?.VITE_DEBUG_LOGS === 'true';
const debugWarn = (...args) => { if (DEBUG_LOGS) console.warn(...args); };
const debugError = (...args) => { if (DEBUG_LOGS) console.error(...args); };

// PROVIDER
export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = usePersistentState(TOKEN_KEY, {
    initialValue: null,
    parser: identity,
    serializer: identity,
  });
  const [user, setUser] = usePersistentState(USER_KEY, {
    initialValue: null,
    parser: safeParseJson,
    serializer: (value) => JSON.stringify(value),
    persistNull: true,
  });
  
  const [status, setStatus] = useState(() => {
    if (token && user && (user.id || user.usuario_id)) {
      return STATUS.AUTH;
    }
    if (token && !user) {
      debugWarn('[AuthContext] sin usuario detectado al iniciar');
      return STATUS.IDLE;
    }
    return STATUS.IDLE;
  });
  const [error, setError] = useState(null);
  const [showExpirationDialog, setShowExpirationDialog] = useState(false);
  const [showExpiredAlert, setShowExpiredAlert] = useState(false);
  const navigate = useNavigate();

  const pendingLoginRef = useRef(false);

  const syncToken = useCallback((nextToken) => {
    setTokenGetter(() => nextToken);
    setToken(nextToken ?? null);
  }, [setToken]);

  const syncUser = useCallback((nextUser) => {
    setUser(nextUser ?? null);
  }, [setUser]);

  useLayoutEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    let cleanupTimer = null;
    if (storedToken && !storedUser) {
      if (pendingLoginRef.current) {
        debugWarn('[AuthContext] ⚠️ Token huérfano detectado pero login pendiente, omitiendo limpieza');
      } else {
        debugWarn('[AuthContext] ⚠️ Token huérfano detectado (sin user), esperando breve periodo para evitar race...');
        cleanupTimer = setTimeout(() => {
          const nowUser = localStorage.getItem(USER_KEY);
          if (!nowUser) {
            debugWarn('[AuthContext] ⚠️ Token huérfano confirmado, limpiando localStorage...');
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('cart');
            localStorage.removeItem('wishlist');
            syncToken(null);
            setStatus(STATUS.IDLE);
          }
        }, 300);
      }
    } else if (!storedToken && storedUser) {
      debugWarn('[AuthContext] ⚠️ User huérfano detectado (sin token), limpiando localStorage...');
      localStorage.removeItem(USER_KEY);
      syncUser(null);
      setStatus(STATUS.IDLE);
    }

    return () => {
      if (cleanupTimer) clearTimeout(cleanupTimer);
    };
  }, [syncToken, syncUser]);

  const logout = useCallback((reason = null) => {
    syncToken(null);
    syncUser(null);
    setStatus(STATUS.IDLE);
    setError(null);
    setShowExpirationDialog(false);
    
    try {
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      debugWarn('[AuthContext] No se pudieron limpiar datos del storage', e);
    }
    
    try {
      queryClient.clear();
    } catch (e) {
      debugWarn('[AuthContext] Error limpiando cache de QueryClient', e);
    }
    
    if (reason === 'expired') {
      setShowExpiredAlert(true);
      setTimeout(() => setShowExpiredAlert(false), 5000);
    }
    
    const currentPath = globalThis.location?.pathname ?? '/';
    const isAdminPath = currentPath.startsWith('/admin');
    
    if (isAdminPath || reason === 'expired') {
      navigate("/login", { replace: true, state: { from: currentPath, expired: reason === 'expired' } });
    } else {
      navigate("/", { replace: true });
    }
  }, [syncToken, syncUser, navigate, queryClient]);

  useEffect(() => {
    setTokenGetter(() => token);
    setOnUnauthorized(() => logout);
  }, [token, logout]);

  useEffect(() => {
    if (status === STATUS.AUTH && user && token) {
      observability.identifyUser(user);
    } else if (!token) {
      observability.clearUser();
    }
  }, [status, user, token]);

  const hasAttemptedProfileLoad = useRef(false);
  
  useEffect(() => {
    if (!token || user) {
      hasAttemptedProfileLoad.current = false;
      return undefined;
    }
    
    if (hasAttemptedProfileLoad.current) {
      return undefined;
    }
    
    hasAttemptedProfileLoad.current = true;
    
    let cancelled = false;

    (async () => {
      try {
        const profile = await authApi.profile();
        if (cancelled) return;
        
        if (!profile || !(profile.id || profile.usuario_id)) {
          debugError('[AuthContext] Perfil inválido: sin ID de usuario');
          throw new Error('Perfil inválido: sin ID de usuario');
        }
        
        syncUser(profile);
        setStatus(STATUS.AUTH);
      } catch (err) {
        if (cancelled) return;
        
        const is401 = err?.status === 401 || err?.message?.includes('401') || err?.message?.toLowerCase().includes('unauthorized');
        const isTokenInvalid = err?.message?.toLowerCase().includes('token') || err?.message?.toLowerCase().includes('sesión');
        
        if (is401 || isTokenInvalid) {
          debugError('[AuthContext] ❌ Token inválido o expirado, limpiando:', err.message);
        } else {
          debugError('[AuthContext] ❌ Error validando token:', err.message);
        }
        
        syncToken(null);
        syncUser(null);
        setStatus(STATUS.IDLE);
        setError(null);
      }
    })();

    return () => { cancelled = true; };
  }, [token, user, syncToken, syncUser]);

  const login = useCallback(
    async (credentials) => {
      setStatus(STATUS.LOADING);
      setError(null);
      pendingLoginRef.current = true;
      try {
        if (import.meta.env.DEV) console.log('[AuthContext] Iniciando login...');
        const response = await authApi.login(credentials);
        if (import.meta.env.DEV) {
          console.log('[AuthContext] Respuesta recibida:', { 
            hasToken: !!response?.token, 
            hasUser: !!response?.user,
            userId: response?.user?.id || response?.user?.usuario_id 
          });
        }
        
        const { token: nextToken, user: profile } = response;
        
        if (!nextToken || !profile) {
          throw new Error('Respuesta inválida del servidor');
        }
        
        syncUser(profile);
        syncToken(nextToken);
        setStatus(STATUS.AUTH);
        if (import.meta.env.DEV) console.log('[AuthContext] Login exitoso');
        return profile;
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[AuthContext] Error en login:', err);
          console.error('[AuthContext] Error details:', {
            status: err?.status,
            message: err?.message,
            data: err?.data
          });
        }
        setError(err);
        setStatus(STATUS.IDLE);
        throw err;
      } finally {
        pendingLoginRef.current = false;
      }
    },
    [syncToken, syncUser],
  );

  const register = useCallback(
    async (payload) => {
      setStatus(STATUS.LOADING);
      setError(null);
      pendingLoginRef.current = true;
      try {
        const response = await authApi.register(payload);
        const nextToken = response?.token ?? null;
        const profile = response?.user ?? null;
        syncUser(nextToken ? profile : null);
        syncToken(nextToken);
        setStatus(nextToken ? STATUS.AUTH : STATUS.IDLE);
        return response;
      } catch (err) {
        setError(err);
        setStatus(STATUS.IDLE);
        throw err;
      } finally {
        pendingLoginRef.current = false;
      }
    },
    [syncToken, syncUser],
  );

  const refreshProfile = useCallback(async () => {
    setStatus(STATUS.LOADING);
    setError(null);
    pendingLoginRef.current = true;
    try {
      const profile = await authApi.profile();
      syncUser(profile);
      setStatus(STATUS.AUTH);
      return profile;
    } catch (err) {
      setError(err);
      logout();
      throw err;
    } finally {
      pendingLoginRef.current = false;
    }
  }, [syncUser, logout]);

  const extendSession = useCallback(async () => {
    try {
      const { token: newToken, user: profile } = await authApi.refreshToken();
      syncToken(newToken);
      syncUser(profile);
      setShowExpirationDialog(false);
      return true;
    } catch (err) {
      debugError('[AuthContext] Error extendiendo sesión:', err);
      logout('expired');
      return false;
    }
  }, [syncToken, syncUser, logout]);

  const handleSessionExpired = useCallback(() => {
    debugWarn('[AuthContext] 🔒 Sesión expirada, cerrando...');
    logout('expired');
  }, [logout]);

  const handleSessionWarning = useCallback((minutesRemaining) => {
    debugWarn(`[AuthContext] ⚠️ Sesión expira en ${minutesRemaining} minutos`);
    if (user && user.role_code !== 'ADMIN') {
      setShowExpirationDialog(true);
    }
  }, [user]);

  useSessionMonitor({
    token,
    onExpired: handleSessionExpired,
    onWarning: handleSessionWarning,
    warningMinutes: 5,
  });

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      error,
      isAuthenticated: Boolean(token),
      isAdmin: isAdminRole(user),
      login,
      register,
      logout,
      refreshProfile,
      extendSession,
    }),
    [user, token, status, error, login, register, logout, refreshProfile, extendSession],
  );

  if (status === STATUS.LOADING && token && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-xl font-medium text-primary">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      <SessionExpirationDialog
        open={showExpirationDialog}
        minutesRemaining={5}
        onExtend={extendSession}
        onLogout={() => logout('expired')}
        onDismiss={() => setShowExpirationDialog(false)}
      />
      
      {showExpiredAlert && (
        <div className="fixed left-1/2 top-20 z-1050 w-full max-w-lg -translate-x-1/2 px-4">
          <Alert
            variant="warning"
            title="Sesión expirada"
            dismissible
            onDismiss={() => setShowExpiredAlert(false)}
            className="border-warning/50 bg-warning-veil backdrop-blur-md shadow-lg"
          >
            Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.
          </Alert>
        </div>
      )}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
