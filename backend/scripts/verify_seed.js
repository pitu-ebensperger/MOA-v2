#!/usr/bin/env node
import pool from '../database/config.js';

async function run() {
  try {
    console.log('Verificando integridad post-seed...');

    const issues = [];

    // Productos sin categoria_id
    const { rows: withoutCat } = await pool.query(`SELECT producto_id, slug FROM productos WHERE categoria_id IS NULL`);
    if (withoutCat.length > 0) {
      issues.push({ key: 'NO_CATEGORY', detail: withoutCat });
    }

    // Productos cuya categoria_id no existe (FK debería evitarlo, pero comprobamos)
    const { rows: orphan } = await pool.query(`
      SELECT p.producto_id, p.slug, p.categoria_id
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.categoria_id IS NOT NULL AND c.categoria_id IS NULL
    `);
    if (orphan.length > 0) {
      issues.push({ key: 'ORPHAN_CATEGORY', detail: orphan });
    }

    // Slugs duplicados
    const { rows: dupSlugs } = await pool.query(`
      SELECT slug, COUNT(*) AS count
      FROM productos
      GROUP BY slug
      HAVING COUNT(*) > 1
    `);
    if (dupSlugs.length > 0) {
      issues.push({ key: 'DUPLICATE_SLUG', detail: dupSlugs });
    }

    // SKUs duplicados
    const { rows: dupSkus } = await pool.query(`
      SELECT sku, COUNT(*) AS count
      FROM productos
      WHERE sku IS NOT NULL
      GROUP BY sku
      HAVING COUNT(*) > 1
    `);
    if (dupSkus.length > 0) {
      issues.push({ key: 'DUPLICATE_SKU', detail: dupSkus });
    }

    // Productos con slug/sku nulos
    const { rows: missingKeys } = await pool.query(`
      SELECT producto_id, slug, sku FROM productos WHERE slug IS NULL OR sku IS NULL
    `);
    if (missingKeys.length > 0) {
      issues.push({ key: 'MISSING_KEYS', detail: missingKeys });
    }

    if (issues.length === 0) {
      console.log('OK — No se detectaron problemas en la verificación post-seed.');
      process.exit(0);
    }

    console.error('Se detectaron problemas en la verificación post-seed:');
    for (const it of issues) {
      console.error(`- ${it.key}:`, JSON.stringify(it.detail, null, 2));
    }
    process.exit(2);
  } catch (err) {
    console.error('Error ejecutando verificación post-seed:', err.message || err);
    process.exit(3);
  } finally {
    try { await pool.end(); } catch(e){}
  }
}

run();
