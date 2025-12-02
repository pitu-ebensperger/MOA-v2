import { useCallback, useState } from 'react';
import { alerts } from '@/utils/alerts.js';

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
