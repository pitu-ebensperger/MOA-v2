import { Router } from "express";
import { 
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getProductStats,
  searchProducts,
  exportProductsCSV
} from "../src/controllers/productsController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import { verifyAdmin } from "../src/middleware/verifyAdmin.js";

const router = Router();

// ===== RUTAS PÚBLICAS =====

// Obtener productos (con filtros y paginación)
router.get("/api/productos", getProducts);

// Buscar productos
router.get("/api/productos/search", searchProducts);

// Obtener producto por slug (público)
router.get("/api/producto/:slug", getProductBySlug);

// Obtener producto por ID o public_id
router.get("/api/productos/:id", getProductById);

// ===== RUTAS PROTEGIDAS - SOLO ADMIN =====

// Exportar productos a CSV (debe ir antes de rutas con :id)
router.get("/admin/productos/export", verifyToken, verifyAdmin, exportProductsCSV);

// Obtener productos con stock bajo
router.get("/admin/productos/stock/low", verifyToken, verifyAdmin, getLowStockProducts);

// Obtener estadísticas de productos
router.get("/admin/productos/stats", verifyToken, verifyAdmin, getProductStats);

// Crear producto
router.post("/admin/productos", verifyToken, verifyAdmin, createProduct);

// Actualizar producto
router.put("/admin/productos/:id", verifyToken, verifyAdmin, updateProduct);

// Eliminar producto (soft delete por defecto)
router.delete("/admin/productos/:id", verifyToken, verifyAdmin, deleteProduct);

// Actualizar stock de producto
router.patch("/admin/productos/:id/stock", verifyToken, verifyAdmin, updateStock);

export default router;
