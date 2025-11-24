import pool from '../../database/config.js';

const configModel = {

  async getConfig() {
    try {
      const query = `
        SELECT 
          id,
          nombre_tienda,
          descripcion,
          direccion,
          telefono,
          email,
          instagram_url,
          facebook_url,
          twitter_url,
          actualizado_en,
          actualizado_por
        FROM configuracion_tienda
        WHERE id = 1
      `;
      
      const result = await pool.query(query);
      
      if (result.rows.length === 0) {
        throw new Error('Configuración no encontrada');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      throw error;
    }
  },

  async updateConfig(configData, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const {
        nombre_tienda,
        descripcion,
        direccion,
        telefono,
        email,
        instagram_url,
        facebook_url,
        twitter_url
      } = configData;

      const query = `
        UPDATE configuracion_tienda
        SET 
          nombre_tienda = COALESCE($1, nombre_tienda),
          descripcion = COALESCE($2, descripcion),
          direccion = COALESCE($3, direccion),
          telefono = COALESCE($4, telefono),
          email = COALESCE($5, email),
          instagram_url = COALESCE($6, instagram_url),
          facebook_url = COALESCE($7, facebook_url),
          twitter_url = COALESCE($8, twitter_url),
          actualizado_por = $9
        WHERE id = 1
        RETURNING *
      `;

      const values = [
        nombre_tienda,
        descripcion,
        direccion,
        telefono,
        email,
        instagram_url,
        facebook_url,
        twitter_url,
        userId
      ];

      const result = await client.query(query, values);
      
      await client.query('COMMIT');
      
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al actualizar configuración:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async initializeConfig() {
    try {
      const checkQuery = 'SELECT id FROM configuracion_tienda WHERE id = 1';
      const checkResult = await pool.query(checkQuery);
      
      if (checkResult.rows.length > 0) {
        return checkResult.rows[0];
      }

      const insertQuery = `
        INSERT INTO configuracion_tienda (
          id,
          nombre_tienda,
          descripcion,
          direccion,
          telefono,
          email,
          instagram_url,
          facebook_url,
          twitter_url
        ) VALUES (
          1,
          'MOA',
          'Muebles y decoración de diseño contemporáneo para crear espacios únicos. Calidad, estilo y funcionalidad en cada pieza.',
          'Providencia 1234, Santiago, Chile',
          '+56 2 2345 6789',
          'hola@moastudio.cl',
          'https://instagram.com/moastudio',
          'https://facebook.com/moastudio',
          'https://twitter.com/moastudio'
        )
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery);
      return result.rows[0];
    } catch (error) {
      console.error('Error al inicializar configuración:', error);
      throw error;
    }
  }
};

export default configModel;
