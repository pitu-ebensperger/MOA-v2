import { METODOS_PAGO_VALIDOS } from '../../../shared/constants/metodos-pago.js';

export const validatePaymentMethod = (req, res, next) => {
  const { metodo_pago } = req.body;

  if (!metodo_pago) {
    return next();
  }

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
