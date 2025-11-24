import { pool } from "../../database/config.js";

export const getWishlistModel = async (userId) => {
  const query = `
    SELECT p.*
    FROM wishlist_items wi
    JOIN wishlists w ON wi.wishlist_id = w.wishlist_id
    JOIN productos p ON wi.producto_id = p.producto_id
    WHERE w.usuario_id = $1
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

export const addWishlistItemModel = async (userId, productId) => {
  let wishlistId;

  const existingWishlist = await pool.query(
    "SELECT wishlist_id FROM wishlists WHERE usuario_id = $1",
    [userId]
  );

  if (existingWishlist.rows.length === 0) {
    const newWishlist = await pool.query(
      "INSERT INTO wishlists (usuario_id) VALUES ($1) RETURNING wishlist_id",
      [userId]
    );
    wishlistId = newWishlist.rows[0].wishlist_id;
  } else {
    wishlistId = existingWishlist.rows[0].wishlist_id;
  }

  const sqlQuery = {
    text: `
      INSERT INTO wishlist_items (wishlist_id, producto_id)
      VALUES ($1, $2)
      ON CONFLICT (wishlist_id, producto_id) DO NOTHING
      RETURNING *;
    `,
    values: [wishlistId, productId],
  };

  const response = await pool.query(sqlQuery);
  return response.rows[0] ?? null;
};

export const deleteWishlistItemModel = async (userId, productId) => {
  const deleteQuery = `
    DELETE FROM wishlist_items wi
    USING wishlists w
    WHERE wi.wishlist_id = w.wishlist_id
    AND w.usuario_id = $1
    AND wi.producto_id = $2
  `;
  await pool.query(deleteQuery, [userId, productId]);
};
