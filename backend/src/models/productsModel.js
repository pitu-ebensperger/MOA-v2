import pool from "../../database/config.js";
import { nanoid } from "nanoid";

export const productsModel = {

  async getAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      offset = null,
      search = '',
      categoryId = null,
      status = null,
      minPrice = null,
      maxPrice = null,
      onlyLowStock = false,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const safeLimit = Math.max(1, Number(limit) || 1);
    const safePage = Math.max(1, Number(page) || 1);
    const hasExplicitOffset =
      offset !== undefined &&
      offset !== null &&
      String(offset).trim() !== '' &&
      Number.isFinite(Number(offset));
    const offsetValue = hasExplicitOffset
      ? Math.max(0, Number(offset))
      : (safePage - 1) * safeLimit;
    const currentPage = Math.floor(offsetValue / safeLimit) + 1;
    const values = [];
    let paramIndex = 1;
    const whereConditions = [];

    if (search) {
      whereConditions.push(`(p.nombre ILIKE $${paramIndex} OR p.descripcion ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (categoryId) {
      whereConditions.push(`p.categoria_id = $${paramIndex}`);
      values.push(categoryId);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`p.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (minPrice !== null) {
      whereConditions.push(`p.precio_cents >= $${paramIndex}`);
      values.push(minPrice);
      paramIndex++;
    }

    if (maxPrice !== null) {
      whereConditions.push(`p.precio_cents <= $${paramIndex}`);
      values.push(maxPrice);
      paramIndex++;
    }

    if (onlyLowStock) {
      whereConditions.push(`p.stock <= 5`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Prevenir SQL injection
    const allowedSortFields = ['nombre', 'precio_cents', 'stock', 'created_at', 'updated_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const query = `
      SELECT 
        p.producto_id AS id,
        p.public_id AS "publicId",
        p.categoria_id AS "categoryId",
        c.nombre AS "categoryName",
        p.nombre AS name,
        p.slug AS slug,
        p.sku AS sku,
        p.precio_cents AS "priceCents",
        p.stock AS stock,
        p.status AS status,
        p.descripcion AS description,
        p.img_url AS "imageUrl",
        p.gallery AS gallery,
        p.badge AS badge,
        p.tags AS tags,
        p.color AS color,
        p.material AS material,
        p.dimensions AS dimensions,
        p.weight AS weight,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt"
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      ${whereClause}
      ORDER BY p.${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(safeLimit, offsetValue);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM productos p
      ${whereClause}
    `;

    const [productsResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, -2))
    ]);

    const products = productsResult.rows;
    const total = countResult.rows[0].total;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    return {
      items: products,
      pagination: {
        page: currentPage,
        offset: offsetValue,
        limit: safeLimit,
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    };
  },

  async getById(id) {
    const query = `
      SELECT 
        p.producto_id AS id,
        p.public_id AS "publicId",
        p.categoria_id AS "categoryId",
        c.nombre AS "categoryName",
        c.slug AS "categorySlug",
        p.nombre AS name,
        p.slug AS slug,
        p.sku AS sku,
        p.precio_cents AS "priceCents",
        p.stock AS stock,
        p.status AS status,
        p.descripcion AS description,
        p.img_url AS "imageUrl",
        p.gallery AS gallery,
        p.badge AS badge,
        p.tags AS tags,
        p.color AS color,
        p.material AS material,
        p.dimensions AS dimensions,
        p.weight AS weight,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt"
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.producto_id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  async getByPublicId(publicId) {
    const query = `
      SELECT 
        p.producto_id AS id,
        p.public_id AS "publicId",
        p.categoria_id AS "categoryId",
        c.nombre AS "categoryName",
        c.slug AS "categorySlug",
        p.nombre AS name,
        p.slug AS slug,
        p.sku AS sku,
        p.precio_cents AS "priceCents",
        p.stock AS stock,
        p.status AS status,
        p.descripcion AS description,
        p.img_url AS "imageUrl",
        p.gallery AS gallery,
        p.badge AS badge,
        p.tags AS tags,
        p.color AS color,
        p.material AS material,
        p.dimensions AS dimensions,
        p.weight AS weight,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt"
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.public_id = $1;
    `;
    const { rows } = await pool.query(query, [publicId]);
    return rows[0] || null;
  },

  async getBySlug(slug) {
    const query = `
      SELECT 
        p.producto_id AS id,
        p.public_id AS "publicId",
        p.categoria_id AS "categoryId",
        c.nombre AS "categoryName",
        c.slug AS "categorySlug",
        p.nombre AS name,
        p.slug AS slug,
        p.sku AS sku,
        p.precio_cents AS "priceCents",
        p.stock AS stock,
        p.status AS status,
        p.descripcion AS description,
        p.img_url AS "imageUrl",
        p.gallery AS gallery,
        p.badge AS badge,
        p.tags AS tags,
        p.color AS color,
        p.material AS material,
        p.dimensions AS dimensions,
        p.weight AS weight,
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt"
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.slug = $1;
    `;
    const { rows } = await pool.query(query, [slug]);
    return rows[0] || null;
  },

  async create(productData) {
    const {
      categoria_id,
      nombre,
      slug,
      sku,
      precio_cents,
      stock = 0,
      status = 'activo',
      descripcion = null,
      img_url = null,
      gallery = [],
      badge = [],
      tags = [],
      color = null,
      material = null,
      dimensions = null,
      weight = null
    } = productData;

    const publicId = nanoid();

    const query = `
      INSERT INTO productos (
        public_id, categoria_id, nombre, slug, sku, precio_cents,
        stock, status, descripcion,
        img_url, gallery, badge, tags, color, material, dimensions, weight
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING producto_id AS id;
    `;

    const values = [
      publicId, categoria_id, nombre, slug, sku, precio_cents,
      stock, status, descripcion,
      img_url, gallery, badge, tags, color, material, dimensions, weight
    ];

    const { rows } = await pool.query(query, values);
    const productId = rows[0].id;

    return await this.getById(productId);
  },

  async update(id, productData) {
    const fields = [];
    const values = [id];
    let paramIndex = 2;

    const allowedFields = {
      categoria_id: 'categoria_id',
      nombre: 'nombre',
      slug: 'slug',
      sku: 'sku',
      precio_cents: 'precio_cents',
      stock: 'stock',
      status: 'status',
      descripcion: 'descripcion',
      img_url: 'img_url',
      gallery: 'gallery',
      badge: 'badge',
      tags: 'tags',
      color: 'color',
      material: 'material',
      dimensions: 'dimensions',
      weight: 'weight'
    };

    Object.keys(allowedFields).forEach(field => {
      if (productData.hasOwnProperty(field)) {
        fields.push(`${allowedFields[field]} = $${paramIndex}`);
        values.push(productData[field]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return await this.getById(id);
    }

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE productos
      SET ${fields.join(', ')}
      WHERE producto_id = $1
      RETURNING producto_id AS id;
    `;

    const { rows } = await pool.query(query, values);
    
    if (rows.length === 0) {
      return null;
    }

    return await this.getById(id);
  },

  async softDelete(id) {
    const query = `
      UPDATE productos
      SET status = 'inactivo', updated_at = NOW()
      WHERE producto_id = $1
      RETURNING producto_id;
    `;

    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  },

  async hardDelete(id) {
    const checkQuery = `
      SELECT COUNT(*)::int as count 
      FROM orden_items 
      WHERE producto_id = $1;
    `;
    const { rows: checkRows } = await pool.query(checkQuery, [id]);

    if (checkRows[0].count > 0) {
      throw new Error(
        `No se puede eliminar el producto porque está presente en ${checkRows[0].count} orden(es)`
      );
    }

    const query = `
      DELETE FROM productos
      WHERE producto_id = $1
      RETURNING producto_id;
    `;

    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  },

  async slugExists(slug, excludeId = null) {
    let query = `
      SELECT COUNT(*)::int as count 
      FROM productos 
      WHERE slug = $1
    `;
    const values = [slug];

    if (excludeId) {
      query += ` AND producto_id != $2`;
      values.push(excludeId);
    }

    const { rows } = await pool.query(query, values);
    return rows[0].count > 0;
  },

  async skuExists(sku, excludeId = null) {
    let query = `
      SELECT COUNT(*)::int as count 
      FROM productos 
      WHERE sku = $1
    `;
    const values = [sku];

    if (excludeId) {
      query += ` AND producto_id != $2`;
      values.push(excludeId);
    }

    const { rows } = await pool.query(query, values);
    return rows[0].count > 0;
  },

  async updateStock(id, quantity) {
    const query = `
      UPDATE productos
      SET stock = stock + $2::int, updated_at = NOW()
      WHERE producto_id = $1 AND stock + $2::int >= 0
      RETURNING producto_id AS id, stock;
    `;

    const { rows } = await pool.query(query, [id, quantity]);
    
    if (rows.length === 0) {
      return null; // Stock insuficiente o producto no encontrado
    }

    return await this.getById(id);
  },

  async getLowStockProducts(threshold = 5) {
    const query = `
      SELECT 
        p.producto_id AS id,
        p.public_id AS "publicId",
        p.nombre AS name,
        p.sku AS sku,
        p.stock AS stock,
        p.status AS status,
        c.nombre AS "categoryName"
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.stock <= $1 AND p.status = 'activo'
      ORDER BY p.stock ASC, p.nombre ASC;
    `;
    const { rows } = await pool.query(query, [threshold]);
    return rows;
  },

  async getStats() {
    const query = `
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'activo')::int AS active,
        COUNT(*) FILTER (WHERE status = 'inactivo')::int AS inactive,
        COUNT(*) FILTER (WHERE stock <= 5 AND status = 'activo')::int AS low_stock,
        COUNT(*) FILTER (WHERE stock = 0 AND status = 'activo')::int AS out_of_stock,
        AVG(precio_cents)::int AS avg_price_cents,
        SUM(stock)::int AS total_stock
      FROM productos;
    `;
    const { rows } = await pool.query(query);
    return rows[0];
  }
};
