import { useCallback, useState } from 'react';
import { alerts } from '@/utils/alerts.js';
import { observability } from '@/services/observability.js';

/**
 * Hook para manejo consistente de errores en componentes
 * 
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.showAlert - Mostrar alerta automática (default: true)
 * @param {Function} options.onError - Callback adicional cuando ocurre un error
 * @param {string} options.defaultMessage - Mensaje por defecto si no hay mensaje específico
 * @returns {Object} - { error, setError, handleError, clearError, isError }
 * 
 * @example
 * const { handleError, clearError } = useErrorHandler();
 * 
 * try {
 *   await someApiCall();
 * } catch (err) {
 *   handleError(err);
 * }
 */
export function useErrorHandler({
  showAlert = true,
  onError,
  defaultMessage = 'Ha ocurrido un error inesperado',
} = {}) {
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback(
    (err, customMessage) => {
      // Normalizar el error
      let errorObj = err;
      
      if (typeof err === 'string') {
        errorObj = { message: err };
      } else if (err instanceof Error) {
        errorObj = {
          message: err.message,
          stack: err.stack,
          status: err.status,
          data: err.data,
        };
      } else if (!err) {
        errorObj = { message: defaultMessage };
      }

      // Extraer mensaje legible
      const message = customMessage 
        || errorObj.data?.message 
        || errorObj.message 
        || defaultMessage;

      // Guardar error en state
      setError({
        message,
        originalError: err,
        timestamp: new Date(),
        ...errorObj,
      });

      // Log en desarrollo
      if (import.meta.env.DEV) {
        console.error('[useErrorHandler]', {
          message,
          error: err,
          stack: errorObj.stack,
        });
      }

      // Mostrar alerta si está habilitado
      if (showAlert) {
        alerts.error('Error', message);
      }

      // Callback adicional
      if (typeof onError === 'function') {
        try {
          onError(errorObj);
        } catch (callbackError) {
          console.error('[useErrorHandler] onError callback failed:', callbackError);
        }
      }

      // En producción, enviar a servicio de logging
      if (import.meta.env.PROD) {
        observability.captureException(err || new Error(message), {
          message,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [showAlert, onError, defaultMessage]
  );

  return {
    error,
    setError,
    handleError,
    clearError,
    isError: error !== null,
  };
}

/**
 * Hook para manejo de errores de formularios
 * Similar a useErrorHandler pero específico para validación de formularios
 * 
 * @returns {Object} - { fieldErrors, setFieldError, setFieldErrors, clearFieldError, clearAllErrors, hasErrors }
 * 
 * @example
 * const { fieldErrors, setFieldError, clearAllErrors } = useFormErrorHandler();
 * 
 * if (!email) {
 *   setFieldError('email', 'El email es requerido');
 * }
 */
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState({});

  const setFieldError = useCallback((field, message) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  const clearFieldError = useCallback((field) => {
    setFieldErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  return {
    fieldErrors,
    setFieldError,
    setFieldErrors,
    clearFieldError,
    clearAllErrors,
    hasErrors: Object.keys(fieldErrors).length > 0,
  };
}

/**
 * Hook para retry logic en operaciones asíncronas
 * 
 * @param {Function} asyncFn - Función asíncrona a ejecutar
 * @param {Object} options - Opciones de retry
 * @param {number} options.maxRetries - Número máximo de reintentos (default: 3)
 * @param {number} options.retryDelay - Delay entre reintentos en ms (default: 1000)
 * @param {Function} options.shouldRetry - Función para determinar si se debe reintentar (default: solo errores de red)
 * @returns {Object} - { execute, isLoading, error, retryCount }
 * 
 * @example
 * const { execute, isLoading } = useRetry(
 *   () => api.getData(),
 *   { maxRetries: 3, retryDelay: 2000 }
 * );
 * 
 * await execute();
 */
export function useRetry(asyncFn, {
  maxRetries = 3,
  retryDelay = 1000,
  shouldRetry = (error) => {
    // Por defecto, reintentar solo errores de red o 5xx
    const isNetworkError = error.message?.includes('fetch') || error.message?.includes('network');
    const is5xxError = error.status >= 500 && error.status < 600;
    return isNetworkError || is5xxError;
  },
} = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (...args) => {
    setIsLoading(true);
    setError(null);
    let lastError = null;
    let attempts = 0;

    while (attempts <= maxRetries) {
      try {
        const result = await asyncFn(...args);
        setIsLoading(false);
        setRetryCount(0);
        return result;
      } catch (err) {
        lastError = err;
        attempts++;
        setRetryCount(attempts);

        if (attempts <= maxRetries && shouldRetry(err)) {
          console.warn(`[useRetry] Intento ${attempts}/${maxRetries + 1} falló, reintentando en ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts)); // Backoff exponencial
        } else {
          break;
        }
      }
    }

    setIsLoading(false);
    setError(lastError);
    throw lastError;
  }, [asyncFn, maxRetries, retryDelay, shouldRetry]);

  return {
    execute,
    isLoading,
    error,
    retryCount,
  };
}
