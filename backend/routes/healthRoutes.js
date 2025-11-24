import express from 'express';
import { pool } from '../database/config.js';

const router = express.Router();

// Uptime tracking
const startTime = Date.now();

/**GET /api/health
 * Health check endpoint for monitoring and load balancers
 * Returns service status, database connectivity, version, and uptime
 */
router.get('/api/health', async (req, res) => {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000); // seconds

  let dbStatus = 'unknown';
  let dbError = null;

  try {
    // Quick DB connectivity check with 2s timeout
    const result = await pool.query('SELECT 1 as health_check');
    dbStatus = result.rows.length === 1 ? 'connected' : 'error';
  } catch (error) {
    dbStatus = 'disconnected';
    dbError = error.message;
    console.error('[Health Check] Database error:', error.message);
  }

  const version = process.env.npm_package_version || '0.0.0';
  const environment = process.env.NODE_ENV || 'development';

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

  // Return 503 if database is down (load balancer can detect)
  const statusCode = dbStatus === 'connected' ? 200 : 503;

  return res.status(statusCode).json(healthData);
});

export default router;
