import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProductCount
} from "../src/controllers/categoriesController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import { verifyAdmin } from "../src/middleware/verifyAdmin.js";

const router = Router();

// Rutas públicas
router.get("/categorias", getCategories);
router.get("/categorias/:id", getCategoryById);

// Rutas admin (requieren autenticación y permisos de admin)
router.post("/admin/categorias", verifyToken, verifyAdmin, createCategory);
router.put("/admin/categorias/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/admin/categorias/:id", verifyToken, verifyAdmin, deleteCategory);
router.get("/admin/categorias/:id/productos/count", verifyToken, verifyAdmin, getCategoryProductCount);

export default router;
