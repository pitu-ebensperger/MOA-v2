import { Router } from "express";
import { verifyAdmin } from "../src/middleware/verifyAdmin.js";
import { AdminController } from "../src/controllers/adminDashboardController.js";
import orderAdminController from "../src/controllers/adminOrderController.js";
import UserAdminController from "../src/controllers/adminUserController.js";
import ConfigAdminController from "../src/controllers/adminConfigController.js";
import { asyncHandler } from "../src/utils/error.utils.js";

const router = Router();

// PEDIDOS
router.get("/admin/pedidos/export", verifyAdmin, asyncHandler(orderAdminController.exportOrdersCSV));
router.get("/admin/pedidos/stats", verifyAdmin, asyncHandler(orderAdminController.getOrderStats));
router.get("/admin/pedidos", verifyAdmin, asyncHandler(orderAdminController.getAllOrders));
router.get("/admin/pedidos/:id", verifyAdmin, asyncHandler(orderAdminController.getOrderById));
router.patch("/admin/pedidos/:id/estado", verifyAdmin, asyncHandler(orderAdminController.updateOrderStatus));
router.post("/admin/pedidos/:id/seguimiento", verifyAdmin, asyncHandler(orderAdminController.addTrackingInfo));

// ANALYTICS
router.get("/admin/analytics/dashboard", verifyAdmin, asyncHandler(AdminController.getDashboardMetrics));
router.get("/admin/analytics/sales", verifyAdmin, asyncHandler(AdminController.getSalesAnalytics));
router.get("/admin/analytics/conversion", verifyAdmin, asyncHandler(AdminController.getConversionMetrics));
router.get("/admin/analytics/products/top", verifyAdmin, asyncHandler(AdminController.getTopProducts));
router.get("/admin/analytics/categories", verifyAdmin, asyncHandler(AdminController.getCategoryAnalytics));
router.get("/admin/analytics/stock", verifyAdmin, asyncHandler(AdminController.getStockAnalytics));
router.get("/admin/analytics/orders/distribution", verifyAdmin, asyncHandler(AdminController.getOrderDistribution));
router.get("/admin/analytics/customers/registrations", verifyAdmin, asyncHandler(AdminController.getCustomerRegistrations));

// DASHBOARD - Usar AdminController para todas las métricas
router.get("/admin/dashboard/stats", verifyAdmin, asyncHandler(AdminController.getDashboardMetrics));
router.get("/admin/dashboard/kpis", verifyAdmin, asyncHandler(AdminController.getDashboardMetrics));
router.get("/admin/dashboard/payment-methods", verifyAdmin, asyncHandler(AdminController.getSalesAnalytics));
router.get("/admin/dashboard/shipping-methods", verifyAdmin, asyncHandler(AdminController.getSalesAnalytics));
router.get("/admin/dashboard/top-products", verifyAdmin, asyncHandler(AdminController.getTopProducts));
router.get("/admin/dashboard/sales-evolution", verifyAdmin, asyncHandler(AdminController.getSalesAnalytics));
router.get("/admin/dashboard/orders-by-status", verifyAdmin, asyncHandler(AdminController.getOrderDistribution));
router.get("/admin", verifyAdmin, asyncHandler(AdminController.getDashboardMetrics));

// USUARIOS
router.get("/admin/usuarios", verifyAdmin, asyncHandler(UserAdminController.getUsers));
router.put("/admin/usuarios/:id/rol", verifyAdmin, asyncHandler(UserAdminController.updateUserRole));
router.post("/admin/clientes", verifyAdmin, asyncHandler(UserAdminController.createCustomer));
router.patch("/admin/clientes/:id", verifyAdmin, asyncHandler(UserAdminController.updateCustomer));
router.delete("/admin/clientes/:id", verifyAdmin, asyncHandler(UserAdminController.deleteCustomer));

// CONFIGURACIÓN
router.get("/admin/configuracion", verifyAdmin, asyncHandler(ConfigAdminController.getStoreConfig));
router.put("/admin/configuracion", verifyAdmin, asyncHandler(ConfigAdminController.updateStoreConfig));

export default router;
