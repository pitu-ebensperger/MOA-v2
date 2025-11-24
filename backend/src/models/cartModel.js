import { pool } from "../../database/config.js";

export const getOrCreateCart = async (userId) => {
  const queryGet = `
    SELECT * FROM carritos WHERE usuario_id = $1 AND status = 'ABIERTO';
  `;
  const { rows } = await pool.query(queryGet, [userId]);

  if (rows.length > 0) return rows[0];

  const insert = `
    INSERT INTO carritos (usuario_id)
    VALUES ($1)
    RETURNING *;
  `;
  const { rows: created } = await pool.query(insert, [userId]);
  return created[0];
};

export const getCartItems = async (userId) => {
  const cart = await getOrCreateCart(userId);

  const query = `
    SELECT
      ci.carrito_item_id,
      ci.producto_id,
      ci.cantidad,
      ci.precio_unit,
      p.nombre,
      p.slug,
      p.precio_cents,
      p.img_url
    FROM carrito_items ci
    JOIN productos p ON p.producto_id = ci.producto_id
    WHERE ci.carrito_id = $1;
  `;

  const { rows } = await pool.query(query, [cart.carrito_id]);
  return { cart_id: cart.carrito_id, items: rows };
};

export const addItemToCart = async (userId, productId, cantidad = 1) => {
  const cart = await getOrCreateCart(userId);

  const query = `
    INSERT INTO carrito_items (carrito_id, producto_id, cantidad, precio_unit)
    VALUES ($1, $2, $3, (SELECT precio_cents FROM productos WHERE producto_id = $2))
    ON CONFLICT (carrito_id, producto_id)
    DO UPDATE SET cantidad = carrito_items.cantidad + EXCLUDED.cantidad
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [
    cart.carrito_id,
    productId,
    cantidad,
  ]);

  return rows[0];
};

export const removeItemFromCart = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);

  const query = `
    DELETE FROM carrito_items
    WHERE carrito_id = $1 AND producto_id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [cart.carrito_id, productId]);

  return rows[0];
};

export const updateCartItemQuantity = async (userId, productId, cantidad) => {
  const cart = await getOrCreateCart(userId);

  const query = `
    UPDATE carrito_items
    SET cantidad = $3
    WHERE carrito_id = $1 AND producto_id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [
    cart.carrito_id,
    productId,
    cantidad,
  ]);

  return rows[0];
};

export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  await pool.query(`DELETE FROM carrito_items WHERE carrito_id = $1`, [
    cart.carrito_id,
  ]);

  return { ok: true };
};
