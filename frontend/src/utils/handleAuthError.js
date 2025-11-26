export function handleAuthError(error) {
  try {
    const status = error?.status ?? error?.response?.status ?? null;
    if (status === 401 || status === 403) {
      console.warn('[handleAuthError] Error de autenticación detectado:', status);
      try {
        // limpiar storage y forzar ir a login
        localStorage.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } catch (e) {
        console.error('[handleAuthError] Error limpiando storage/redirigiendo:', e);
      }
      return true;
    }
  } catch (e) {
    console.error('[handleAuthError] Error procesando el error:', e);
  }
  return false;
}
