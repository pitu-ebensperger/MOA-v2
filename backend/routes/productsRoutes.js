import { Router } from "express";
import { 
  getProducts,
  getProduct,
  getProductBySlug,
  searchProducts
} from "../src/controllers/publicProductsController.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getProductStats,
  exportProductsCSV
} from "../src/controllers/adminProductController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import { verifyAdmin } from "../src/middleware/verifyAdmin.js";

const router = Router();

// RUTAS PÚBLICAS
router.get("/api/productos", getProducts);
router.get("/api/productos/search", searchProducts);
router.get("/api/producto/:slug", getProductBySlug);
router.get("/api/productos/:id", getProduct);

// RUTAS ADMIN
// Exportar debe ir antes de rutas con :id
router.get("/admin/productos/export", verifyToken, verifyAdmin, exportProductsCSV);
router.get("/admin/productos/stock/low", verifyToken, verifyAdmin, getLowStockProducts);
router.get("/admin/productos/stats", verifyToken, verifyAdmin, getProductStats);
router.post("/admin/productos", verifyToken, verifyAdmin, createProduct);
router.put("/admin/productos/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/admin/productos/:id", verifyToken, verifyAdmin, deleteProduct);
router.patch("/admin/productos/:id/stock", verifyToken, verifyAdmin, updateStock);

export default router;
