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

  const orderId = raw.orden_id ?? raw.id ?? null;
  const orderCode =
    raw.order_code ?? raw.orderCode ?? raw.number ?? orderId ?? null;
  const createdAt =
    raw.creado_en ?? raw.created_at ?? raw.createdAt ?? raw.fecha_creacion ?? null;
  const updatedAt =
    raw.actualizado_en ??
    raw.updated_at ??
    raw.updatedAt ??
    raw.fecha_actualizacion ??
    createdAt ??
    null;

  const userName = raw.usuario_nombre ?? raw.userName ?? raw.nombre_usuario ?? null;
  const userEmail = raw.usuario_email ?? raw.userEmail ?? raw.email ?? null;
  const userPhone = raw.usuario_telefono ?? raw.userPhone ?? raw.telefono ?? null;

  const totalItems =
    Number(
      raw.total_items ??
        raw.totalItems ??
        (Array.isArray(raw.items) ? raw.items.length : 0),
    ) || 0;

  const normalizedItems = Array.isArray(raw.items)
    ? raw.items
    : buildPlaceholderItems(totalItems, orderId);

  const subtotalValue = raw.subtotal ?? centsToNumber(raw.subtotal_cents);
  const shippingValue = raw.shipping ?? centsToNumber(raw.envio_cents);
  const totalValue = raw.total ?? centsToNumber(raw.total_cents);

  const estadoPago = raw.estado_pago ?? raw.paymentStatus ?? null;
  const estadoEnvio = raw.estado_envio ?? raw.shippingStatus ?? null;

  const metodoPago = raw.metodo_pago ?? raw.metodoPago ?? null;
  const metodoDespacho = raw.metodo_despacho ?? raw.metodoDespacho ?? null;

  const street = raw.calle ?? raw.direccion ?? raw.address ?? raw.address_line ?? null;
  const comuna = raw.comuna ?? raw.comuna_nombre ?? null;
  const ciudad = raw.ciudad ?? raw.city ?? null;
  const region = raw.region ?? raw.region_nombre ?? null;
  const customerNotes = raw.notas_cliente ?? raw.comentarios ?? raw.customer_notes ?? null;

  return {
    id: orderId,
    orden_id: orderId,
    number: orderCode,
    orderCode,
    order_code: orderCode,
    codigo: orderCode,
    usuario_id: raw.usuario_id ?? raw.usuarioId ?? null,
    status: estadoEnvio ?? estadoPago ?? raw.status ?? null,
    estado_pago: estadoPago,
    estado_envio: estadoEnvio,
    paymentStatus: estadoPago,
    shippingStatus: estadoEnvio,
    metodo_pago: metodoPago,
    metodo_despacho: metodoDespacho,
    subtotal: subtotalValue,
    subtotal_cents: raw.subtotal_cents ?? null,
    shipping: shippingValue,
    envio_cents: raw.envio_cents ?? null,
    total: totalValue,
    total_cents: raw.total_cents ?? null,
    createdAt,
    creado_en: createdAt,
    updatedAt,
    actualizado_en: updatedAt,
    userName,
    usuario_nombre: userName,
    userEmail,
    usuario_email: userEmail,
    userPhone,
    usuario_telefono: userPhone,
    totalItems,
    total_items: totalItems,
    items: normalizedItems,
    calle: street,
    comuna,
    ciudad,
    region,
    notas_cliente: customerNotes,
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
  getAll: async (params = {}) => {
    const response = await apiClient.get('/admin/pedidos', { params });
    return normalizeListResponse(response, params);
  },

  getById: async (ordenId) => {
    if (!ordenId) {
      throw new Error('ID de orden es requerido');
    }
    const response = await apiClient.get(`/admin/pedidos/${ordenId}`);
    return normalizeSingleResponse(response);
  },

  updateStatus: (ordenId, data) => {
    if (!ordenId) {
      throw new Error('ID de orden es requerido');
    }
    if (!data.estado_pago) {
      throw new Error('Estado de pago es requerido');
    }
    return apiClient.patch(`/admin/pedidos/${ordenId}/estado`, data);
  },

  updateOrderStatus: async (ordenId, data) => {
    if (!ordenId) {
      throw new Error('ID de orden es requerido');
    }
    const response = await apiClient.put(`/api/admin/orders/${ordenId}/status`, data);
    return normalizeSingleResponse(response);
  },

  addTracking: (ordenId, data) => {
    if (!ordenId) {
      throw new Error('ID de orden es requerido');
    }
    if (!data.numero_seguimiento) {
      throw new Error('Número de seguimiento es requerido');
    }
    return apiClient.post(`/admin/pedidos/${ordenId}/seguimiento`, data);
  },

  getStats: (params = {}) => {
    return apiClient.get('/admin/pedidos/stats', { params });
  },

  exportOrders: (params = {}, format = 'csv') => requestOrderExport(params, format),

  exportToCSV: (params = {}) => requestOrderExport(params, 'csv'),

};

const requestOrderExport = (params = {}, format = 'csv') => {
  return apiClient.get('/admin/pedidos/export', {
    params: { ...params, format },
    responseType: 'blob',
  });
};
