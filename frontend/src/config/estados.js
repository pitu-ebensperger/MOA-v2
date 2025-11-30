//STATUS MAPS

//Productos
export const PRODUCT_STATUS_MAP = {
  activo:      { variant: "success", label: "Activo" },
  sin_stock:   { variant: "warning", label: "Sin stock" },
  borrador:    { variant: "neutral", label: "Borrador" },
  archivado:   { variant: "neutral", label: "Archivado" },
};

//Pedidos
export const ORDER_STATUS_MAP = {
  fulfilled:   { variant: "success", label: "Completada" },
  pending:     { variant: "warning", label: "Pendiente" },
  cancelled:   { variant: "error",   label: "Cancelada" },
  processing:  { variant: "info",    label: "Procesando" },
};

//Pagos
export const PAYMENT_STATUS_MAP = {
  captured:    { variant: "success", label: "Pagado" },
  failed:      { variant: "error",   label: "Fallido" },
  pending:     { variant: "warning", label: "Pendiente" },
  refunded:    { variant: "info",    label: "Reembolsado" },
};

//Envíos
export const SHIPPING_STATUS_MAP = {
  delivered:   { variant: "success", label: "Entregado" },
  in_transit:  { variant: "info",    label: "En tránsito" },
  delayed:     { variant: "warning", label: "Retrasado" },
  cancelled:   { variant: "error",   label: "Cancelado" },
  processing:  { variant: "info",    label: "Procesando" },
  preparing:   { variant: "info",    label: "Preparando" },
};

//Usuarios
export const USER_STATUS_MAP = {
  activo:      { variant: "success", label: "Activo" },
  suspendido:  { variant: "error",   label: "Suspendido" },
  eliminado:   { variant: "neutral", label: "Eliminado" },
};

//STATUS OPTIONS (SELECT)

function mapToOptions(statusMap, includeAll = true) {
  const entries = Object.entries(statusMap).map(([value, config]) => ({
    value,
    label: config.label,
  }));

  return includeAll
    ? [{ value: "", label: "Todos" }, ...entries]
    : entries;
}

export const PRODUCT_STATUS_OPTIONS = mapToOptions(PRODUCT_STATUS_MAP);
export const ORDER_STATUS_OPTIONS = mapToOptions(ORDER_STATUS_MAP);
export const PAYMENT_STATUS_OPTIONS = mapToOptions(PAYMENT_STATUS_MAP);
export const SHIPPING_STATUS_OPTIONS = mapToOptions(SHIPPING_STATUS_MAP);
export const USER_STATUS_OPTIONS = mapToOptions(USER_STATUS_MAP);

export function getStatusOptions(statusMap, includeAll = true) {
  return mapToOptions(statusMap, includeAll);
}
