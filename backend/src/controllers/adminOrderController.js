import orderAdminModel from "../models/orderAdminModel.js";
import {
  EMPRESAS_ENVIO_VALIDOS,
  isValidEmpresaEnvio,
} from "../../../shared/constants/empresas-envio.js";
import { IS_DEVELOPMENT } from "../utils/env.js";
import { ValidationError, NotFoundError } from "../utils/error.utils.js";
import { ESTADOS_PAGO_VALIDOS, ESTADOS_ENVIO_VALIDOS } from "../../../shared/constants/estados-orden.js";

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

const getAllOrders = async (req, res, next) => {
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
    console.error('Error obteniendo órdenes admin:', error);
    next(error);
  }
};

const CSV_BOM = "\uFEFF";

// EXPORTAR ÓRDENES CSV
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
    console.error('Error eliminando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la orden',
      error: IS_DEVELOPMENT ? error.message : undefined,
    });
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await orderAdminModel.getOrderByIdAdmin(id);

    if (!order) {
      throw new NotFoundError('Orden');
    }

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error('Error obteniendo orden admin:', error);
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
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

    if (!estado_pago && !estado_envio && !fecha_pago && !fecha_envio && !fecha_entrega_real && !numero_seguimiento && !empresa_envio) {
      throw new ValidationError('Debe proporcionar al menos un campo para actualizar');
    }

    if (estado_pago && !ESTADOS_PAGO_VALIDOS.includes(estado_pago)) {
      throw new ValidationError(
        `Estado de pago inválido: "${estado_pago}"`,
        [{ field: 'estado_pago', message: `Valores permitidos: ${ESTADOS_PAGO_VALIDOS.join(', ')}` }]
      );
    }

    if (estado_envio && !ESTADOS_ENVIO_VALIDOS.includes(estado_envio)) {
      throw new ValidationError(
        `Estado de envío inválido: "${estado_envio}"`,
        [{ field: 'estado_envio', message: `Valores permitidos: ${ESTADOS_ENVIO_VALIDOS.join(', ')}` }]
      );
    }

    if (empresa_envio && !isValidEmpresaEnvio(empresa_envio)) {
      throw new ValidationError(
        `Empresa de envío inválida: "${empresa_envio}"`,
        [{ field: 'empresa_envio', message: `Valores permitidos: ${EMPRESAS_ENVIO_VALIDOS.join(', ')}` }]
      );
    }

    const existingOrder = await orderAdminModel.getOrderByIdAdmin(id);
    if (!existingOrder) {
      throw new NotFoundError('Orden');
    }

    const updateData = {
      estado_pago,
      estado_envio,
      fecha_pago,
      fecha_envio,
      fecha_entrega_real,
      numero_seguimiento,
      empresa_envio,
    };

    if (estado_pago === 'pagado' && !fecha_pago) {
      updateData.fecha_pago = new Date().toISOString();
    }

    if (estado_envio === 'enviado' && !fecha_envio) {
      updateData.fecha_envio = new Date().toISOString();
    }

    if (estado_envio === 'entregado' && !fecha_entrega_real) {
      updateData.fecha_entrega_real = new Date().toISOString();
    }

    const updatedOrder = await orderAdminModel.updateOrderStatus(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Estado de orden actualizado exitosamente',
      data: updatedOrder,
    });

  } catch (error) {
    console.error('Error actualizando estado de orden:', error);
    next(error);
  }
};

const addTrackingInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      numero_seguimiento,
      empresa_envio,
      fecha_envio,
    } = req.body;

    if (!numero_seguimiento || !empresa_envio) {
      throw new ValidationError(
        'Número de seguimiento y empresa de envío son obligatorios',
        [
          ...(!numero_seguimiento ? [{ field: 'numero_seguimiento', message: 'Este campo es obligatorio' }] : []),
          ...(!empresa_envio ? [{ field: 'empresa_envio', message: 'Este campo es obligatorio' }] : [])
        ]
      );
    }

    if (!isValidEmpresaEnvio(empresa_envio)) {
      throw new ValidationError(
        `Empresa de envío inválida: "${empresa_envio}"`,
        [{ field: 'empresa_envio', message: `Valores permitidos: ${EMPRESAS_ENVIO_VALIDOS.join(', ')}` }]
      );
    }

    const existingOrder = await orderAdminModel.getOrderByIdAdmin(id);
    if (!existingOrder) {
      throw new NotFoundError('Orden');
    }

    const updatedOrder = await orderAdminModel.addTrackingInfo(id, {
      numero_seguimiento,
      empresa_envio,
      fecha_envio,
    });

    res.status(200).json({
      success: true,
      message: 'Información de seguimiento agregada exitosamente',
      data: updatedOrder,
    });

  } catch (error) {
    console.error('Error agregando información de seguimiento:', error);
    next(error);
  }
};

const getOrderStats = async (req, res, next) => {
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
    next(error);
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
