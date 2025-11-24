import configModel from '../models/configModel.js';
import { handleError } from '../utils/error.utils.js';

const ADMIN_ROLE_ALIASES = new Set(['admin', 'administrador']);
const DEMO_ADMIN_EMAILS = new Set(['demo@moa.cl', 'demo@moal.cl']);

const normalizeRoleValue = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const userHasAdminRole = (user) => {
  if (!user) return false;
  const emailValue = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
  if (emailValue && DEMO_ADMIN_EMAILS.has(emailValue)) {
    return true;
  }

  return ['rol', 'role', 'rol_code', 'role_code']
    .map((field) => normalizeRoleValue(user?.[field]))
    .some((value) => ADMIN_ROLE_ALIASES.has(value));
};

const canAccessAdminConfig = (req) => {
  return Boolean(req.admin) || userHasAdminRole(req.user);
};

const configController = {

  async getConfig(req, res) {
    try {
      const config = await configModel.getConfig();
      
      res.status(200).json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error en getConfig:', error);
      handleError(res, error, 'Error al obtener la configuración');
    }
  },

  async updateConfig(req, res) {
    try {
      const userId = req.user?.id_usuario ?? req.user?.usuario_id ?? req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!canAccessAdminConfig(req)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción'
        });
      }

      const configData = req.body;

      // Validación básica
      if (!configData || Object.keys(configData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos un campo para actualizar'
        });
      }

      // Validar formato de email si se proporciona
      if (configData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(configData.email)) {
          return res.status(400).json({
            success: false,
            message: 'Formato de email inválido'
          });
        }
      }

      // Validar URLs si se proporcionan
      const urlFields = ['instagram_url', 'facebook_url', 'twitter_url'];
      for (const field of urlFields) {
        if (configData[field]) {
          try {
            new URL(configData[field]);
          } catch {
            return res.status(400).json({
              success: false,
              message: `URL inválida en el campo ${field}`
            });
          }
        }
      }

      const updatedConfig = await configModel.updateConfig(configData, userId);
      
      res.status(200).json({
        success: true,
        message: 'Configuración actualizada correctamente',
        data: updatedConfig
      });
    } catch (error) {
      console.error('Error en updateConfig:', error);
      handleError(res, error, 'Error al actualizar la configuración');
    }
  },

  async initializeConfig(req, res) {
    try {
      if (!canAccessAdminConfig(req)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción'
        });
      }

      const config = await configModel.initializeConfig();
      
      res.status(201).json({
        success: true,
        message: 'Configuración inicializada correctamente',
        data: config
      });
    } catch (error) {
      console.error('Error en initializeConfig:', error);
      handleError(res, error, 'Error al inicializar la configuración');
    }
  }
};

export default configController;
