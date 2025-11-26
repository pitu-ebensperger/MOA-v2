import jwt from "jsonwebtoken";
import { AppError, UnauthorizedError, ForbiddenError } from "../utils/error.utils.js";
import { getUserByIdModel } from "../models/usersModel.js";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;
/**
 * Middleware para verificar que el usuario es administrador
 * Requiere token válido y rol de administrador
 */
export const verifyAdmin = async (req, res, next) => {
  try {
    if (!JWT_SECRET) {
      throw new AppError("Configuración JWT incompleta", 500);
    }

    // Verificar presencia del token
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      throw new UnauthorizedError("El token de autorización debe estar presente");
    }

    // Extraer y validar formato del token
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      throw new UnauthorizedError("Formato de token inválido. Use: Bearer <token>");
    }

    const token = tokenParts[1];
    if (!token) {
      throw new UnauthorizedError("El token no puede estar vacío");
    }

    // Verificar y decodificar el token
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

    // Verificar que el token contiene la información necesaria
    if (!decoded.id || !decoded.email) {
      throw new UnauthorizedError("Token no contiene información suficiente del usuario");
    }

    // Obtener información completa del usuario de la base de datos
    const user = await getUserByIdModel(decoded.id);
    if (!user) {
      throw new UnauthorizedError("Usuario no encontrado");
    }

    // Verificar que el usuario tiene rol de administrador
    const roleCode = user.rol_code?.toUpperCase();
    const isAdminUser = roleCode === 'ADMIN';

    if (!isAdminUser) {
      throw new ForbiddenError("Acceso denegado. Se requieren privilegios de administrador");
    }

    // Agregar información del usuario al request para uso posterior
    req.user = {
      id: user.id,
      usuario_id: user.id,
      email: user.email,
      nombre: user.nombre,
      role_code: user.rol_code,
      public_id: user.publicId
    };

    req.admin = true; // Flag para indicar que es un administrador verificado

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware opcional para verificar token admin sin fallar
 * Útil para endpoints que pueden ser accesibles por usuarios normales o admins
 */
export const optionalAdminVerify = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return next(); // Continuar sin autenticación
    }

    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return next(); // Continuar sin autenticación
    }

    const token = tokenParts[1];
    if (!token) {
      return next(); // Continuar sin autenticación
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
    // En caso de error, continuar sin autenticación en lugar de fallar
    next();
  }
};
