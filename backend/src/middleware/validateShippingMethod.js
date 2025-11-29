import { METODOS_DESPACHO_VALIDOS } from '../../../shared/constants/metodos-despacho.js';

export const validateShippingMethod = (req, res, next) => {
  const { metodo_despacho } = req.body;

  if (!metodo_despacho) {
    return next();
  }

  if (!METODOS_DESPACHO_VALIDOS.includes(metodo_despacho)) {
    return res.status(400).json({
      success: false,
      message: `Método de despacho inválido: "${metodo_despacho}". Valores permitidos: ${METODOS_DESPACHO_VALIDOS.join(', ')}`,
      field: 'metodo_despacho',
      validValues: METODOS_DESPACHO_VALIDOS
    });
  }

  next();
};
