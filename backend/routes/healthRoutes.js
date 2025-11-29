import express from 'express';
import { pool } from '../database/config.js';
import { NODE_ENV } from '../src/utils/env.js';

const router = express.Router();

// Seguimiento de tiempo de actividad
const startTime = Date.now();

// GET /api/health
// Endpoint de monitoreo para health checks y balanceadores de carga
router.get('/api/health', async (req, res) => {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  let dbStatus = 'unknown';
  let dbError = null;

  try {
    // Verificación rápida de conectividad DB con timeout de 2s
    const result = await pool.query('SELECT 1 as health_check');
    dbStatus = result.rows.length === 1 ? 'connected' : 'error';
  } catch (error) {
    dbStatus = 'disconnected';
    dbError = error.message;
    console.error('[Health Check] Database error:', error.message);
  }

  const version = process.env.npm_package_version || '0.0.0';
  const environment = NODE_ENV;

  const healthData = {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp,
    version,
    environment,
    uptime: `${uptime}s`,
    database: {
      status: dbStatus,
      ...(dbError && { error: dbError }),
    },
  };

  // Retornar 503 si la base de datos no responde (detectable por balanceadores)
  const statusCode = dbStatus === 'connected' ? 200 : 503;

  return res.status(statusCode).json(healthData);
});

export default router;
