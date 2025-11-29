import pool from '../../database/config.js';
import crypto from 'crypto';

// CREAR TOKEN
export const createResetToken = async (usuarioId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  const query = `
    INSERT INTO password_reset_tokens 
      (usuario_id, token, expira_en)
    VALUES ($1, $2, $3)
    RETURNING token_id, usuario_id, token, creado_en, expira_en
  `;

  try {
    const result = await pool.query(query, [usuarioId, token, expiresAt]);
    return result.rows[0];
  } catch (error) {
    console.error('[PasswordResetModel] Error al crear token:', error);
    throw error;
  }
};

// BUSCAR Y VALIDAR
export const findValidToken = async (token) => {
  const query = `
    SELECT 
      token_id,
      usuario_id,
      token,
      creado_en,
      expira_en,
      usado_en
    FROM password_reset_tokens
    WHERE token = $1 
      AND usado_en IS NULL 
      AND expira_en > NOW()
    ORDER BY creado_en DESC
    LIMIT 1
  `;

  try {
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('[PasswordResetModel] Error al buscar token:', error);
    throw error;
  }
};

// USAR TOKEN
export const markTokenAsUsed = async (token) => {
  const query = `
    UPDATE password_reset_tokens
    SET usado_en = NOW()
    WHERE token = $1
    RETURNING token_id, usuario_id, token, usado_en
  `;

  try {
    const result = await pool.query(query, [token]);
    return result.rows[0];
  } catch (error) {
    console.error('[PasswordResetModel] Error al marcar token como usado:', error);
    throw error;
  }
};

// LIMPIEZA
// Limpieza periódica para cron job
export const cleanExpiredTokens = async () => {
  const query = `
    DELETE FROM password_reset_tokens
    WHERE expira_en < NOW() 
       OR usado_en IS NOT NULL
  `;

  try {
    const result = await pool.query(query);
    return result.rowCount;
  } catch (error) {
    console.error('[PasswordResetModel] Error al limpiar tokens:', error);
    throw error;
  }
};

export const invalidateUserTokens = async (usuarioId) => {
  const query = `
    UPDATE password_reset_tokens
    SET usado_en = NOW()
    WHERE usuario_id = $1 
      AND usado_en IS NULL
  `;

  try {
    const result = await pool.query(query, [usuarioId]);
    return result.rowCount;
  } catch (error) {
    console.error('[PasswordResetModel] Error al invalidar tokens:', error);
    throw error;
  }
};
