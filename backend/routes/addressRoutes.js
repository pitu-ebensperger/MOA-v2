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
} from "../src/controllers/clientAddressController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";

const router = Router();

// UBICACIONES (público)
router.get("/api/regiones", getRegiones);
router.get("/api/regiones/:regionCode/comunas", getComunasByRegionCode);

// DIRECCIONES (requiere autenticación)
router.get("/api/direcciones", verifyToken, getUserAddresses);
router.get("/api/direcciones/predeterminada", verifyToken, getDefaultAddress);
router.get("/api/direcciones/:id", verifyToken, getAddressById);
router.post("/api/direcciones", verifyToken, createAddress);
router.patch("/api/direcciones/:id", verifyToken, updateAddress);
router.patch("/api/direcciones/:id/predeterminada", verifyToken, setDefaultAddress);
router.delete("/api/direcciones/:id", verifyToken, deleteAddress);

export default router;
