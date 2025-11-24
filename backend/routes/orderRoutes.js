import { Router } from "express";
import orderController from "../src/controllers/orderController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import { validatePaymentMethod } from "../src/middleware/validatePaymentMethod.js";

const router = Router();

// Rutas de órdenes para usuarios
router.post("/api/checkout", verifyToken, validatePaymentMethod, orderController.createOrderFromCart);
router.post("/api/checkout/create-order", verifyToken, validatePaymentMethod, orderController.createOrderFromCart); // Alias para compatibilidad
router.get("/api/orders", verifyToken, orderController.getUserOrders);
router.get("/api/orders/:id", verifyToken, orderController.getOrderById);
router.delete("/api/orders/:id", verifyToken, orderController.cancelOrder);

// Nota: Las rutas admin de órdenes están en adminRoutes.js para evitar duplicación

export default router;
