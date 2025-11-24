// Maneja errores de autenticación globalmente
export function handleAuthError(error) {
  // Verificar si es un error de autenticación
  const status = error?.status || error?.response?.status;
  
  if (status === 401 || status === 403) {
    console.warn('[handleAuthError] Error de autenticación detectado:', status);
    try {
      localStorage.clear();
      window.location.href = '/login';
    } catch (e) {
      console.error('[handleAuthError] Error limpiando storage:', e);
    }
    return true;
  }
  return false;
}
