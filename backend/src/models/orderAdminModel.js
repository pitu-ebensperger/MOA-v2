import pool from "../../database/config.js";
import { fetchOrderById } from "./orders.shared.js";

const ORDERABLE_COLUMNS = ['creado_en', 'total_cents', 'order_code'];

const resolveOrderByColumn = (orderBy) => {
  return ORDERABLE_COLUMNS.includes(orderBy) ? `o.${orderBy}` : 'o.creado_en';
};

const resolveOrderDirection = (orderDir) => {
  return orderDir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
};

const buildOrderFilters = (options = {}) => {
  const {
    fecha_desde,
    fecha_hasta,
    search,
    estado_pago,
    estado_envio,
    metodo_despacho,
    usuario_id,
  } = options;

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (usuario_id) {
    conditions.push(`AND o.usuario_id = $${paramIndex}`);
    params.push(usuario_id);
    paramIndex++;
  }

  if (fecha_desde) {
    conditions.push(`AND o.creado_en >= $${paramIndex}`);
    params.push(fecha_desde);
    paramIndex++;
  }

  if (fecha_hasta) {
    conditions.push(`AND o.creado_en <= $${paramIndex}`);
    params.push(fecha_hasta);
    paramIndex++;
  }

  if (search) {
    conditions.push(`
      AND (
        o.order_code ILIKE $${paramIndex} OR
        u.email ILIKE $${paramIndex} OR
        u.nombre ILIKE $${paramIndex}
      )
    `);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (estado_pago) {
    conditions.push(`AND o.estado_pago = $${paramIndex}`);
    params.push(estado_pago);
    paramIndex++;
  }

  if (estado_envio) {
    conditions.push(`AND o.estado_envio = $${paramIndex}`);
    params.push(estado_envio);
    paramIndex++;
  }

  if (metodo_despacho) {
    conditions.push(`AND o.metodo_despacho = $${paramIndex}`);
    params.push(metodo_despacho);
    paramIndex++;
  }

  const clause = conditions.length ? ` ${conditions.join(' ')}` : '';
  return {
    clause,
    params,
    nextParamIndex: paramIndex,
  };
};

const getAllOrders = async (options = {}) => {
  const {
    limit = 20,
    offset = 0,
    fecha_desde,
    fecha_hasta,
    search,
    estado_pago,
    estado_envio,
    metodo_despacho,
    usuario_id,
    order_by = 'creado_en',
    order_dir = 'DESC',
  } = options;

  const orderByColumn = resolveOrderByColumn(order_by);
  const orderDirection = resolveOrderDirection(order_dir);

  const mainFilters = buildOrderFilters({
    fecha_desde,
    fecha_hasta,
    search,
    estado_pago,
    estado_envio,
    metodo_despacho,
    usuario_id,
  });

  let query = `
    SELECT 
      o.*,
      u.nombre as usuario_nombre,
      u.email as usuario_email,
      u.telefono as usuario_telefono,
      COUNT(oi.orden_item_id) as total_items
    FROM ordenes o
    LEFT JOIN usuarios u ON o.usuario_id = u.usuario_id
    LEFT JOIN orden_items oi ON o.orden_id = oi.orden_id
    WHERE 1=1${mainFilters.clause}
  `;

  query += `
    GROUP BY o.orden_id, u.usuario_id, u.nombre, u.email, u.telefono
  `;

  query += ` ORDER BY ${orderByColumn} ${orderDirection}`;
  query += ` LIMIT $${mainFilters.nextParamIndex} OFFSET $${mainFilters.nextParamIndex + 1}`;

  const params = [...mainFilters.params, limit, offset];
  const { rows } = await pool.query(query, params);

  const countFilters = buildOrderFilters({
    fecha_desde,
    fecha_hasta,
    search,
    estado_pago,
    estado_envio,
    metodo_despacho,
    usuario_id,
  });

  let countQuery = `
    SELECT COUNT(DISTINCT o.orden_id) as total
    FROM ordenes o
    LEFT JOIN usuarios u ON o.usuario_id = u.usuario_id
    WHERE 1=1${countFilters.clause}
  `;

  const { rows: [{ total }] } = await pool.query(countQuery, countFilters.params);

  return {
    orders: rows,
    pagination: {
      total: Number.parseInt(total),
      limit,
      offset,
      hasMore: offset + limit < Number.parseInt(total),
    },
  };
};

const getOrdersForExport = async (options = {}) => {
  const {
    fecha_desde,
    fecha_hasta,
    search,
    estado_pago,
    estado_envio,
    metodo_despacho,
    order_by = 'creado_en',
    order_dir = 'DESC',
  } = options;

  const orderByColumn = resolveOrderByColumn(order_by);
  const orderDirection = resolveOrderDirection(order_dir);

  const filters = buildOrderFilters({
    fecha_desde,
    fecha_hasta,
    search,
    estado_pago,
    estado_envio,
    metodo_despacho,
  });

  let query = `
    SELECT 
      o.*,
      u.nombre as usuario_nombre,
      u.email as usuario_email,
      u.telefono as usuario_telefono,
      COUNT(oi.orden_item_id) as total_items
    FROM ordenes o
    LEFT JOIN usuarios u ON o.usuario_id = u.usuario_id
    LEFT JOIN orden_items oi ON o.orden_id = oi.orden_id
    WHERE 1=1${filters.clause}
    GROUP BY o.orden_id, u.usuario_id, u.nombre, u.email, u.telefono
    ORDER BY ${orderByColumn} ${orderDirection}
  `;

  const { rows } = await pool.query(query, filters.params);
  return rows;
};

const getOrderByIdAdmin = async (ordenId) => {
  return fetchOrderById({ ordenId, includeAdminFields: true });
};

const updateOrderStatus = async (ordenId, updates = {}) => {
  const {
    estado_pago,
    estado_envio,
    fecha_pago,
    fecha_envio,
    fecha_entrega_real,
    numero_seguimiento,
    empresa_envio,
  } = updates;

  const fields = [];
  const params = [];
  let paramIndex = 1;

  if (estado_pago !== undefined) {
    fields.push(`estado_pago = $${paramIndex}`);
    params.push(estado_pago);
    paramIndex++;
  }

  if (estado_envio !== undefined) {
    fields.push(`estado_envio = $${paramIndex}`);
    params.push(estado_envio);
    paramIndex++;
  }

  if (fecha_pago !== undefined) {
    fields.push(`fecha_pago = $${paramIndex}`);
    params.push(fecha_pago);
    paramIndex++;
  }

  if (fecha_envio !== undefined) {
    fields.push(`fecha_envio = $${paramIndex}`);
    params.push(fecha_envio);
    paramIndex++;
  }

  if (fecha_entrega_real !== undefined) {
    fields.push(`fecha_entrega_real = $${paramIndex}`);
    params.push(fecha_entrega_real);
    paramIndex++;
  }

  if (numero_seguimiento !== undefined) {
    fields.push(`numero_seguimiento = $${paramIndex}`);
    params.push(numero_seguimiento);
    paramIndex++;
  }

  if (empresa_envio !== undefined) {
    fields.push(`empresa_envio = $${paramIndex}`);
    params.push(empresa_envio);
    paramIndex++;
  }

  if (fields.length === 0) {
    // Si no hay campos para actualizar, retornar la orden actual
    const query = `SELECT * FROM ordenes WHERE orden_id = $1`;
    const { rows } = await pool.query(query, [ordenId]);
    return rows[0];
  }

  // Construir query de actualización
  const query = `
    UPDATE ordenes 
    SET ${fields.join(', ')}
    WHERE orden_id = $${paramIndex}
    RETURNING *
  `;

  params.push(ordenId);

  const { rows } = await pool.query(query, params);
  return rows[0];
};

const addTrackingInfo = async (ordenId, trackingData) => {
  const { numero_seguimiento, empresa_envio, fecha_envio } = trackingData;

  const fields = [];
  const params = [];
  let paramIndex = 1;

  if (numero_seguimiento !== undefined) {
    fields.push(`numero_seguimiento = $${paramIndex}`);
    params.push(numero_seguimiento);
    paramIndex++;
  }

  if (empresa_envio !== undefined) {
    fields.push(`empresa_envio = $${paramIndex}`);
    params.push(empresa_envio);
    paramIndex++;
  }

  if (fecha_envio !== undefined) {
    fields.push(`fecha_envio = $${paramIndex}`);
    params.push(fecha_envio);
    paramIndex++;
  }

  // Si se agrega tracking, también actualizar estado_envio a 'enviado'
  if (fields.length > 0) {
    fields.push(`estado_envio = $${paramIndex}`);
    params.push('enviado');
    paramIndex++;
  }

  if (fields.length === 0) {
    // Si no hay campos para actualizar, retornar la orden actual
    const query = `SELECT * FROM ordenes WHERE orden_id = $1`;
    const { rows } = await pool.query(query, [ordenId]);
    return rows[0];
  }

  // Construir query de actualización
  const query = `
    UPDATE ordenes 
    SET ${fields.join(', ')}
    WHERE orden_id = $${paramIndex}
    RETURNING *
  `;

  params.push(ordenId);

  const { rows } = await pool.query(query, params);
  return rows[0];
};

const getOrderStats = async (options = {}) => {
  const { fecha_desde, fecha_hasta } = options;

  let query = `
    SELECT 
      COUNT(*) as total_ordenes,
      SUM(total_cents) as total_ventas_cents,
      AVG(total_cents) as ticket_promedio_cents
    FROM ordenes
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (fecha_desde) {
    query += ` AND creado_en >= $${paramIndex}`;
    params.push(fecha_desde);
    paramIndex++;
  }

  if (fecha_hasta) {
    query += ` AND creado_en <= $${paramIndex}`;
    params.push(fecha_hasta);
    paramIndex++;
  }

  const { rows } = await pool.query(query, params);
  return rows[0];
};

const getOrdersByDateRange = async (fechaDesde, fechaHasta, options = {}) => {
  const { estado_pago, estado_envio, limit = 100 } = options;

  let query = `
    SELECT 
      o.*,
      u.nombre as usuario_nombre,
      u.email as usuario_email,
      COUNT(oi.orden_item_id) as total_items
    FROM ordenes o
    LEFT JOIN usuarios u ON o.usuario_id = u.usuario_id
    LEFT JOIN orden_items oi ON o.orden_id = oi.orden_id
    WHERE o.creado_en >= $1 AND o.creado_en <= $2
  `;

  const params = [fechaDesde, fechaHasta];
  let paramIndex = 3;

  if (estado_pago) {
    query += ` AND o.estado_pago = $${paramIndex}`;
    params.push(estado_pago);
    paramIndex++;
  }

  if (estado_envio) {
    query += ` AND o.estado_envio = $${paramIndex}`;
    params.push(estado_envio);
    paramIndex++;
  }

  query += `
    GROUP BY o.orden_id, u.usuario_id, u.nombre, u.email, u.telefono
    ORDER BY o.creado_en DESC
    LIMIT $${paramIndex}
  `;

  params.push(limit);

  const { rows } = await pool.query(query, params);
  return rows;
};

const orderAdminModel = {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  addTrackingInfo,
  getOrderStats,
  getOrdersByDateRange,
  getOrdersForExport,
};

export default orderAdminModel;
