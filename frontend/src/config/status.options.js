import {
  PRODUCT_STATUS_MAP,
  ORDER_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  SHIPPING_STATUS_MAP,
  USER_STATUS_MAP,
} from "./status.maps.js";

function mapToOptions(statusMap, includeAll = true) {
  const entries = Object.entries(statusMap).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  return includeAll
    ? [{ value: "", label: "Todos" }, ...entries]
    : entries;
}

// Opciones de producto
export const PRODUCT_STATUS_OPTIONS = mapToOptions(PRODUCT_STATUS_MAP);

// Opciones de orden/pedido
export const ORDER_STATUS_OPTIONS = mapToOptions(ORDER_STATUS_MAP);

// Opciones de pago
export const PAYMENT_STATUS_OPTIONS = mapToOptions(PAYMENT_STATUS_MAP);

// Opciones de envío
export const SHIPPING_STATUS_OPTIONS = mapToOptions(SHIPPING_STATUS_MAP);

// Opciones de usuario
export const USER_STATUS_OPTIONS = mapToOptions(USER_STATUS_MAP);

export function getStatusOptions(statusMap, includeAll = true) {
  return mapToOptions(statusMap, includeAll);
}
