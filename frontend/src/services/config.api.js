import { apiClient } from './api-client.js';
import { logger } from '@/utils/logger.js';

/**
 * @returns {Promise<Object>} Configuración de la tienda
 */
export const getStoreConfig = async () => {
  try {
    const response = await apiClient.get('/api/config');
    return response?.data ?? response;
  } catch (error) {
    // Solo loguear en desarrollo - la app tiene valores por defecto
    if (import.meta.env.DEV) {
      logger.warn('[configApi.get] No se pudo obtener configuración del servidor:', error.message);
    }
    throw error;
  }
};

/**
 * @param {Object} configData - Datos de configuración a actualizar
 * @returns {Promise<Object>} Configuración actualizada
 */
export const updateStoreConfig = async (configData) => {
  try {
    const response = await apiClient.private.put('/api/config', configData);
    return response?.data ?? response;
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    throw error;
  }
};

/**
 * @returns {Promise<Object>} Configuración inicializada
 */
export const initializeStoreConfig = async () => {
  try {
    const response = await apiClient.private.post('/api/config/init');
    return response?.data ?? response;
  } catch (error) {
    console.error('Error al inicializar configuración:', error);
    throw error;
  }
};
