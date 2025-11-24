import pool from "../../database/config.js";

/**
 * Devuelve una orden con sus items. Si `includeAdminFields` es true,
 * incluye campos adicionales (public_id usuario, sku y stock del producto).
 */
export const fetchOrderById = async ({ ordenId, includeAdminFields = false }) => {
  const userSelect = `
    u.nombre as usuario_nombre,
    u.email as usuario_email,
    u.telefono as usuario_telefono
  `;

  const userSelectAdmin = `, u.public_id as usuario_public_id`;

  const query = `
    SELECT 
      o.*,
      ${userSelect}${includeAdminFields ? userSelectAdmin : ''}
    FROM ordenes o
    LEFT JOIN usuarios u ON o.usuario_id = u.usuario_id
    WHERE o.orden_id = $1
  `;

  const { rows } = await pool.query(query, [ordenId]);
  if (rows.length === 0) return null;

  const orden = rows[0];

  const itemBase = `
    oi.*,
    p.nombre as producto_nombre,
    p.slug as producto_slug,
    p.img_url as producto_img
  `;

  const itemAdminExtra = `, p.sku as producto_sku, p.stock as producto_stock_actual`;

  const itemsQuery = `
    SELECT 
      ${itemBase}${includeAdminFields ? itemAdminExtra : ''}
    FROM orden_items oi
    LEFT JOIN productos p ON oi.producto_id = p.producto_id
    WHERE oi.orden_id = $1
  `;

  const { rows: items } = await pool.query(itemsQuery, [ordenId]);

  return {
    ...orden,
    items,
  };
};

export default fetchOrderById;
