import orderAdminModel from "../models/orderAdminModel.js";
import {
  SHIPPING_COMPANY_LABELS,
  normalizeShippingCompany,
} from "../../shared/constants/shipping-companies.js";

const CSV_COLUMNS = [
  { label: "Orden ID", key: "orden_id" },
  { label: "Código", key: "order_code" },
  { label: "Cliente", key: "usuario_nombre" },
  { label: "Email", key: "usuario_email" },
  { label: "Estado de pago", key: "estado_pago" },
  { label: "Estado de envío", key: "estado_envio" },
  { label: "Método de pago", key: "metodo_pago" },
  { label: "Método de despacho", key: "metodo_despacho" },
  {
    label: "Total (CLP)",
    key: "total_cents",
    transform: (order) => ((order.total_cents ?? 0) / 100).toFixed(2),
  },
  { label: "Cantidad de ítems", key: "total_items" },
  { label: "Fecha de creación", key: "creado_en", transform: (order) => formatCsvDate(order.creado_en) },
  { label: "Fecha de pago", key: "fecha_pago", transform: (order) => formatCsvDate(order.fecha_pago) },
  { label: "Fecha de envío", key: "fecha_envio", transform: (order) => formatCsvDate(order.fecha_envio) },
  {
    label: "Fecha de entrega",
    key: "fecha_entrega_real",
    transform: (order) => formatCsvDate(order.fecha_entrega_real),
  },
  { label: "Número de seguimiento", key: "numero_seguimiento" },
  { label: "Empresa de envío", key: "empresa_envio" },
];

function formatCsvDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function serializeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }
  const text = typeof value === "number" ? String(value) : value;
  const escaped = String(text).replace(/"/g, '""');
  return `"${escaped}"`;
}

const getAllOrders = async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      estado_pago,
      estado_envio,
      metodo_despacho,
      fecha_desde,
      fecha_hasta,
      search,
      usuario_id,
      order_by = 'creado_en',
      order_dir = 'DESC',
    } = req.query;

    const result = await orderAdminModel.getAllOrders({
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      estado_pago,
      estado_envio,
      metodo_despacho,
      fecha_desde,
      fecha_hasta,
      search,
      usuario_id,
      order_by,
      order_dir,
    });

    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });

  } catch (error) {
    console.error('Error obteniendo órdenes (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const CSV_BOM = "\uFEFF";

const exportOrdersCSV = async (req, res) => {
  try {
    const params = {
      ...req.query,
    };

    const orders = await orderAdminModel.getOrdersForExport(params);
    const headerRow = CSV_COLUMNS.map(col => serializeCsvValue(col.label)).join(',');
    const rows = orders.map(order => {
      const values = CSV_COLUMNS.map(col => {
        const rawValue = col.transform ? col.transform(order) : order[col.key];
        return serializeCsvValue(rawValue);
      });
      return values.join(',');
    });

    const csvContent = [headerRow, ...rows].join('\n');
    const fileName = `ordenes-moa-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(200).send(`${CSV_BOM}${csvContent}`);

  } catch (error) {
    console.error('Error exportando órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar órdenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/*GET /admin/pedidos/:id */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderAdminModel.getOrderByIdAdmin(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error('Error obteniendo orden (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/*PATCH /admin/pedidos/:id/estado
PUT /api/admin/orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      estado_pago,
      estado_envio,
      fecha_pago,
      fecha_envio,
      fecha_entrega_real,
      numero_seguimiento,
      empresa_envio,
    } = req.body;

    // Validar que al menos un campo esté presente
    if (!estado_pago && !estado_envio && !fecha_pago && !fecha_envio && !fecha_entrega_real && !numero_seguimiento && !empresa_envio) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo para actualizar',
      });
    }

    // Validar valores de estados si están presentes
    const validEstadosPago = ['pendiente', 'pagado', 'rechazado', 'reembolsado'];
    if (estado_pago && !validEstadosPago.includes(estado_pago)) {
      return res.status(400).json({
        success: false,
        message: `Estado de pago inválido. Valores permitidos: ${validEstadosPago.join(', ')}`,
      });
    }

    const validEstadosEnvio = ['preparacion', 'enviado', 'en_transito', 'entregado', 'cancelado'];
    if (estado_envio && !validEstadosEnvio.includes(estado_envio)) {
      return res.status(400).json({
        success: false,
        message: `Estado de envío inválido. Valores permitidos: ${validEstadosEnvio.join(', ')}`,
      });
    }

    const normalizedEmpresaEnvio = empresa_envio ? normalizeShippingCompany(empresa_envio) : undefined;

    // Validar empresas de envío válidas
    if (empresa_envio && !normalizedEmpresaEnvio) {
      return res.status(400).json({
        success: false,
        message: `Empresa de envío inválida. Valores permitidos: ${SHIPPING_COMPANY_LABELS.join(', ')}`,
      });
    }

    // Verificar que la orden existe
    const existingOrder = await orderAdminModel.getOrderByIdAdmin(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    // Establecer fechas automáticamente si no vienen en el request
    const updateData = {
      estado_pago,
      estado_envio,
      fecha_pago,
      fecha_envio,
      fecha_entrega_real,
      numero_seguimiento,
      empresa_envio: normalizedEmpresaEnvio,
    };

    // Auto-establecer fecha_pago si estado_pago cambia a 'pagado'
    if (estado_pago === 'pagado' && !fecha_pago) {
      updateData.fecha_pago = new Date().toISOString();
    }

    // Auto-establecer fecha_envio si estado_envio cambia a 'enviado'
    if (estado_envio === 'enviado' && !fecha_envio) {
      updateData.fecha_envio = new Date().toISOString();
    }

    // Auto-establecer fecha_entrega_real si estado_envio cambia a 'entregado'
    if (estado_envio === 'entregado' && !fecha_entrega_real) {
      updateData.fecha_entrega_real = new Date().toISOString();
    }

    // Actualizar
    const updatedOrder = await orderAdminModel.updateOrderStatus(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Estado de orden actualizado exitosamente',
      data: updatedOrder,
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

/*POST /admin/pedidos/:id/seguimiento */
const addTrackingInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numero_seguimiento,
      empresa_envio,
      fecha_envio,
    } = req.body;

    // Validar campos requeridos
    if (!numero_seguimiento || !empresa_envio) {
      return res.status(400).json({
        success: false,
        message: 'numero_seguimiento y empresa_envio son requeridos',
      });
    }

    // Validar empresa de envío
    const normalizedEmpresaEnvio = normalizeShippingCompany(empresa_envio);
    if (!normalizedEmpresaEnvio) {
      return res.status(400).json({
        success: false,
        message: `Empresa de envío inválida. Valores permitidos: ${SHIPPING_COMPANY_LABELS.join(', ')}`,
      });
    }

    // Verificar que la orden existe
    const existingOrder = await orderAdminModel.getOrderByIdAdmin(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    // Agregar tracking
    const updatedOrder = await orderAdminModel.addTrackingInfo(id, {
      numero_seguimiento,
      empresa_envio: normalizedEmpresaEnvio,
      fecha_envio,
    });

    res.status(200).json({
      success: true,
      message: 'Información de seguimiento agregada exitosamente',
      data: updatedOrder,
    });

  } catch (error) {
    console.error('Error agregando información de seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar información de seguimiento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    const stats = await orderAdminModel.getOrderStats({
      fecha_desde,
      fecha_hasta,
    });

    res.status(200).json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


const orderAdminController = {
  getAllOrders,
  exportOrdersCSV,
  getOrderById,
  updateOrderStatus,
  addTrackingInfo,
  getOrderStats,
};

export default orderAdminController;
