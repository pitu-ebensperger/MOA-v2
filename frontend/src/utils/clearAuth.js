/** Limpieza autenticación localStorage
 * (por si vuelve loop cargado sesion)
 * Para usarlo, ejecuta en la consola del navegador:
 * localStorage.removeItem('moa.accessToken');
 * localStorage.removeItem('moa.user');
 * window.location.reload();
 */

export function clearAuth() {
  if (typeof globalThis.window !== 'undefined' && globalThis.localStorage) {
    localStorage.removeItem('moa.accessToken');
    localStorage.removeItem('moa.user');
    return true;
  }
  console.error('[clearAuth] localStorage no disponible');
  return false;
}

export function debugAuth() {
  if (typeof globalThis.window !== 'undefined' && globalThis.localStorage) {
    const token = localStorage.getItem('moa.accessToken');
    const user = localStorage.getItem('moa.user');
    
    return { 
      hasToken: Boolean(token),
      hasUser: Boolean(user),
      tokenLength: token?.length,
      userValid: (() => {
        try {
          return Boolean(user && JSON.parse(user));
        } catch {
          return false;
        }
      })()
    };
  }
  return null;
}

// Hacer disponibles en window para debugging
if (typeof globalThis.window !== 'undefined') {
  globalThis.clearAuth = clearAuth;
  globalThis.debugAuth = debugAuth;
}
