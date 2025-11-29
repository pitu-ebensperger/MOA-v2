import { addressModel } from "../models/addressModel.js";
import { AppError, NotFoundError } from "../utils/error.utils.js";
import { 
  isValidRegion, 
  isValidComuna, 
  getRegionCodeByName,
  getComunasByRegion,
  normalizeRegionName 
} from "../../../shared/constants/ubicaciones.js";

// Helper para obtener usuario_id del request
const getRequestUserId = (req) => req.user?.usuario_id ?? req.user?.id;

/**
 * Obtener todas las direcciones del usuario autenticado
 */
export const getUserAddresses = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const addresses = await addressModel.getUserAddresses(usuarioId);

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener dirección por ID
 */
export const getAddressById = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const address = await addressModel.getById(parseInt(id), usuarioId);

    if (!address) {
      throw new NotFoundError('Dirección no encontrada');
    }

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener dirección predeterminada
 */
export const getDefaultAddress = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const address = await addressModel.getDefaultAddress(usuarioId);

    res.status(200).json({
      success: true,
      data: address, // puede ser null si no hay dirección predeterminada
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nueva dirección
 */
export const createAddress = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    let {
      label,
      nombre_contacto,
      telefono_contacto,
      calle,
      numero,
      departamento,
      comuna,
      ciudad,
      region,
      codigo_postal,
      referencia,
      es_predeterminada
    } = req.body;

    // Validaciones básicas
    if (!nombre_contacto || !telefono_contacto || !calle || !numero || !comuna || !ciudad || !region) {
      throw new AppError('Faltan campos requeridos', 400);
    }

    // Normalizar nombre de región
    const normalizedRegion = normalizeRegionName(region);
    const regionCode = getRegionCodeByName(normalizedRegion);

    // Validar región
    if (!regionCode || !isValidRegion(regionCode)) {
      throw new AppError(`Región inválida: ${region}. Debe ser una región válida de Chile.`, 400);
    }

    // Validar comuna pertenece a la región
    if (!isValidComuna(regionCode, comuna)) {
      const comunasValidas = getComunasByRegion(regionCode);
      throw new AppError(
        `Comuna "${comuna}" no pertenece a la región "${normalizedRegion}". Comunas válidas: ${comunasValidas.slice(0, 5).join(', ')}${comunasValidas.length > 5 ? '...' : ''}`,
        400
      );
    }

    const addressData = {
      usuario_id: usuarioId,
      label: label || 'casa',
      nombre_contacto,
      telefono_contacto,
      calle,
      numero,
      departamento,
      comuna,
      ciudad,
      region: normalizedRegion, // Usar nombre normalizado
      codigo_postal,
      referencia,
      es_predeterminada: es_predeterminada === true
    };

    const address = await addressModel.create(addressData);

    res.status(201).json({
      success: true,
      message: 'Dirección creada exitosamente',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar dirección existente
 */
export const updateAddress = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;
    const updateData = { ...req.body };

    // Validar región/comuna si se actualizan
    if (updateData.region || updateData.comuna) {
      const currentAddress = await addressModel.getById(parseInt(id), usuarioId);
      if (!currentAddress) {
        throw new NotFoundError('Dirección no encontrada');
      }

      // Usar región actual si no se actualiza
      const regionToValidate = updateData.region || currentAddress.region;
      const comunaToValidate = updateData.comuna || currentAddress.comuna;

      // Normalizar región
      const normalizedRegion = normalizeRegionName(regionToValidate);
      const regionCode = getRegionCodeByName(normalizedRegion);

      // Validar región
      if (!regionCode || !isValidRegion(regionCode)) {
        throw new AppError(`Región inválida: ${regionToValidate}`, 400);
      }

      // Validar comuna pertenece a la región
      if (!isValidComuna(regionCode, comunaToValidate)) {
        const comunasValidas = getComunasByRegion(regionCode);
        throw new AppError(
          `Comuna "${comunaToValidate}" no pertenece a la región "${normalizedRegion}". Comunas válidas: ${comunasValidas.slice(0, 5).join(', ')}${comunasValidas.length > 5 ? '...' : ''}`,
          400
        );
      }

      if (updateData.region) {
        updateData.region = normalizedRegion;
      }
    }

    const address = await addressModel.update(parseInt(id), usuarioId, updateData);

    if (!address) {
      throw new NotFoundError('Dirección no encontrada');
    }

    res.status(200).json({
      success: true,
      message: 'Dirección actualizada exitosamente',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Establecer dirección como predeterminada
 */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const address = await addressModel.setAsDefault(parseInt(id), usuarioId);

    if (!address) {
      throw new NotFoundError('Dirección no encontrada');
    }

    res.status(200).json({
      success: true,
      message: 'Dirección establecida como predeterminada',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar dirección
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const usuarioId = getRequestUserId(req);
    const { id } = req.params;

    const deleted = await addressModel.delete(parseInt(id), usuarioId);

    if (!deleted) {
      throw new NotFoundError('Dirección no encontrada');
    }

    res.status(200).json({
      success: true,
      message: 'Dirección eliminada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todas las regiones de Chile
 * Endpoint público para formularios de dirección
 */
export const getRegiones = async (req, res, next) => {
  try {
    const { REGIONES } = await import('../../../shared/constants/ubicaciones.js');
    
    res.status(200).json({
      success: true,
      data: REGIONES,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener comunas de una región específica
 * Endpoint público para cascading selects
 */
export const getComunasByRegionCode = async (req, res, next) => {
  try {
    const { regionCode } = req.params;
    
    if (!regionCode) {
      throw new AppError('Código de región es requerido', 400);
    }

    if (!isValidRegion(regionCode)) {
      throw new AppError(`Código de región inválido: ${regionCode}`, 400);
    }

    const comunas = getComunasByRegion(regionCode);

    res.status(200).json({
      success: true,
      data: {
        regionCode,
        comunas,
      },
    });
  } catch (error) {
    next(error);
  }
};
