import { Router } from "express";
import orderController from "../src/controllers/clientOrderController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import { validatePaymentMethod } from "../src/middleware/validatePaymentMethod.js";
import { validateShippingMethod } from "../src/middleware/validateShippingMethod.js";
import { validateCreateOrder } from "../src/middleware/validateOrderFields.js";

const router = Router();

router.post("/api/checkout", verifyToken, validateCreateOrder, orderController.createOrderFromCart);
router.get("/api/orders", verifyToken, orderController.getUserOrders);
router.get("/api/orders/:id", verifyToken, orderController.getOrderById);
router.delete("/api/orders/:id", verifyToken, orderController.cancelOrder);

export default router;
