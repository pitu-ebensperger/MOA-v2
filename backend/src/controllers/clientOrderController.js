import orderModel from "../models/orderModel.js";
import orderAdminModel from "../models/orderAdminModel.js";
import { getCartItems } from "../models/cartModel.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";
import { pool } from "../../database/config.js";
import { handleError, ValidationError } from "../utils/error.utils.js";
import { IS_DEVELOPMENT } from "../utils/env.js";

const getRequestUserId = (req) => req.user?.usuario_id ?? req.user?.id;

const ORDER_STATUS_TRANSITIONS = {
  pending: () => ({
    estado_pago: 'pendiente',
    estado_envio: 'preparacion',
  }),
  processing: () => ({
    estado_pago: 'procesando',
    estado_envio: 'preparacion',
  }),
  shipped: () => ({
    estado_pago: 'pagado',
    estado_envio: 'enviado',
  }),
  fulfilled: () => ({
    estado_pago: 'pagado',
    estado_envio: 'entregado',
    fecha_entrega_real: new Date().toISOString(),
  }),
  cancelled: () => ({
    estado_pago: 'cancelado',
    estado_envio: 'devuelto',
  }),
};

const buildOrderStatusPayload = (order, status) => ({
  ...order,
  status,
});

const createOrderFromCart = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { 
      direccion_id, 
      metodo_despacho = 'standard',
      metodo_pago = 'transferencia',
      notas_cliente,
      contacto // { nombre, email, telefono }
    } = req.body;

    const cartData = await getCartItems(usuarioId);
    if (!cartData.items || cartData.items.length === 0) {
      throw new ValidationError('El carrito está vacío', [
        { field: 'carrito', message: 'Debe agregar productos al carrito antes de crear una orden' }
      ]);
    }

    // Validar stock disponible para cada producto
    const stockValidation = await Promise.all(
      cartData.items.map(async (item) => {
        const result = await pool.query(
          'SELECT stock, nombre FROM productos WHERE producto_id = $1',
          [item.producto_id]
        );
        const product = result.rows[0];
        return {
          producto_id: item.producto_id,
          nombre: product?.nombre || 'Producto desconocido',
          requested: item.cantidad,
          available: product?.stock || 0,
          valid: product && product.stock >= item.cantidad
        };
      })
    );

    const insufficientStock = stockValidation.filter(v => !v.valid);
    if (insufficientStock.length > 0) {
      throw new ValidationError('Stock insuficiente para algunos productos', 
        insufficientStock.map(item => ({
          field: 'stock',
          message: `${item.nombre}: solicitado ${item.requested}, disponible ${item.available}`
        }))
      );
    }

    // Calcular subtotal desde los items del carrito
    const subtotal_cents = cartData.items.reduce((sum, item) => sum + (item.precio_unit * item.cantidad), 0);

    // Calcular costo de envío según método
    const envio_cents = metodo_despacho === 'express' ? 6900 : 0;
    const total_cents = subtotal_cents + envio_cents;

    // Preparar items para la orden
    const items = cartData.items.map(item => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unit: item.precio_unit,
    }));

    // Crear orden con datos completos
    const orderData = {
      usuario_id: usuarioId,
      direccion_id: direccion_id || null,
      metodo_despacho,
      metodo_pago,
      subtotal_cents,
      envio_cents,
      total_cents,
      items,
      notas_cliente: notas_cliente || null,
      contacto, // Pasamos contacto al modelo
    };

    const orden = await orderModel.createOrder(orderData);

    // Enviar email de confirmación (sin bloquear la respuesta)
    sendOrderConfirmationEmail({
      order: orden,
      user: { 
        email: contacto?.email || req.user?.email,
        nombre: contacto?.nombre || req.user?.nombre
      }
    }).catch(error => {
      console.error('[Order] Error enviando email de confirmación:', error);
      // No fallar la orden si el email falla
    });

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: orden,
    });

  } catch (error) {
    console.error('Error creando orden:', error);
    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { limit = 20, offset = 0, estado_pago, estado_envio } = req.query;

    const orders = await orderModel.getOrdersByUserId(usuarioId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      estado_pago,
      estado_envio,
    });

    res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const order = await orderModel.getOrderById(id);

    if (!order) {
      const { NotFoundError } = await import('../utils/error.utils.js');
      throw new NotFoundError('Orden');
    }

    // Verificar que la orden pertenezca al usuario
    if (order.usuario_id !== usuarioId) {
      const { ForbiddenError } = await import('../utils/error.utils.js');
      throw new ForbiddenError('No tienes permiso para ver esta orden');
    }

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error('Error obteniendo orden:', error);
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const order = await orderModel.getOrderById(id);

    if (!order) {
      const { NotFoundError } = await import('../utils/error.utils.js');
      throw new NotFoundError('Orden');
    }

    if (order.usuario_id !== usuarioId) {
      const { ForbiddenError } = await import('../utils/error.utils.js');
      throw new ForbiddenError('No tienes permiso para cancelar esta orden');
    }

    if (order.estado_pago === 'pagado') {
      throw new ValidationError(
        'No se puede cancelar una orden ya pagada. Solicita un reembolso.',
        [{ field: 'estado_pago', message: 'La orden ya fue pagada' }]
      );
    }

    const canceledOrder = await orderModel.cancelOrder(id, usuarioId);

    if (!canceledOrder) {
      throw new ValidationError('No se pudo cancelar la orden');
    }

    res.status(200).json({
      success: true,
      message: 'Orden cancelada exitosamente',
      data: canceledOrder,
    });

  } catch (error) {
    console.error('Error cancelando orden:', error);
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ValidationError('El campo status es requerido', [
        { field: 'status', message: 'Este campo es obligatorio' }
      ]);
    }

    const normalizedStatus = String(status).trim().toLowerCase();
    const builder = ORDER_STATUS_TRANSITIONS[normalizedStatus];
    if (!builder) {
      const allowedStatuses = Object.keys(ORDER_STATUS_TRANSITIONS).join(', ');
      throw new ValidationError(
        `Status inválido: "${status}"`,
        [{ field: 'status', message: `Valores permitidos: ${allowedStatuses}` }]
      );
    }

    const existingOrder = await orderAdminModel.getOrderByIdAdmin(id);
    if (!existingOrder) {
      const { NotFoundError } = await import('../utils/error.utils.js');
      throw new NotFoundError('Orden');
    }

    await orderAdminModel.updateOrderStatus(id, builder());

    const updatedOrder = await orderAdminModel.getOrderByIdAdmin(id);
    const orderToReturn = updatedOrder ?? existingOrder;

    res.status(200).json({
      success: true,
      data: buildOrderStatusPayload(orderToReturn, normalizedStatus),
    });
  } catch (error) {
    console.error('Error actualizando orden:', error);
    next(error);
  }
};

const orderController = {
  createOrderFromCart,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
};

export default orderController;
