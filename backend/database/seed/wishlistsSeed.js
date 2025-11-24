import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

import pool from "../config.js";
import { WISHLISTS } from "./wishlistData.js";

async function seedWishlists() {
  try {
    const emails = [...new Set(WISHLISTS.map((item) => item.email))];
    if (!emails.length) {
      console.log("No hay wishlists definidas.");
      return;
    }

    const { rows: users } = await pool.query(
      `SELECT usuario_id, email FROM usuarios WHERE email = ANY($1)`,
      [emails],
    );
    if (!users.length) {
      console.log("No se encontraron usuarios para las wishlists.");
      return;
    }

    const slugs = WISHLISTS.flatMap((list) => list.items);
    const { rows: products } = await pool.query(
      `SELECT producto_id, slug FROM productos WHERE slug = ANY($1)`,
      [slugs],
    );
    const productMap = new Map(products.map((product) => [product.slug, product.producto_id]));
    const userMap = new Map(users.map((user) => [user.email, user.usuario_id]));

    for (const list of WISHLISTS) {
      const userId = userMap.get(list.email);
      if (!userId) continue;

      let wishlistId;
      const existingWishlist = await pool.query(
        `SELECT wishlist_id FROM wishlists WHERE usuario_id = $1`,
        [userId],
      );

      if (existingWishlist.rows.length > 0) {
        wishlistId = existingWishlist.rows[0].wishlist_id;
        await pool.query(
          `DELETE FROM wishlist_items WHERE wishlist_id = $1`,
          [wishlistId],
        );
      } else {
        const { rows } = await pool.query(
          `INSERT INTO wishlists (usuario_id) VALUES ($1) RETURNING wishlist_id`,
          [userId],
        );
        wishlistId = rows[0]?.wishlist_id;
      }

      if (!wishlistId) continue;

      for (const slug of list.items) {
        const productId = productMap.get(slug);
        if (!productId) {
          console.warn(`Producto ${slug} no encontrado para wishlist de ${list.email}`);
          continue;
        }

        await pool.query(
          `
            INSERT INTO wishlist_items (wishlist_id, producto_id)
            VALUES ($1, $2)
            ON CONFLICT (wishlist_id, producto_id) DO NOTHING
          `,
          [wishlistId, productId],
        );
      }
      console.log(`✓ Wishlist insertada/actualizada para ${list.email}`);
    }

    console.log("Seed de wishlists completado.");
  } catch (error) {
    console.error("Error al insertar wishlists:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedWishlists();
