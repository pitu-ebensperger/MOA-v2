import jwt from "jsonwebtoken";

import "dotenv/config";
import { AppError, UnauthorizedError } from "../utils/error.utils.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = async (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      throw new AppError("Configuración JWT incompleta", 500);
    }
    const token = req.header("Authorization");
    if (!token) {
      throw new UnauthorizedError("El token debe estar presente");
    }
    const extractToken = token.split(" ")[1];
    if (!extractToken) {
      throw new UnauthorizedError("El token debe estar presente");
    }
    const decoded = jwt.verify(extractToken, JWT_SECRET);
    req.user = {
      id: decoded.id,
      usuario_id: decoded.id,
      email: decoded.email,
      rol_code: decoded.rol_code,
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Token expirado"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("El token no es válido"));
    }
    next(error);
  }
};
