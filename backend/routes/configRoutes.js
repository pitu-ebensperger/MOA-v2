import express from 'express';
import ConfigAdminController from '../src/controllers/adminConfigController.js';
import { verifyAdmin } from '../src/middleware/verifyAdmin.js';
import { asyncHandler } from '../src/utils/error.utils.js';

const router = express.Router();

// Ruta pública para obtener configuración de la tienda
router.get('/api/config', asyncHandler(ConfigAdminController.getStoreConfig));

// Rutas admin para actualizar configuración
router.put('/api/config', verifyAdmin, asyncHandler(ConfigAdminController.updateStoreConfig));

export default router;
