import { ordersAdminApi } from "@/services/ordersAdmin.api.js";

// ⚠️ DEPRECATED: Este archivo contiene código legacy de normalización
// Los estados ahora se deben usar desde @config/order-states.js
// Estados válidos del DDL:
// - estado_pago: 'pendiente' | 'pagado' | 'rechazado' | 'reembolsado'
// - estado_envio: 'preparacion' | 'enviado' | 'en_transito' | 'entregado' | 'cancelado'

const STATUS_PAYLOADS = {
  pending: { estado_pago: "pendiente", estado_envio: "preparacion" },
  // processing: NO EXISTE EN DDL - usar 'pendiente'
  shipped: { estado_pago: "pagado", estado_envio: "enviado" },
  fulfilled: { estado_pago: "pagado", estado_envio: "entregado" },
  // cancelled estado_envio: 'cancelado' (no 'devuelto')
  cancelled: { estado_pago: "rechazado", estado_envio: "cancelado" },
};

const normalizeLegacyOrder = (order = {}) => {
  if (!order || typeof order !== "object") return order;
  const normalizedItems = Array.isArray(order.items) ? order.items : [];

  return {
    id: order.id ?? order.orden_id ?? null,
    number: order.number ?? order.orderCode ?? order.id ?? null,
    userId: order.usuario_id ?? order.userId ?? null,

    status: order.status ?? order.shippingStatus ?? order.paymentStatus ?? "pendiente",
    currency: order.currency ?? "CLP",

    subtotal: order.subtotal ?? null,
    shipping: order.shipping ?? null,
    tax: order.tax ?? null,
    total: order.total ?? null,

    createdAt: order.createdAt ?? null,
    updatedAt: order.updatedAt ?? order.createdAt ?? null,

    addressId: order.addressId ?? order.direccion_id ?? null,
    paymentId: order.paymentId ?? null,
    shipmentId: order.shipmentId ?? null,

    items: normalizedItems,
    payment: order.payment ?? null,
    shipment: order.shipment ?? null,
    address: order.address ?? null,

    userName: order.userName ?? null,
    userEmail: order.userEmail ?? null,
    userPhone: order.userPhone ?? null,
    totalItems: order.totalItems ?? normalizedItems.length,
  };
};

const translateStatusToPayload = (status) => {
  if (!status) return null;
  const normalized = String(status).trim().toLowerCase();
  return STATUS_PAYLOADS[normalized] ?? null;
};

export const ordersApi = {
  async list(params = {}) {
    const response = await ordersAdminApi.getAll(params);
    const items = (response?.data ?? []).map(normalizeLegacyOrder);
    const pagination = response?.pagination ?? {};
    const total = Number(pagination.total ?? items.length);
    const limit = Number(pagination.limit ?? params.limit ?? (items.length || 1));
    const offset = Number(pagination.offset ?? params.offset ?? 0);
    const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
    const page = limit > 0 ? Math.floor(offset / limit) + 1 : 1;

    return {
      items,
      total,
      totalPages,
      page,
    };
  },

  async getById(id) {
    if (!id) throw new Error("order id is required");
    const data = await ordersAdminApi.getById(id);
    return normalizeLegacyOrder(data);
  },

  async cancel(id) {
    if (!id) throw new Error("order id is required");
    const payload = translateStatusToPayload("cancelled");
    if (!payload) {
      throw new Error("Cancel status payload unavailable");
    }
    const data = await ordersAdminApi.updateOrderStatus(id, payload);
    return normalizeLegacyOrder(data);
  },

  async updateStatus(id, updates = {}) {
    if (!id) throw new Error("order id is required");
    const status = updates?.status;
    const payload = translateStatusToPayload(status);
    if (!payload) {
      const allowed = Object.keys(STATUS_PAYLOADS).join(", ");
      throw new Error(`status is required. Valores permitidos: ${allowed}`);
    }
    const data = await ordersAdminApi.updateOrderStatus(id, payload);
    return normalizeLegacyOrder(data);
  },
};
