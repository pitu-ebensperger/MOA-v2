import { apiClient } from '@/services/api-client'

/**
 * Obtener todas las direcciones del usuario autenticado
 * @returns {Promise<Array>} - Array de direcciones
 */
export const getAddresses = async () => {
  const response = await apiClient.get('/api/direcciones');
  return response.data;
};

/**
 * Obtener dirección por ID
 * @param {number} direccionId - ID de la dirección
 * @returns {Promise<Object>} - Objeto dirección
 */
export const getAddressById = async (direccionId) => {
  const response = await apiClient.get(`/api/direcciones/${direccionId}`);
  return response.data;
};

/**
 * Crear nueva dirección
 * @param {Object} addressData - Datos de la dirección
 * @param {string} addressData.calle - Calle y número
 * @param {string} [addressData.departamento] - Depto/oficina (opcional)
 * @param {string} addressData.comuna - Comuna
 * @param {string} addressData.ciudad - Ciudad
 * @param {string} addressData.region - Región
 * @param {string} [addressData.codigo_postal] - Código postal (opcional)
 * @param {string} [addressData.referencia] - Referencia adicional (opcional)
 * @param {boolean} [addressData.predeterminada] - Si es dirección predeterminada (opcional, auto-true para primera)
 * @returns {Promise<Object>} - Dirección creada
 */
export const createAddress = async (addressData) => {
  const response = await apiClient.post('/api/direcciones', addressData);
  return response.data;
};

/**
 * Actualizar dirección existente
 * @param {number} direccionId - ID de la dirección
 * @param {Object} addressData - Datos a actualizar (campos opcionales)
 * @returns {Promise<Object>} - Dirección actualizada
 */
export const updateAddress = async (direccionId, addressData) => {
  const response = await apiClient.patch(`/api/direcciones/${direccionId}`, addressData);
  return response.data;
};

/**
 * Establecer dirección como predeterminada
 * @param {number} direccionId - ID de la dirección
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const setDefaultAddress = async (direccionId) => {
  const response = await apiClient.patch(`/api/direcciones/${direccionId}/predeterminada`);
  return response.data;
};

/**
 * Eliminar dirección
 * @param {number} direccionId - ID de la dirección
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const deleteAddress = async (direccionId) => {
  const response = await apiClient.delete(`/api/direcciones/${direccionId}`);
  return response.data;
};
