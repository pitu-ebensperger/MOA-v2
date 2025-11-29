import jwt from "jsonwebtoken";
import { AppError, UnauthorizedError, ForbiddenError } from "../utils/error.utils.js";
import { getUserByIdModel } from "../models/usersModel.js";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;

// VERIFICAR ADMIN
export const verifyAdmin = async (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      throw new AppError("Configuración JWT incompleta", 500);
    }

    const authHeader = req.header("Authorization");
    if (!authHeader) {
      throw new UnauthorizedError("El token de autorización debe estar presente");
    }

    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      throw new UnauthorizedError("Formato de token inválido. Use: Bearer <token>");
    }

    const token = tokenParts[1];
    if (!token) {
      throw new UnauthorizedError("El token no puede estar vacío");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        throw new UnauthorizedError("Token expirado");
      }
      if (jwtError.name === "JsonWebTokenError") {
        throw new UnauthorizedError("Token inválido");
      }
      throw new UnauthorizedError("Error al verificar el token");
    }

    if (!decoded.id || !decoded.email) {
      throw new UnauthorizedError("Token no contiene información suficiente del usuario");
    }

    const user = await getUserByIdModel(decoded.id);
    if (!user) {
      throw new UnauthorizedError("Usuario no encontrado");
    }

    const roleCode = user.rol_code?.toUpperCase();
    const isAdminUser = roleCode === 'ADMIN';

    if (!isAdminUser) {
      throw new ForbiddenError("Acceso denegado. Se requieren privilegios de administrador");
    }

    req.user = {
      id: user.id,
      usuario_id: user.id,
      email: user.email,
      nombre: user.nombre,
      role_code: user.rol_code,
      public_id: user.publicId
    };

    req.admin = true;

    next();
  } catch (error) {
    next(error);
  }
};

// VERIFICACIÓN ADMIN OPCIONAL
export const optionalAdminVerify = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return next();
    }

    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return next();
    }

    const token = tokenParts[1];
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserByIdModel(decoded.id);
    
    if (user && user.rol_code?.toUpperCase() === 'ADMIN') {
      req.user = {
        id: user.id,
        usuario_id: user.id,
        email: user.email,
        nombre: user.nombre,
        role_code: user.rol_code,
        public_id: user.publicId
      };
      req.admin = true;
    }

    next();
  } catch (error) {
    next();
  }
};
