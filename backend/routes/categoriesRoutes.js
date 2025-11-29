import { Router } from "express";
import {
  getCategories,
  getCategoryById
} from "../src/controllers/publicCategoriesController.js";
import adminCategoryController from "../src/controllers/adminCategoryController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import { verifyAdmin } from "../src/middleware/verifyAdmin.js";

const router = Router();

const { createCategory, updateCategory, deleteCategory, getCategoryProductCount } = adminCategoryController;

///public
router.get("/categorias", getCategories);
router.get("/categorias/:id", getCategoryById);

//admin 
router.post("/admin/categorias", verifyToken, verifyAdmin, createCategory);
router.put("/admin/categorias/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/admin/categorias/:id", verifyToken, verifyAdmin, deleteCategory);
router.get("/admin/categorias/:id/productos/count", verifyToken, verifyAdmin, getCategoryProductCount);

export default router;
