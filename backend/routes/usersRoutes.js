import { Router } from "express";
import {
  registerUser,
  getUserById,
  updateUser,
} from "../src/controllers/usersController.js";
import { checkRegisterCredentials } from "../src/middleware/credentialsMiddleware.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";

const router = Router();

router.post("/registro", checkRegisterCredentials, registerUser);
router.get("/usuario/:id", verifyToken, getUserById);
router.patch("/usuario/:id", verifyToken, updateUser);

export default router;
