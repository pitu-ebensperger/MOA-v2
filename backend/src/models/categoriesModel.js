import pool from "../../database/config.js";


export const categoriesModel = {

  async getAll() {
    const query = `
      SELECT 
        categoria_id AS id,
        nombre       AS name,
        slug         AS slug,
        descripcion  AS description,
        cover_image  AS "coverImage"
      FROM categorias
      ORDER BY nombre ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getById(id) {
    const query = `
      SELECT 
        categoria_id AS id,
        nombre       AS name,
        slug         AS slug,
        descripcion  AS description,
        cover_image  AS "coverImage"
      FROM categorias
      WHERE categoria_id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  async getBySlug(slug) {
    const query = `
      SELECT 
        categoria_id AS id,
        nombre       AS name,
        slug         AS slug,
        descripcion  AS description,
        cover_image  AS "coverImage"
      FROM categorias
      WHERE slug = $1;
    `;
    const { rows } = await pool.query(query, [slug]);
    return rows[0] || null;
  },

  async create(categoryData) {
    const { nombre, slug, descripcion, cover_image } = categoryData;

    const query = `
      INSERT INTO categorias (nombre, slug, descripcion, cover_image)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        categoria_id AS id,
        nombre       AS name,
        slug         AS slug,
        descripcion  AS description,
        cover_image  AS "coverImage";
    `;

    const { rows } = await pool.query(query, [
      nombre,
      slug,
      descripcion || null,
      cover_image || null
    ]);

    return rows[0];
  },

  async update(id, categoryData) {
    const fields = [];
    const values = [id];
    let paramIndex = 2;

    const allowedFields = {
      nombre: 'nombre',
      slug: 'slug',
      descripcion: 'descripcion',
      cover_image: 'cover_image'
    };

    Object.keys(allowedFields).forEach(field => {
      if (categoryData.hasOwnProperty(field)) {
        fields.push(`${allowedFields[field]} = $${paramIndex}`);
        values.push(categoryData[field]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return await this.getById(id);
    }

    const query = `
      UPDATE categorias
      SET ${fields.join(', ')}
      WHERE categoria_id = $1
      RETURNING 
        categoria_id AS id,
        nombre       AS name,
        slug         AS slug,
        descripcion  AS description,
        cover_image  AS "coverImage";
    `;

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  },

  async delete(id) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const activeProductsQuery = `
        SELECT COUNT(*)::int as count 
        FROM productos 
        WHERE categoria_id = $1
          AND LOWER(COALESCE(status, 'activo')) != 'inactivo';
      `;
      const { rows: activeRows } = await client.query(activeProductsQuery, [id]);

      if (activeRows[0].count > 0) {
        throw new Error(
          `No se puede eliminar la categoría porque tiene ${activeRows[0].count} producto(s) activo(s) asociado(s)`
        );
      }

      const detachInactiveProductsQuery = `
        UPDATE productos
        SET categoria_id = NULL
        WHERE categoria_id = $1
          AND LOWER(COALESCE(status, 'activo')) = 'inactivo';
      `;
      await client.query(detachInactiveProductsQuery, [id]);

      const deleteCategoryQuery = `
        DELETE FROM categorias
        WHERE categoria_id = $1
        RETURNING categoria_id;
      `;

      const { rows } = await client.query(deleteCategoryQuery, [id]);
      await client.query('COMMIT');
      return rows.length > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async slugExists(slug, excludeId = null) {
    let query = `
      SELECT COUNT(*)::int as count 
      FROM categorias 
      WHERE slug = $1
    `;
    const values = [slug];

    if (excludeId) {
      query += ` AND categoria_id != $2`;
      values.push(excludeId);
    }

    const { rows } = await pool.query(query, values);
    return rows[0].count > 0;
  },

  async countProducts(id) {
    const query = `
      SELECT COUNT(*)::int as count 
      FROM productos 
      WHERE categoria_id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0].count;
  }
};
