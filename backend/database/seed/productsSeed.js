import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

import pool from "../config.js";
import { nanoid } from "nanoid";
import { PRODUCTS as productsData } from "./productsData.js";

function normalizeProduct(product) {
  return {
    public_id: nanoid(),

    categoria_id: product.fk_category_id ?? null,

    nombre: product.name,
    slug: product.slug,
    sku: product.sku,

    precio_cents: product.price * 100,

    stock: product.stock ?? 0,
    status: product.status ?? "activo",

    descripcion: product.description ?? null,

    img_url: product.imgUrl ?? null,
    gallery: product.gallery ?? null,

    badge: product.badge ?? [],
    tags: product.tags ?? [],

    color: product.color ?? null,
    material: product.material ?? null,

    dimensions: product.dimensions ? JSON.stringify(product.dimensions) : null,
    weight: product.weight ? JSON.stringify(product.weight) : null,
  };
}

async function seedProducts() {
  try {
    for (const product of productsData) {
      const p = normalizeProduct(product);

      const query = `
        INSERT INTO productos (
          public_id,
          categoria_id,
          nombre,
          slug,
          sku,
          precio_cents,
          stock,
          status,
          descripcion,
          img_url,
          gallery,
          badge,
          tags,
          color,
          material,
          dimensions,
          weight
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17
        )
        ON CONFLICT (slug) DO UPDATE SET
          public_id = EXCLUDED.public_id,
          categoria_id = EXCLUDED.categoria_id,
          nombre = EXCLUDED.nombre,
          sku = EXCLUDED.sku,
          precio_cents = EXCLUDED.precio_cents,
          stock = EXCLUDED.stock,
          status = EXCLUDED.status,
          descripcion = EXCLUDED.descripcion,
          img_url = EXCLUDED.img_url,
          gallery = EXCLUDED.gallery,
          badge = EXCLUDED.badge,
          tags = EXCLUDED.tags,
          color = EXCLUDED.color,
          material = EXCLUDED.material,
          dimensions = EXCLUDED.dimensions,
          weight = EXCLUDED.weight
        RETURNING producto_id;
      `;

      const values = [
        p.public_id,
        p.categoria_id,
        p.nombre,
        p.slug,
        p.sku,
        p.precio_cents,
        p.stock,
        p.status,
        p.descripcion,
        p.img_url,
        p.gallery,
        p.badge,
        p.tags,
        p.color,
        p.material,
        p.dimensions,
        p.weight,
      ];

      const result = await pool.query(query, values);
      console.log(`Producto insertado → ID: ${result.rows[0].producto_id}`);
    }

    console.log("Seed de productos COMPLETADO con éxito.");
  } catch (error) {
    console.error("Error al insertar productos:", error);
  } finally {
    pool.end();
  }
}

seedProducts();
