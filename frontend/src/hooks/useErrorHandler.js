import { useCallback, useState } from 'react';
import { alerts } from '@/utils/alerts.js';
import { observability } from '@/services/observability.js';

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

// Hook para retry logic con backoff exponencial (por defecto reintenta errores de red y 5xx)
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
