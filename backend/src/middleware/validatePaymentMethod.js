/**
 * Middleware para validar método de pago
 */

import { METODOS_PAGO_VALIDOS } from '../../shared/constants/payment-methods.js';

/**
 * Valida que el método de pago sea uno de los permitidos
 */
export const validatePaymentMethod = (req, res, next) => {
  const { metodo_pago } = req.body;

  // Si no se envió, permitir (usará default)
  if (!metodo_pago) {
    return next();
  }

  // Validar que sea uno de los permitidos
  if (!METODOS_PAGO_VALIDOS.includes(metodo_pago)) {
    return res.status(400).json({
      success: false,
      message: `Método de pago inválido: "${metodo_pago}". Valores permitidos: ${METODOS_PAGO_VALIDOS.join(', ')}`,
      field: 'metodo_pago',
      validValues: METODOS_PAGO_VALIDOS
    });
  }

  next();
};
