export const ESTADOS_ORDEN = {
  BORRADOR: 'borrador',
  CONFIRMADO: 'confirmado',
  CANCELADO: 'cancelado'
};

export const ESTADOS_ORDEN_VALIDOS = Object.values(ESTADOS_ORDEN);

export const ESTADOS_ORDEN_OPTIONS = [
  { 
    value: ESTADOS_ORDEN.BORRADOR, 
    label: 'Borrador',
    description: 'Orden creada pero no confirmada',
    color: 'gray'
  },
  { 
    value: ESTADOS_ORDEN.CONFIRMADO, 
    label: 'Confirmada',
    description: 'Orden confirmada y lista para procesamiento',
    color: 'green'
  },
  { 
    value: ESTADOS_ORDEN.CANCELADO, 
    label: 'Cancelada',
    description: 'Orden cancelada por el usuario o sistema',
    color: 'red'
  }
];

// Estados de pago
export const ESTADOS_PAGO = {
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
  RECHAZADO: 'rechazado',
  REEMBOLSADO: 'reembolsado'
};

export const ESTADOS_PAGO_VALIDOS = Object.values(ESTADOS_PAGO);

export const ESTADOS_PAGO_OPTIONS = [
  { 
    value: ESTADOS_PAGO.PENDIENTE, 
    label: 'Pendiente',
    description: 'Esperando confirmación de pago',
    color: 'yellow'
  },
  { 
    value: ESTADOS_PAGO.PAGADO, 
    label: 'Pagado',
    description: 'Pago confirmado exitosamente',
    color: 'green'
  },
  { 
    value: ESTADOS_PAGO.RECHAZADO, 
    label: 'Rechazado',
    description: 'Pago rechazado o fallido',
    color: 'red'
  },
  { 
    value: ESTADOS_PAGO.REEMBOLSADO, 
    label: 'Reembolsado',
    description: 'Pago devuelto al cliente',
    color: 'grey'
  }
];

// Estados de envío
export const ESTADOS_ENVIO = {
  PREPARACION: 'preparacion',
  ENVIADO: 'enviado',
  EN_TRANSITO: 'en_transito',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado'
};

export const ESTADOS_ENVIO_VALIDOS = Object.values(ESTADOS_ENVIO);

export const ESTADOS_ENVIO_OPTIONS = [
  { 
    value: ESTADOS_ENVIO.PREPARACION, 
    label: 'En preparación',
    description: 'Orden está siendo preparada para envío',
    color: 'yellow'
  },
  { 
    value: ESTADOS_ENVIO.ENVIADO, 
    label: 'Enviado',
    description: 'Paquete ha sido despachado',
    color: 'blue'
  },
  { 
    value: ESTADOS_ENVIO.EN_TRANSITO, 
    label: 'En tránsito',
    description: 'Paquete está en camino',
    color: 'purple'
  },
  { 
    value: ESTADOS_ENVIO.ENTREGADO, 
    label: 'Entregado',
    description: 'Paquete entregado exitosamente',
    color: 'green'
  },
  { 
    value: ESTADOS_ENVIO.CANCELADO, 
    label: 'Cancelado',
    description: 'Envío cancelado',
    color: 'red'
  }
];

// Despacho
export const METODOS_DESPACHO = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  RETIRO: 'retiro'
};

export const METODOS_DESPACHO_VALIDOS = Object.values(METODOS_DESPACHO);

export const METODOS_DESPACHO_OPTIONS = [
  { 
    value: METODOS_DESPACHO.STANDARD, 
    label: 'Envío Standard',
    description: 'Entrega en 3-5 días hábiles',
    precio_cents: 500000, // $5.000
    icon: 'Truck'
  },
  { 
    value: METODOS_DESPACHO.EXPRESS, 
    label: 'Envío Express',
    description: 'Entrega en 24-48 horas',
    precio_cents: 1000000, // $10.000
    icon: 'TruckElectric'
  },
  { 
    value: METODOS_DESPACHO.RETIRO, 
    label: 'Retiro en tienda',
    description: 'Retira tu pedido en nuestra tienda',
    precio_cents: 0, // Gratis
    icon: 'Store'
  }
];

// Nota: Empresas de envío movidas a empresas-envio.js para evitar duplicación

//Validaciones
export function isValidEstadoOrden(estado) {
  return ESTADOS_ORDEN_VALIDOS.includes(estado);
}

export function isValidEstadoPago(estado) {
  return ESTADOS_PAGO_VALIDOS.includes(estado);
}

export function isValidEstadoEnvio(estado) {
  return ESTADOS_ENVIO_VALIDOS.includes(estado);
}

export function isValidMetodoDespacho(metodo) {
  return METODOS_DESPACHO_VALIDOS.includes(metodo);
}

// isValidEmpresaEnvio -> Ver empresas-envio.js

//Labels
export function getEstadoOrdenLabel(estado) {
  const option = ESTADOS_ORDEN_OPTIONS.find(o => o.value === estado);
  return option?.label || estado;
}

export function getEstadoPagoLabel(estado) {
  const option = ESTADOS_PAGO_OPTIONS.find(o => o.value === estado);
  return option?.label || estado;
}

export function getEstadoEnvioLabel(estado) {
  const option = ESTADOS_ENVIO_OPTIONS.find(o => o.value === estado);
  return option?.label || estado;
}

export function getMetodoDespachoLabel(metodo) {
  const option = METODOS_DESPACHO_OPTIONS.find(o => o.value === metodo);
  return option?.label || metodo;
}

// getEmpresaEnvioLabel -> Ver empresas-envio.js
