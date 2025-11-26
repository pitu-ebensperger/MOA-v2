export const ESTADOS_ORDEN = {
  pendiente: 'pendiente',
  confirmado: 'confirmado',
  preparado: 'preparado',
  enviado: 'enviado',
  entregado: 'entregado',
  cancelado: 'cancelado',
};

export const METODOS_DESPACHO = {
  retiro: 'retiro_tienda',
  envio: 'envio_domicilio',
};

export const ORDER_STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  preparado: 'Preparado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export function getOrderSteps(status) {
  const steps = ['pendiente', 'confirmado', 'preparado', 'enviado', 'entregado'];
  const currentIndex = steps.indexOf(status);
  return steps.map((s, i) => ({ key: s, done: i <= currentIndex }));
}
