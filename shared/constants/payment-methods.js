/**
 * Constantes compartidas para métodos de pago
 * Usadas en frontend y backend para garantizar consistencia
 */

export const METODOS_PAGO = {
  TRANSFERENCIA: 'transferencia',
  WEBPAY: 'webpay',
  TARJETA_CREDITO: 'tarjeta_credito',
  TARJETA_DEBITO: 'tarjeta_debito',
  PAYPAL: 'paypal',
  EFECTIVO: 'efectivo'
};

// Array de valores válidos para validación
export const METODOS_PAGO_VALIDOS = Object.values(METODOS_PAGO);

// Opciones con labels e íconos para frontend
export const METODOS_PAGO_OPTIONS = [
  { 
    value: METODOS_PAGO.TRANSFERENCIA, 
    label: 'Transferencia bancaria',
    icon: 'Banknote',
    descripcion: 'Transferencia directa a cuenta bancaria'
  },
  { 
    value: METODOS_PAGO.WEBPAY, 
    label: 'Webpay Plus (Transbank)',
    icon: 'Smartphone',
    descripcion: 'Pago con Webpay de Transbank'
  },
  { 
    value: METODOS_PAGO.TARJETA_CREDITO, 
    label: 'Tarjeta de crédito',
    icon: 'CreditCard',
    descripcion: 'Visa, Mastercard, American Express'
  },
  { 
    value: METODOS_PAGO.TARJETA_DEBITO, 
    label: 'Tarjeta de débito',
    icon: 'Wallet',
    descripcion: 'Redcompra u otra tarjeta de débito'
  },
  { 
    value: METODOS_PAGO.PAYPAL, 
    label: 'PayPal',
    icon: 'Wallet',
    descripcion: 'Pago rápido y seguro con PayPal'
  },
  { 
    value: METODOS_PAGO.EFECTIVO, 
    label: 'Efectivo contra entrega',
    icon: 'CircleDollarSign',
    descripcion: 'Paga en efectivo al recibir tu pedido'
  }
];

/**
 * Valida si un método de pago es válido
 * @param {string} metodoPago - Método de pago a validar
 * @returns {boolean} True si es válido
 */
export function isValidPaymentMethod(metodoPago) {
  return METODOS_PAGO_VALIDOS.includes(metodoPago);
}

/**
 * Obtiene el label de un método de pago
 * @param {string} metodoPago - Valor del método de pago
 * @returns {string} Label legible
 */
export function getPaymentMethodLabel(metodoPago) {
  const method = METODOS_PAGO_OPTIONS.find(m => m.value === metodoPago);
  return method?.label || metodoPago;
}

/**
 * Obtiene el ícono de un método de pago
 * @param {string} metodoPago - Valor del método de pago
 * @returns {string} Nombre del ícono
 */
export function getPaymentMethodIcon(metodoPago) {
  const method = METODOS_PAGO_OPTIONS.find(m => m.value === metodoPago);
  return method?.icon || 'CreditCard';
}
