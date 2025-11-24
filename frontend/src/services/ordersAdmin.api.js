import { apiClient } from './api-client.js';

const centsToNumber = (value) => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed / 100;
};

const buildPlaceholderItems = (count, fallbackId) => {
  if (!count || count <= 0) return [];
  return Array.from({ length: count }, (_, index) => ({
    orden_item_id: `${fallbackId ?? 'order'}-item-${index + 1}`,
    cantidad: 0,
    precio_unit: 0,
  }));
};

const normalizeAdminOrder = (raw = {}) => {
  if (!raw || typeof raw !== 'object') return raw;

  const totalItems =
    Number(
      raw.total_items ??
        raw.totalItems ??
        (Array.isArray(raw.items) ? raw.items.length : 0),
    ) || 0;

  const normalizedItems = Array.isArray(raw.items)
    ? raw.items
    : buildPlaceholderItems(totalItems, raw.orden_id ?? raw.id);

  return {
    id: raw.orden_id ?? raw.id ?? null,
    orden_id: raw.orden_id ?? raw.id ?? null,
    number: raw.order_code ?? raw.number ?? raw.orden_id ?? raw.id ?? null,
    orderCode: raw.order_code ?? raw.orderCode ?? null,
    usuario_id: raw.usuario_id ?? raw.usuarioId ?? null,
    status: raw.estado_envio ?? raw.estado_pago ?? raw.status ?? null,
    estado_pago: raw.estado_pago ?? null,
    estado_envio: raw.estado_envio ?? null,
    paymentStatus: raw.estado_pago ?? null,
    shippingStatus: raw.estado_envio ?? null,
    metodo_pago: raw.metodo_pago ?? raw.metodoPago ?? null,
    metodo_despacho: raw.metodo_despacho ?? raw.metodoDespacho ?? null,
    subtotal: raw.subtotal ?? centsToNumber(raw.subtotal_cents),
    subtotal_cents: raw.subtotal_cents ?? null,
    shipping: raw.shipping ?? centsToNumber(raw.envio_cents),
    envio_cents: raw.envio_cents ?? null,
    total: raw.total ?? centsToNumber(raw.total_cents),
    total_cents: raw.total_cents ?? null,
    createdAt: raw.creado_en ?? raw.created_at ?? raw.createdAt ?? null,
    updatedAt:
      raw.actualizado_en ??
      raw.updated_at ??
      raw.updatedAt ??
      raw.creado_en ??
      null,
    userName: raw.usuario_nombre ?? raw.userName ?? null,
    userEmail: raw.usuario_email ?? raw.userEmail ?? null,
    userPhone: raw.usuario_telefono ?? raw.userPhone ?? null,
    totalItems,
    items: normalizedItems,
  };
};

const normalizeListResponse = (response, params = {}) => {
  const baseData = Array.isArray(response?.data) ? response.data : [];
  const normalized = baseData.map(normalizeAdminOrder);
  const pagination = response?.pagination ?? {
    total: normalized.length,
    limit: Number(params.limit) || normalized.length || 20,
    offset: Number(params.offset) || 0,
    hasMore: false,
  };

  return {
    success: response?.success ?? true,
    message: response?.message,
    data: normalized,
    items: normalized,
    pagination,
  };
};

const normalizeSingleResponse = (response) => {
  if (!response) return null;
  if ('data' in response && response.data !== undefined) {
    return normalizeAdminOrder(response.data);
  }
  return normalizeAdminOrder(response);
};

export const ordersAdminApi = {
  /**
   * Obtener todas las órdenes con filtros opcionales
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>} Lista de órdenes paginada
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/admin/pedidos', { params });
    return normalizeListResponse(response, params);
  },

  /**
   * Obtener una orden específica por ID
   * @param {string|number} ordenId - ID de la orden
   * @returns {Promise<Object>} Orden completa normalizada
   */
  getById: async (ordenId) => {
    if (!ordenId) {
      throw new Error('ID de orden es requerido');
    }
    const response = await apiClient.get(`/admin/pedidos/${ordenId}`);
    return normalizeSingleResponse(response);
  },

  /**
   * Actualizar el estado de una orden
   * @param {string|number} ordenId - ID de la orden
   * @param {Object} data - Datos de actualización
   * @param {string} data.estado_pago - Nuevo estado
   * @param {string} [data.motivo_cambio] - Motivo del cambio
   * @returns {Promise<Object>} Orden actualizada
   */
  updateStatus: (ordenId, data) => {
    if (!ordenId) {
      throw new Error('ID de orden es requerido');
    }
    if (!data.estado_pago) {
      throw new Error('Estado de pago es requerido');
    }
    return apiClient.patch(`/admin/pedidos/${ordenId}/estado`, data);
  },

  /**
   * Actualizar estado completo de una orden (Admin)
   * PUT /api/admin/orders/:id/status
   * @param {string|number} ordenId - ID de la orden
   * @param {Object} data - Datos de actualización completos
   * @param {string} [data.estado_pago] - Estado de pago
   * @param {string} [data.estado_envio] - Estado de envío
   * @param {string} [data.numero_seguimiento] - Número de seguimiento
   * @param {string} [data.empresa_envio] - Empresa de envío/courier
   * @returns {Promise<Object>} Orden actualizada
   */
  updateOrderStatus: async (ordenId, data) => {
    if (!ordenId) {
      throw new Error('ID de orden es requerido');
    }
    const response = await apiClient.put(`/api/admin/orders/${ordenId}/status`, data);
    return normalizeSingleResponse(response);
  },

  /**
   * Agregar información de tracking
   * @param {string|number} ordenId - ID de la orden
   * @param {Object} data - Datos de tracking
   * @param {string} data.numero_seguimiento - Número de seguimiento
   * @param {string} [data.empresa_envio] - Empresa de envío
   * @param {string} [data.url_seguimiento] - URL de seguimiento
   * @returns {Promise<Object>} Resultado de la operación
   */
  addTracking: (ordenId, data) => {
    if (!ordenId) {
      throw new Error('ID de orden es requerido');
    }
    if (!data.numero_seguimiento) {
      throw new Error('Número de seguimiento es requerido');
    }
    return apiClient.post(`/admin/pedidos/${ordenId}/seguimiento`, data);
  },

  /**
   * Obtener estadísticas de órdenes
   * @param {Object} [params={}] - Parámetros opcionales
   * @returns {Promise<Object>} Estadísticas
   */
  getStats: (params = {}) => {
    return apiClient.get('/admin/pedidos/stats', { params });
  },

  /**
   * Exportar listado de órdenes filtradas
   * @param {Object} [params={}] - Parámetros de filtro válidos
   * @returns {Promise<Blob>} Archivo en formato blob
   */
  exportOrders: (params = {}, format = 'csv') => requestOrderExport(params, format),

  exportToCSV: (params = {}) => requestOrderExport(params, 'csv'),

};

const requestOrderExport = (params = {}, format = 'csv') => {
  return apiClient.get('/admin/pedidos/export', {
    params: { ...params, format },
    responseType: 'blob',
  });
};
