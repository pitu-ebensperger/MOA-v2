export const METODOS_DESPACHO = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  RETIRO_TIENDA: 'retiro_tienda',
  RETIRO: 'retiro_tienda' // Alias para compatibilidad
};

export const METODOS_DESPACHO_VALIDOS = Object.values(METODOS_DESPACHO);

export const METODOS_DESPACHO_OPTIONS = [
  { 
    value: METODOS_DESPACHO.STANDARD, 
    label: 'Despacho estándar',
    descripcion: 'Entrega en 3-5 días hábiles',
    costo_base_cents: 4900
  },
  { 
    value: METODOS_DESPACHO.EXPRESS, 
    label: 'Despacho express',
    descripcion: 'Entrega en 1-2 días hábiles',
    costo_base_cents: 6900
  },
  { 
    value: METODOS_DESPACHO.RETIRO_TIENDA, 
    label: 'Retiro en tienda',
    descripcion: 'Gratis - Disponible en 24 horas',
    costo_base_cents: 0
  }
];

export function isValidShippingMethod(metodoDespacho) {
  return METODOS_DESPACHO_VALIDOS.includes(metodoDespacho);
}

export function getShippingMethodLabel(metodoDespacho) {
  const method = METODOS_DESPACHO_OPTIONS.find(m => m.value === metodoDespacho);
  return method?.label || metodoDespacho;
}

export function getShippingCost(metodoDespacho) {
  const method = METODOS_DESPACHO_OPTIONS.find(m => m.value === metodoDespacho);
  return method?.costo_base_cents || 0;
}
