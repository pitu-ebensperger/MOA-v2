import pool from "../../database/config.js";

export const addressModel = {
  async getUserAddresses(usuarioId) {
    const query = `
      SELECT 
        direccion_id AS id,
        usuario_id AS "userId",
        nombre_contacto AS "contactName",
        telefono_contacto AS "contactPhone",
        calle,
        numero,
        departamento,
        comuna,
        ciudad,
        region,
        codigo_postal AS "postalCode",
        referencia,
        es_predeterminada AS "isDefault",
        creado_en AS "createdAt",
        actualizado_en AS "updatedAt"
      FROM direcciones
      WHERE usuario_id = $1
      ORDER BY es_predeterminada DESC, creado_en DESC;
    `;
    
    const { rows } = await pool.query(query, [usuarioId]);
    return rows;
  },

  async getById(direccionId, usuarioId = null) {
    let query = `
      SELECT 
        direccion_id AS id,
        usuario_id AS "userId",
        nombre_contacto AS "contactName",
        telefono_contacto AS "contactPhone",
        calle,
        numero,
        departamento,
        comuna,
        ciudad,
        region,
        codigo_postal AS "postalCode",
        referencia,
        es_predeterminada AS "isDefault",
        creado_en AS "createdAt",
        actualizado_en AS "updatedAt"
      FROM direcciones
      WHERE direccion_id = $1
    `;
    
    const params = [direccionId];
    
    if (usuarioId) {
      query += ` AND usuario_id = $2`;
      params.push(usuarioId);
    }
    
    const { rows } = await pool.query(query, params);
    return rows[0] || null;
  },

  async getDefaultAddress(usuarioId) {
    const query = `
      SELECT 
        direccion_id AS id,
        usuario_id AS "userId",
        nombre_contacto AS "contactName",
        telefono_contacto AS "contactPhone",
        calle,
        numero,
        departamento,
        comuna,
        ciudad,
        region,
        codigo_postal AS "postalCode",
        referencia,
        es_predeterminada AS "isDefault",
        creado_en AS "createdAt",
        actualizado_en AS "updatedAt"
      FROM direcciones
      WHERE usuario_id = $1 AND es_predeterminada = true
      LIMIT 1;
    `;
    
    const { rows } = await pool.query(query, [usuarioId]);
    return rows[0] || null;
  },

  async create(addressData) {
    const {
      usuario_id,
      nombre_contacto,
      telefono_contacto,
      calle,
      numero,
      departamento = null,
      comuna,
      ciudad,
      region,
      codigo_postal = null,
      referencia = null,
      es_predeterminada = false
    } = addressData;

    // Si es la primera dirección del usuario, hacerla predeterminada
    const countQuery = `SELECT COUNT(*)::int as count FROM direcciones WHERE usuario_id = $1`;
    const { rows: countRows } = await pool.query(countQuery, [usuario_id]);
    const isFirst = countRows[0].count === 0;
    const shouldBeDefault = isFirst || es_predeterminada;

    // Si debe ser predeterminada, quitar flag de otras direcciones
    if (shouldBeDefault) {
      await pool.query(
        `UPDATE direcciones SET es_predeterminada = false WHERE usuario_id = $1`,
        [usuario_id]
      );
    }

    const query = `
      INSERT INTO direcciones (
        usuario_id, nombre_contacto, telefono_contacto,
        calle, numero, departamento, comuna, ciudad, region,
        codigo_postal, referencia, es_predeterminada
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING direccion_id AS id;
    `;

    const values = [
      usuario_id, nombre_contacto, telefono_contacto,
      calle, numero, departamento, comuna, ciudad, region,
      codigo_postal, referencia, shouldBeDefault
    ];

    const { rows } = await pool.query(query, values);
    const direccionId = rows[0].id;

    return await this.getById(direccionId);
  },

  async update(direccionId, usuarioId, addressData) {
    const fields = [];
    const values = [direccionId, usuarioId];
    let paramIndex = 3;

    const allowedFields = {
      nombre_contacto: 'nombre_contacto',
      telefono_contacto: 'telefono_contacto',
      calle: 'calle',
      numero: 'numero',
      departamento: 'departamento',
      comuna: 'comuna',
      ciudad: 'ciudad',
      region: 'region',
      codigo_postal: 'codigo_postal',
      referencia: 'referencia'
    };

    Object.keys(allowedFields).forEach(field => {
      if (addressData.hasOwnProperty(field)) {
        fields.push(`${allowedFields[field]} = $${paramIndex}`);
        values.push(addressData[field]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return await this.getById(direccionId, usuarioId);
    }

    fields.push(`actualizado_en = NOW()`);

    const query = `
      UPDATE direcciones
      SET ${fields.join(', ')}
      WHERE direccion_id = $1 AND usuario_id = $2
      RETURNING direccion_id AS id;
    `;

    const { rows } = await pool.query(query, values);
    
    if (rows.length === 0) {
      return null;
    }

    return await this.getById(direccionId, usuarioId);
  },

  async setAsDefault(direccionId, usuarioId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Quitar flag de todas las direcciones del usuario
      await client.query(
        `UPDATE direcciones SET es_predeterminada = false WHERE usuario_id = $1`,
        [usuarioId]
      );

      // Establecer la nueva predeterminada
      const { rows } = await client.query(
        `UPDATE direcciones 
         SET es_predeterminada = true, actualizado_en = NOW()
         WHERE direccion_id = $1 AND usuario_id = $2
         RETURNING direccion_id AS id`,
        [direccionId, usuarioId]
      );

      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      await client.query('COMMIT');
      return await this.getById(direccionId, usuarioId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async delete(direccionId, usuarioId) {
    const query = `
      DELETE FROM direcciones
      WHERE direccion_id = $1 AND usuario_id = $2
      RETURNING direccion_id;
    `;

    const { rows } = await pool.query(query, [direccionId, usuarioId]);
    return rows.length > 0;
  }
};
