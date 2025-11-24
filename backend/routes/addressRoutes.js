import { Router } from "express";
import {
  getUserAddresses,
  getAddressById,
  getDefaultAddress,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  getRegiones,
  getComunasByRegionCode
} from "../src/controllers/addressController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";

const router = Router();

// Endpoints públicos para datos de ubicación (no requieren auth)
router.get("/api/regiones", getRegiones);
router.get("/api/regiones/:regionCode/comunas", getComunasByRegionCode);

// Todas las rutas de direcciones requieren autenticación

// Obtener todas las direcciones del usuario
router.get("/api/direcciones", verifyToken, getUserAddresses);

// Obtener dirección predeterminada
router.get("/api/direcciones/predeterminada", verifyToken, getDefaultAddress);

// Obtener dirección por ID
router.get("/api/direcciones/:id", verifyToken, getAddressById);

// Crear nueva dirección
router.post("/api/direcciones", verifyToken, createAddress);

// Actualizar dirección existente
router.patch("/api/direcciones/:id", verifyToken, updateAddress);

// Establecer dirección como predeterminada
router.patch("/api/direcciones/:id/predeterminada", verifyToken, setDefaultAddress);

// Eliminar dirección
router.delete("/api/direcciones/:id", verifyToken, deleteAddress);

export default router;
