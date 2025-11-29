import { Router } from "express";
import { loginUser, getUser, refreshToken } from "../src/controllers/publicAuthController.js";
import { 
  requestPasswordReset, 
  resetPassword 
} from "../src/controllers/publicPasswordResetController.js";
import { verifyToken } from "../src/middleware/tokenMiddleware.js";
import { checkLoginCredentials } from "../src/middleware/credentialsMiddleware.js";

const router = Router();

// Mantiene /login para autenticación
router.post("/login", checkLoginCredentials, loginUser);

// Nuevo endpoint alineado con frontend para perfil autenticado
router.get("/auth/perfil", verifyToken, getUser);

// Alias singular /usuario (más semántico que plural, devuelve 1 usuario)
router.get("/usuario", verifyToken, getUser);

// Renovar token JWT (extender sesión)
router.post("/auth/refresh-token", verifyToken, refreshToken);

// Endpoints de reset de contraseña
router.post("/api/auth/request-password-reset", requestPasswordReset);
router.post("/api/auth/reset-password", resetPassword);

export default router;
