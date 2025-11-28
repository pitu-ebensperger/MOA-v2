import express from 'express';
import configController from '../src/controllers/configController.js';
import { verifyAdmin } from '../src/middleware/verifyAdmin.js';

const router = express.Router();

router.get('/api/config', configController.getConfig);

router.put('/api/config', verifyAdmin, configController.updateConfig);
router.post('/api/config/init', verifyAdmin, configController.initializeConfig);

export default router;
