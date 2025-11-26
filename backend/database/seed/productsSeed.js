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

    nombre: product.name ?? null,
    // Normalizar slug y sku para evitar duplicados por mayúsculas/minúsculas
    slug: (product.slug || '').toString().toLowerCase(),
    sku: product.sku ? product.sku.toString().toUpperCase() : null,

    precio_cents: Number.isFinite(product.price) ? Math.round(product.price * 100) : null,

    stock: Number.isFinite(product.stock) ? Number(product.stock) : 0,
    status: product.status ?? "activo",

    descripcion: product.description ?? null,

    img_url: product.imgUrl ?? null,
    // Asegurar que gallery sea un array o null
    gallery: Array.isArray(product.gallery) ? product.gallery : (product.gallery ? [product.gallery] : null),

    badge: Array.isArray(product.badge) ? product.badge : (product.badge ? [product.badge] : []),
    tags: Array.isArray(product.tags) ? product.tags : (product.tags ? [product.tags] : []),

    color: product.color ?? null,
    material: product.material ?? null,

    dimensions: product.dimensions ? JSON.stringify(product.dimensions) : null,
    weight: product.weight ? JSON.stringify(product.weight) : null,
  };
}

async function seedProducts() {
  try {
    // Usar transacción para evitar insertar datos parciales en caso de error
    await pool.query('BEGIN');

    for (const product of productsData) {
      // Resolver y validar la categoría referenciada antes de normalizar/insertar
      const fk = product.fk_category_id ?? null;
      let resolvedCategoriaId = null;

      if (fk !== null) {
        if (Number.isFinite(fk)) {
          const { rows: catRows } = await pool.query('SELECT categoria_id FROM categorias WHERE categoria_id = $1', [fk]);
          if (catRows.length === 0) {
            throw new Error(`Categoria con id ${fk} no encontrada para producto '${product.slug}'. Aborting seed.`);
          }
          resolvedCategoriaId = fk;
        } else {
          // Si por alguna razón fk viene como string/slug, intentar resolver por slug
          const { rows: catRows } = await pool.query('SELECT categoria_id FROM categorias WHERE slug = $1', [String(fk)]);
          if (catRows.length === 0) {
            throw new Error(`Categoria con slug '${fk}' no encontrada para producto '${product.slug}'. Aborting seed.`);
          }
          resolvedCategoriaId = catRows[0].categoria_id;
        }
      }

      const p = normalizeProduct(product);
      // Forzar la categoria resuelta (evitar dependencias implícitas en ordering)
      p.categoria_id = resolvedCategoriaId;

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

    await pool.query('COMMIT');
    console.log("Seed de productos COMPLETADO con éxito.");
  } catch (error) {
    try {
      await pool.query('ROLLBACK');
    } catch (e) {
      // Ignorar rollback error
    }
    console.error("Error al insertar productos:", error.message || error);
    process.exit(1);
  } finally {
    pool.end();
  }
}

seedProducts();
