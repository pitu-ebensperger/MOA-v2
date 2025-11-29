import { ValidationError } from "../utils/error.utils.js";
import { METODOS_PAGO_VALIDOS } from "../../../shared/constants/metodos-pago.js";
import { METODOS_DESPACHO_VALIDOS } from "../../../shared/constants/metodos-despacho.js";

/**
 * Middleware: Valida campos obligatorios para crear una orden
 * - direccion_id: requerida si metodo_despacho !== 'retiro_tienda'
 * - metodo_pago: debe estar en la lista de métodos válidos
 * - metodo_despacho: debe estar en la lista de métodos válidos
 */
export const validateCreateOrder = (req, res, next) => {
  const { direccion_id, metodo_despacho = 'standard', metodo_pago } = req.body;

  // Validar método de pago
  if (!metodo_pago) {
    return next(new ValidationError('Método de pago es requerido', [
      { field: 'metodo_pago', message: 'Este campo es obligatorio' }
    ]));
  }

  if (!METODOS_PAGO_VALIDOS.includes(metodo_pago)) {
    return next(new ValidationError(
      `Método de pago inválido: "${metodo_pago}"`,
      [{ 
        field: 'metodo_pago', 
        message: `Valores permitidos: ${METODOS_PAGO_VALIDOS.join(', ')}` 
      }]
    ));
  }

  // Validar método de despacho
  if (metodo_despacho && !METODOS_DESPACHO_VALIDOS.includes(metodo_despacho)) {
    return next(new ValidationError(
      `Método de despacho inválido: "${metodo_despacho}"`,
      [{ 
        field: 'metodo_despacho', 
        message: `Valores permitidos: ${METODOS_DESPACHO_VALIDOS.join(', ')}` 
      }]
    ));
  }

  // Validar dirección obligatoria para envíos (no retiro en tienda)
  if (!direccion_id && metodo_despacho !== 'retiro_tienda') {
    return next(new ValidationError(
      'La dirección de envío es obligatoria para órdenes con despacho',
      [{ field: 'direccion_id', message: 'Este campo es obligatorio para envíos' }]
    ));
  }

  next();
};

/**
 * Middleware: Valida campos para actualizar estado de orden
 * - Al menos un campo de actualización debe estar presente
 */
export const validateOrderUpdate = (req, res, next) => {
  const { 
    estado_pago, 
    estado_envio, 
    fecha_pago, 
    fecha_envio, 
    fecha_entrega_real, 
    numero_seguimiento, 
    empresa_envio 
  } = req.body;

  const hasUpdateFields = 
    estado_pago || 
    estado_envio || 
    fecha_pago || 
    fecha_envio || 
    fecha_entrega_real || 
    numero_seguimiento || 
    empresa_envio;

  if (!hasUpdateFields) {
    return next(new ValidationError(
      'Debe proporcionar al menos un campo para actualizar',
      [{ field: 'body', message: 'No se enviaron campos de actualización' }]
    ));
  }

  next();
};

/**
 * Middleware: Valida campos para asignar seguimiento
 * - numero_seguimiento y empresa_envio son obligatorios
 */
export const validateShippingTracking = (req, res, next) => {
  const { numero_seguimiento, empresa_envio } = req.body;

  if (!numero_seguimiento || !empresa_envio) {
    return next(new ValidationError(
      'Número de seguimiento y empresa de envío son obligatorios',
      [
        ...(!numero_seguimiento ? [{ field: 'numero_seguimiento', message: 'Este campo es obligatorio' }] : []),
        ...(!empresa_envio ? [{ field: 'empresa_envio', message: 'Este campo es obligatorio' }] : [])
      ]
    ));
  }

  next();
};

/**
 * Middleware: Valida que el campo requerido esté presente
 * Genérico, se puede usar con .bind para especificar el campo
 */
export const validateRequiredField = (fieldName) => (req, res, next) => {
  const value = req.body[fieldName] || req.params[fieldName];
  
  if (!value) {
    return next(new ValidationError(
      `${fieldName} es requerido`,
      [{ field: fieldName, message: 'Este campo es obligatorio' }]
    ));
  }

  next();
};
