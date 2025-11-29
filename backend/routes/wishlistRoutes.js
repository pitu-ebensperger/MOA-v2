import { Router } from "express";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import {
  getWishlist,
  addWishlistItem,
  deleteWishlistItem,
} from "../src/controllers/clientWishlistController.js";

const router = Router();

router.get("/wishlist", verifyToken, getWishlist);
router.post("/wishlist/add", verifyToken, addWishlistItem);
router.delete("/wishlist/remove/:productId", verifyToken, deleteWishlistItem);

export default router;
