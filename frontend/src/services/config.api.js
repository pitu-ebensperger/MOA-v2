import { apiClient } from './api-client.js';

export const getStoreConfig = async () => {
  try {
    const response = await apiClient.get('/api/config');
    return response?.data ?? response;
  } catch (error) {
    // Solo loguear en desarrollo. app tiene valores por defecto
    if (import.meta.env.DEV) {
      console.warn('[configApi.get] No se pudo obtener configuración del servidor:', error.message);
    }
    throw error;
  }
};

export const updateStoreConfig = async (configData) => {
  try {
    const response = await apiClient.private.put('/api/config', configData);
    return response?.data ?? response;
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    throw error;
  }
};

export const initializeStoreConfig = async () => {
  try {
    const response = await apiClient.private.post('/api/config/init');
    return response?.data ?? response;
  } catch (error) {
    console.error('Error al inicializar configuración:', error);
    throw error;
  }
};
