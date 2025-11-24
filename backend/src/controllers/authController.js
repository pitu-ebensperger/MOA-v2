import { findUserModel, getUserByIdModel } from "../models/usersModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import "dotenv/config";
import { AppError, NotFoundError, UnauthorizedError } from "../utils/error.utils.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('[authController.loginUser] ===== LOGIN ATTEMPT =====');
    console.log('[authController.loginUser] Email:', email);
    console.log('[authController.loginUser] Password received:', !!password);
    console.log('[authController.loginUser] Body:', JSON.stringify(req.body));
    
    const user = await findUserModel(email);
    console.log('[authController.loginUser] User found:', !!user);
    if (!user) {
      console.log('[authController.loginUser] User not found for email:', email);
      throw new UnauthorizedError("No autorizado");
    }
    console.log('[authController.loginUser] Comparing password...');
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    console.log('[authController.loginUser] Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('[authController.loginUser] Invalid password for user:', email);
      throw new UnauthorizedError("No autorizado");
    }
    if (!JWT_SECRET) {
      throw new AppError("JWT secret no configurado", 500);
    }
    // Campo de rol estandarizado
    const roleCode = user.rol_code;
    // JWT con expiración diferenciada por rol
    const isAdmin = roleCode === 'ADMIN';
    const expiresIn = isAdmin
      ? (process.env.JWT_ADMIN_EXPIRES_IN || '7d') // Admin: 7 días por defecto
      : (process.env.JWT_EXPIRES_IN || '24h');     // Cliente: 24h por defecto

    // DEBUG: logs temporales para depuración de login admin
    try {
      console.info('[authController.loginUser] login attempt for email=', email);
      // No loguear contraseñas ni hashes
      console.info('[authController.loginUser] resolved user id=', user?.usuario_id ?? user?.id ?? null);
      console.info('[authController.loginUser] roleCode=', roleCode, 'isAdmin=', isAdmin, 'expiresIn=', expiresIn);
    } catch (e) {
      // ignore logging errors
    }

    const token = jwt.sign(
      {
        id: user.usuario_id,
        email: user.email,
        role_code: roleCode,
      },
      JWT_SECRET,
      {
        expiresIn,
      }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.usuario_id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol_code: roleCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const authPayload = req.user;
    if (!authPayload) {
      throw new UnauthorizedError("No autorizado");
    }

    // Preferir buscar por ID si viene en el token, sino por email
    const { id: usuarioId, email } = authPayload;
    let user = null;

    if (usuarioId) {
      user = await getUserByIdModel(usuarioId);
    } else if (email) {
      user = await findUserModel(email);
    }

    if (!user) {
      throw new NotFoundError("Usuario");
    }

    const profile = {
      id: user.usuario_id ?? user.id ?? null,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      rol_code: user.rol_code,
    };

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Renovar token JWT - Extiende la sesión actual
 * El usuario debe estar autenticado (token válido)
 */
export const refreshToken = async (req, res, next) => {
  try {
    const authPayload = req.user;
    if (!authPayload) {
      throw new UnauthorizedError("No autorizado");
    }

    if (!JWT_SECRET) {
      throw new AppError("JWT secret no configurado", 500);
    }

    // Buscar usuario para obtener datos actualizados
    const { id: usuarioId, email, role_code } = authPayload;
    let user = null;

    if (usuarioId) {
      user = await getUserByIdModel(usuarioId);
    } else if (email) {
      user = await findUserModel(email);
    }

    if (!user) {
      throw new NotFoundError("Usuario");
    }

    // Generar nuevo token con misma expiración que login
    const roleCode = user.rol_code ?? user.role_code ?? user.rolCode ?? null;
    const isAdmin = roleCode === 'ADMIN';
    const expiresIn = isAdmin
      ? (process.env.JWT_ADMIN_EXPIRES_IN || '7d')
      : (process.env.JWT_EXPIRES_IN || '24h');

    // DEBUG: logs temporales para depuración de refreshToken
    try {
      console.info('[authController.refreshToken] refreshing token for authPayload=', authPayload);
      console.info('[authController.refreshToken] resolved user id=', user?.usuario_id ?? user?.id ?? null);
      console.info('[authController.refreshToken] roleCode=', roleCode, 'isAdmin=', isAdmin, 'expiresIn=', expiresIn);
    } catch (e) {
      // ignore logging errors
    }

    const newToken = jwt.sign(
      {
        id: user.usuario_id,
        email: user.email,
        role_code: roleCode,
      },
      JWT_SECRET,
      {
        expiresIn,
      }
    );

    return res.status(200).json({
      token: newToken,
      user: {
        id: user.usuario_id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol_code: roleCode,
      },
    });
  } catch (error) {
    next(error);
  }
};
