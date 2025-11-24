import express from 'express';
import configController from '../src/controllers/configController.js';
import { verifyAdmin } from '../src/middleware/verifyAdmin.js';

const router = express.Router();

// Health check endpoint for monitoring and uptime
router.get('/api/health', (req, res) => {
	res.status(200).json({
		ok: true,
		status: 'healthy',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development',
	});
});

router.get('/api/config', configController.getConfig);

router.put('/api/config', verifyAdmin, configController.updateConfig);
router.post('/api/config/init', verifyAdmin, configController.initializeConfig);

export default router;
