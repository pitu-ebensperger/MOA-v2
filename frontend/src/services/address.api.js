import { apiClient } from '@/services/api-client'

const extractResponseData = (response) => response?.data ?? response ?? null;

const parseBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return fallback;
};

const normalizeAddress = (address) => {
  if (!address) return null;

  return {
    direccion_id: address.direccion_id ?? address.id ?? address.address_id ?? null,
    userId: address.userId ?? address.usuario_id ?? address.usuarioId ?? null,
    etiqueta: address.etiqueta ?? address.label ?? '',
    nombre_contacto: address.nombre_contacto ?? address.contactName ?? '',
    telefono_contacto: address.telefono_contacto ?? address.contactPhone ?? '',
    calle: address.calle ?? '',
    numero: address.numero ?? '',
    departamento: address.departamento ?? '',
    comuna: address.comuna ?? '',
    ciudad: address.ciudad ?? '',
    region: address.region ?? '',
    codigo_postal: address.codigo_postal ?? address.postalCode ?? '',
    referencia: address.referencia ?? '',
    predeterminada: (() => {
      if (typeof address.predeterminada !== 'undefined') return address.predeterminada;
      if (typeof address.es_predeterminada !== 'undefined') return address.es_predeterminada;
      if (typeof address.isDefault !== 'undefined') return Boolean(address.isDefault);
      return false;
    })(),
    createdAt: address.createdAt ?? address.creado_en ?? null,
    updatedAt: address.updatedAt ?? address.actualizado_en ?? null,
  };
};

const normalizeAddressCollection = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map(normalizeAddress).filter(Boolean);
};

const splitStreetAndNumber = (value = '') => {
  if (!value) return { calle: '', numero: '' };
  const trimmed = value.trim();
  const match = trimmed.match(/(\d+)(?!.*\d)/);

  if (!match) {
    return { calle: trimmed, numero: '' };
  }

  const numero = match[0];
  const calle = trimmed.replace(numero, '').trim();
  return { calle, numero };
};

const cleanValue = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return value;
};

const prepareAddressPayload = (data = {}, { requireComplete = true } = {}) => {
  const payload = {
    label: cleanValue(data.label ?? data.etiqueta),
    nombre_contacto: cleanValue(data.nombre_contacto ?? data.contactName ?? data.nombre),
    telefono_contacto: cleanValue(data.telefono_contacto ?? data.contactPhone ?? data.telefono),
    calle: cleanValue(data.calle),
    numero: cleanValue(data.numero != null ? data.numero.toString() : undefined),
    departamento: cleanValue(data.departamento),
    comuna: cleanValue(data.comuna),
    ciudad: cleanValue(data.ciudad),
    region: cleanValue(data.region),
    codigo_postal: cleanValue(data.codigo_postal),
    referencia: cleanValue(data.referencia),
  };

  if (typeof data.es_predeterminada !== 'undefined' || typeof data.predeterminada !== 'undefined') {
    payload.es_predeterminada = typeof data.es_predeterminada !== 'undefined'
      ? parseBoolean(data.es_predeterminada)
      : parseBoolean(data.predeterminada);
  }

  if (!payload.numero && payload.calle) {
    const result = splitStreetAndNumber(payload.calle);
    payload.calle = cleanValue(result.calle);
    payload.numero = cleanValue(result.numero);
  }

  if (!payload.label) {
    payload.label = payload.es_predeterminada ? 'principal' : 'casa';
  }

  if (requireComplete) {
    const missingField = [
      ['nombre_contacto', 'nombre de contacto'],
      ['telefono_contacto', 'teléfono de contacto'],
      ['calle', 'calle'],
      ['numero', 'número'],
      ['comuna', 'comuna'],
      ['ciudad', 'ciudad'],
      ['region', 'región'],
    ].find(([field]) => !payload[field]);

    if (missingField) {
      const [, label] = missingField;
      throw new Error(`Debes completar ${label} para guardar la dirección`);
    }
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  return payload;
};

/**
 * Obtener todas las direcciones del usuario autenticado
 * @returns {Promise<Array>} - Array de direcciones
 */
export const getAddresses = async () => {
  try {
    const response = await apiClient.get('/api/direcciones');
    const data = extractResponseData(response);
    return normalizeAddressCollection(data);
  } catch (error) {
    // Si es 401, el usuario no está autenticado - retornar array vacío
    if (error?.status === 401) {
      return [];
    }
    throw error;
  }
};

/**
 * Obtener dirección por ID
 * @param {number} direccionId - ID de la dirección
 * @returns {Promise<Object>} - Objeto dirección
 */
export const getAddressById = async (direccionId) => {
  const response = await apiClient.get(`/api/direcciones/${direccionId}`);
  return normalizeAddress(extractResponseData(response));
};

/**
 * Crear nueva dirección
 * @param {Object} addressData - Datos de la dirección
 * @param {string} addressData.calle - Calle y número
 * @param {string} [addressData.departamento] - Depto/oficina (opcional)
 * @param {string} addressData.comuna - Comuna
 * @param {string} addressData.ciudad - Ciudad
 * @param {string} addressData.region - Región
 * @param {string} [addressData.codigo_postal] - Código postal (opcional)
 * @param {string} [addressData.referencia] - Referencia adicional (opcional)
 * @param {boolean} [addressData.predeterminada] - Si es dirección predeterminada (opcional, auto-true para primera)
 * @returns {Promise<Object>} - Dirección creada
 */
export const createAddress = async (addressData) => {
  const payload = prepareAddressPayload(addressData);
  const response = await apiClient.post('/api/direcciones', payload);
  return normalizeAddress(extractResponseData(response));
};

/**
 * Actualizar dirección existente
 * @param {number} direccionId - ID de la dirección
 * @param {Object} addressData - Datos a actualizar (campos opcionales)
 * @returns {Promise<Object>} - Dirección actualizada
 */
export const updateAddress = async (direccionId, addressData) => {
  const payload = addressData ? prepareAddressPayload(addressData, { requireComplete: false }) : {};
  const response = await apiClient.patch(`/api/direcciones/${direccionId}`, payload);
  return normalizeAddress(extractResponseData(response));
};

/**
 * Establecer dirección como predeterminada
 * @param {number} direccionId - ID de la dirección
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const setDefaultAddress = async (direccionId) => {
  const response = await apiClient.patch(`/api/direcciones/${direccionId}/predeterminada`);
  return normalizeAddress(extractResponseData(response));
};

/**
 * Eliminar dirección
 * @param {number} direccionId - ID de la dirección
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const deleteAddress = async (direccionId) => {
  const response = await apiClient.delete(`/api/direcciones/${direccionId}`);
  return extractResponseData(response);
};
