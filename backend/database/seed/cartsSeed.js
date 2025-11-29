import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

import pool from "../config.js";
import { CARTS } from "./cartsData.js";

async function seedCarts() {
  try {
    const emails = [...new Set(CARTS.map((cart) => cart.email))];
    if (!emails.length) {
      console.log("No hay carritos para seed.");
      return;
    }

    const { rows: users } = await pool.query(
      `SELECT usuario_id, email FROM usuarios WHERE email = ANY($1)`,
      [emails],
    );
    const userMap = new Map(users.map((user) => [user.email, user.usuario_id]));

    const slugs = CARTS.flatMap((cart) => cart.items.map((item) => item.slug));
    const { rows: products } = await pool.query(
      `SELECT producto_id, slug, precio_cents FROM productos WHERE slug = ANY($1)`,
      [slugs],
    );
    const productMap = new Map(products.map((product) => [product.slug, product]));

    for (const cart of CARTS) {
      const userId = userMap.get(cart.email);
      if (!userId) {
        console.warn(`Usuario no encontrado para carrito ${cart.email}`);
        continue;
      }

      const { rows } = await pool.query(
        `
          INSERT INTO carritos (usuario_id, status)
          VALUES ($1, $2)
          ON CONFLICT (usuario_id) DO UPDATE
            SET status = EXCLUDED.status, updated_at = NOW()
          RETURNING carrito_id
        `,
        [userId, cart.status],
      );
      const carritoId = rows[0]?.carrito_id;
      if (!carritoId) continue;

      await pool.query(
        `DELETE FROM carrito_items WHERE carrito_id = $1`,
        [carritoId],
      );

      for (const item of cart.items) {
        const product = productMap.get(item.slug);
        if (!product) {
          console.warn(`Producto ${item.slug} no encontrado`);
          continue;
        }
        await pool.query(
          `
            INSERT INTO carrito_items (carrito_id, producto_id, cantidad, precio_unit)
            VALUES ($1, $2, $3, $4)
          `,
          [carritoId, product.producto_id, item.quantity, product.precio_cents],
        );
      }
      console.log(`Carrito insertado/actualizado para ${cart.email}`);
    }

    console.log("Seed de carritos completado.");
  } catch (error) {
    console.error("Error al insertar carritos:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedCarts();
