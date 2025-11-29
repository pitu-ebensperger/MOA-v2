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

export function isValidPaymentMethod(metodoPago) {
  return METODOS_PAGO_VALIDOS.includes(metodoPago);
}

export function getPaymentMethodLabel(metodoPago) {
  const method = METODOS_PAGO_OPTIONS.find(m => m.value === metodoPago);
  return method?.label || metodoPago;
}

export function getPaymentMethodIcon(metodoPago) {
  const method = METODOS_PAGO_OPTIONS.find(m => m.value === metodoPago);
  return method?.icon || 'CreditCard';
}
