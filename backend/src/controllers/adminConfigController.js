import configModel from "../models/configModel.js";
import { ValidationError, ForbiddenError } from "../utils/error.utils.js";
import { isValidEmail, isValidUrl } from "../utils/validacion.utils.js";

export class ConfigAdminController {
  static async getStoreConfig(req, res, next) {
    try {
      const config = await configModel.getConfig();

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      console.error("Error obteniendo configuración tienda:", error);
      next(error);
    }
  }

  static async updateStoreConfig(req, res, next) {
    try {
      const config = req.body ?? {};

      if (!Object.keys(config).length) {
        throw new ValidationError("Debe proporcionar al menos un campo para actualizar");
      }

      if (config.email && !isValidEmail(config.email)) {
        throw new ValidationError("Formato de email inválido");
      }

      const socialFields = ["instagram_url", "facebook_url", "twitter_url"];
      for (const field of socialFields) {
        if (config[field] && !isValidUrl(config[field])) {
          throw new ValidationError(`URL inválida en el campo ${field}`);
        }
      }

      const userId =
        req.user?.id_usuario ?? req.user?.usuario_id ?? req.user?.id;

      if (!userId) {
        throw new ForbiddenError("No se pudo determinar el usuario autenticado");
      }

      const updatedConfig = await configModel.updateConfig(config, userId);

      res.json({
        success: true,
        message: "Configuración actualizada correctamente",
        data: updatedConfig,
      });
    } catch (error) {
      console.error("Error actualizando configuración tienda:", error);
      next(error);
    }
  }
}

export default ConfigAdminController;
