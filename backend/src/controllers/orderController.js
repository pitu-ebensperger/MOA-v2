import orderModel from "../models/orderModel.js";
import orderAdminModel from "../models/orderAdminModel.js";
import { getCartItems } from "../models/cartModel.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";
import { pool } from "../../database/config.js";
import { handleError } from "../utils/error.utils.js";
import { METODOS_PAGO_VALIDOS } from "../../../shared/constants/metodos-pago.js";

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

const createOrderFromCart = async (req, res) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { 
      direccion_id, 
      metodo_despacho = 'standard',
      metodo_pago = 'transferencia',
      notas_cliente,
      contacto // { nombre, email, telefono }
    } = req.body;

    // Validación: método de pago válido
    if (!METODOS_PAGO_VALIDOS.includes(metodo_pago)) {
      return res.status(400).json({ 
        success: false, 
        message: `Método de pago inválido: "${metodo_pago}". Valores permitidos: ${METODOS_PAGO_VALIDOS.join(', ')}`,
        field: 'metodo_pago'
      });
    }

    // Validación: dirección obligatoria para métodos de envío
    if (!direccion_id && metodo_despacho !== 'retiro') {
      return res.status(400).json({ 
        success: false, 
        message: 'La dirección de envío es obligatoria para órdenes con despacho' 
      });
    }

    // Obtener items del carrito
    const cartData = await getCartItems(usuarioId);
    if (!cartData.items || cartData.items.length === 0) {
      return res.status(400).json({ success: false, message: 'El carrito está vacío' });
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
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente para algunos productos',
        details: insufficientStock.map(item => ({
          producto: item.nombre,
          solicitado: item.requested,
          disponible: item.available
        }))
      });
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
    return handleError(res, error, 'Error al crear orden');
  }
};

const getUserOrders = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const order = await orderModel.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    // Verificar que la orden pertenezca al usuario
    if (order.usuario_id !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta orden',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const order = await orderModel.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    if (order.usuario_id !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta orden',
      });
    }

    if (order.estado_pago === 'pagado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una orden ya pagada. Solicita un reembolso.',
      });
    }

    const canceledOrder = await orderModel.cancelOrder(id, usuarioId);

    if (!canceledOrder) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo cancelar la orden',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Orden cancelada exitosamente',
      data: canceledOrder,
    });

  } catch (error) {
    console.error('Error cancelando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'El campo status es requerido',
      });
    }

    const normalizedStatus = String(status).trim().toLowerCase();
    const builder = ORDER_STATUS_TRANSITIONS[normalizedStatus];
    if (!builder) {
      const allowedStatuses = Object.keys(ORDER_STATUS_TRANSITIONS).join(', ');
      return res.status(400).json({
        success: false,
        message: `Status inválido. Valores permitidos: ${allowedStatuses}`,
      });
    }

    const existingOrder = await orderAdminModel.getOrderByIdAdmin(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    await orderAdminModel.updateOrderStatus(id, builder());

    const updatedOrder = await orderAdminModel.getOrderByIdAdmin(id);
    const orderToReturn = updatedOrder ?? existingOrder;

    res.status(200).json({
      success: true,
      data: buildOrderStatusPayload(orderToReturn, normalizedStatus),
    });
  } catch (error) {
    console.error('Error actualizando estado de orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
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
