import pool from "../../database/config.js";
import { fetchOrderById } from "./orders.shared.js";
import { ValidationError } from "../utils/error.utils.js";

const ORDER_CODE_LOCK_NAMESPACE = 42; // Consistent namespace for advisory locks

const generateOrderCode = async (client = pool) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `MOA-${year}${month}${day}`;
  const dateKey = parseInt(`${year}${month}${day}`, 10);

  // Serialize code generation per day to avoid duplicate order_code under concurrency
  await client.query(
    'SELECT pg_advisory_xact_lock($1, $2)',
    [ORDER_CODE_LOCK_NAMESPACE, dateKey]
  );

  // Buscar el último número del día
  const query = `
    SELECT order_code 
    FROM ordenes 
    WHERE order_code LIKE $1 
    ORDER BY order_code DESC 
    LIMIT 1
  `;
  
  const { rows } = await client.query(query, [`${datePrefix}-%`]);
  
  let sequence = 1;
  if (rows.length > 0) {
    const lastCode = rows[0].order_code;
    const lastNumber = parseInt(lastCode.split('-').pop());
    sequence = lastNumber + 1;
  }

  return `${datePrefix}-${String(sequence).padStart(4, '0')}`;
};

const createOrder = async (orderData) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      usuario_id,
      items, // Array de { producto_id, cantidad, precio_unit }
      direccion_id,
      metodo_despacho = 'standard',
      metodo_pago = 'transferencia',
      subtotal_cents = 0,
      envio_cents = 0,
      total_cents,
      notas_cliente,
    } = orderData;

    // Generar código de orden (usando el client para consistencia en la transacción)
    let order_code = await generateOrderCode(client);

    // Validar y descontar stock con row-level locks (previene race conditions)
    if (items && items.length > 0) {
      for (const item of items) {
        const stockResult = await client.query(
          'SELECT stock, nombre FROM productos WHERE producto_id = $1 FOR UPDATE',
          [item.producto_id]
        );
        
        const product = stockResult.rows[0];
        if (!product) {
          throw new Error(`Producto ${item.producto_id} no encontrado`);
        }
        
        if (product.stock < item.cantidad) {
          throw new ValidationError(`Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}, solicitado: ${item.cantidad}`);
        }
        
        // Descontar stock
        await client.query(
          'UPDATE productos SET stock = stock - $1::int WHERE producto_id = $2',
          [item.cantidad, item.producto_id]
        );
      }
    }

    // Crear orden con estado_orden='confirmado' para órdenes exitosas
    const insertOrderQuery = `
      INSERT INTO ordenes (
        order_code,
        usuario_id,
        direccion_id,
        metodo_despacho,
        metodo_pago,
        subtotal_cents,
        envio_cents,
        total_cents,
        notas_cliente,
        estado_orden
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    // Intentar insertar la orden con reintentos si hay conflicto en order_code
    const maxAttempts = 5;
    let orden;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await client.query(insertOrderQuery, [
          order_code,
          usuario_id,
          direccion_id,
          metodo_despacho,
          metodo_pago,
          subtotal_cents,
          envio_cents,
          total_cents,
          notas_cliente,
          'confirmado', // Estado confirmado por defecto
        ]);
        orden = result.rows[0];
        break;
      } catch (err) {
        // Si hay violación de unicidad en order_code, regenerar y reintentar
        if (err?.code === '23505' && String(err.detail || '').includes('order_code')) {
          if (attempt === maxAttempts) throw err;
          // Regenerar un nuevo código y reintentar
          order_code = await generateOrderCode(client);
          continue;
        }
        throw err;
      }
    }

    // Insertar items de la orden
    if (items && items.length > 0) {
      const insertItemsQuery = `
        INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unit)
        VALUES ($1, $2, $3, $4)
      `;

      for (const item of items) {
        await client.query(insertItemsQuery, [
          orden.orden_id,
          item.producto_id,
          item.cantidad,
          item.precio_unit,
        ]);
      }
    }

    // Limpiar carrito DESPUÉS de que todo lo anterior fue exitoso
    await client.query(
      'DELETE FROM carrito_items WHERE carrito_id IN (SELECT carrito_id FROM carritos WHERE usuario_id = $1)',
      [usuario_id]
    );

    await client.query('COMMIT');

    // Retornar orden completa con items
    return getOrderById(orden.orden_id);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getOrderById = async (ordenId) => {
  return fetchOrderById({ ordenId, includeAdminFields: false });
};

const getOrdersByUserId = async (usuarioId, options = {}) => {
  const { limit = 20, offset = 0 } = options;

  const query = `
    SELECT 
      o.*,
      COUNT(oi.orden_item_id) as total_items
    FROM ordenes o
    LEFT JOIN orden_items oi ON o.orden_id = oi.orden_id
    WHERE o.usuario_id = $1
    GROUP BY o.orden_id
    ORDER BY o.creado_en DESC
    LIMIT $2 OFFSET $3
  `;

  const { rows } = await pool.query(query, [usuarioId, limit, offset]);
  return rows;
};

const cancelOrder = async (ordenId, usuarioId) => {
  // Por ahora solo verifica que la orden existe y pertenece al usuario
  // Cuando agregues estado_pago, podrás agregar lógica de cancelación
  const query = `
    SELECT * FROM ordenes 
    WHERE orden_id = $1 AND usuario_id = $2
  `;

  const { rows } = await pool.query(query, [ordenId, usuarioId]);
  return rows[0] || null;
};

const orderModel = {
  createOrder,
  getOrderById,
  getOrdersByUserId,
  cancelOrder,
};

export default orderModel;
