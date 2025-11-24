import { findUserModel, updateUserPasswordModel } from '../models/usersModel.js';
import { 
  createResetToken, 
  findValidToken, 
  markTokenAsUsed,
  invalidateUserTokens
} from '../models/passwordResetModel.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { AppError, UnauthorizedError } from '../utils/error.utils.js';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/request-password-reset
 * Solicitar reset de contraseña
 */
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validación de email
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new AppError('Email es requerido', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new AppError('Email inválido', 400);
    }

    // Buscar usuario
    const user = await findUserModel(normalizedEmail);

    // Por seguridad, siempre responder exitosamente
    // No revelar si el email existe o no
    if (!user) {
      // Simular delay para evitar timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.status(200).json({
        success: true,
        message: 'Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.'
      });
    }

    // Invalidar tokens anteriores del usuario
    await invalidateUserTokens(user.usuario_id);

    // Crear nuevo token
    const resetToken = await createResetToken(user.usuario_id);

    // Enviar email
    try {
      await sendPasswordResetEmail({
        email: user.email,
        nombre: user.nombre,
        token: resetToken.token,
      });
    } catch (emailError) {
      console.error('[PasswordReset] ❌ Error al enviar email:', emailError);
      
      // Si falla el envío de email, eliminar el token creado
      await markTokenAsUsed(resetToken.token);
      
      throw new AppError('Error al enviar el correo. Intenta nuevamente más tarde.', 500);
    }

    return res.status(200).json({
      success: true,
      message: 'Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.'
    });

  } catch (error) {
    console.error('[PasswordReset] Error en requestPasswordReset:', error);
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 * Restablecer contraseña con token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Validaciones
    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new AppError('Token es requerido', 400);
    }

    if (!password || typeof password !== 'string') {
      throw new AppError('Contraseña es requerida', 400);
    }

    if (password.length < 8) {
      throw new AppError('La contraseña debe tener al menos 8 caracteres', 400);
    }

    // Validar fortaleza de contraseña (opcional pero recomendado)
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      throw new AppError('La contraseña debe contener al menos una mayúscula, una minúscula y un número', 400);
    }

    // Validar token
    const resetToken = await findValidToken(token);

    if (!resetToken) {
      throw new UnauthorizedError('Token inválido o expirado. Solicita un nuevo enlace de recuperación.');
    }

    // Hash nueva contraseña
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Actualizar contraseña
    const updatedUser = await updateUserPasswordModel(resetToken.usuario_id, hashedPassword);

    if (!updatedUser) {
      throw new AppError('Error al actualizar la contraseña', 500);
    }

    // Marcar token como usado
    await markTokenAsUsed(token);

    // Invalidar cualquier otro token pendiente del usuario
    await invalidateUserTokens(resetToken.usuario_id);

    return res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    });

  } catch (error) {
    console.error('[PasswordReset] Error en resetPassword:', error);
    next(error);
  }
};
