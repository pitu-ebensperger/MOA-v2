// Optimización de Búsqueda y Filtros (hook debounce reduce llamadas API innecesarias)
import { useEffect, useState } from 'react';

/** Hook que retrasa la actualización de un valor
 * @param {any} value - Valor a debounce
 * @param {number} delay - Tiempo de espera en ms (default: 500)
 * @returns {any} Valor debounced
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Crear timer que actualizará el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancelar timer si value cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/** Hook de debounce con callback (alternativa) * 
 * @param {Function} callback - Función a ejecutar
 * @param {number} delay - Tiempo de espera en ms
 * @returns {Function} Función debounced
 */
export function useDebouncedCallback(callback, delay = 500) {
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}
