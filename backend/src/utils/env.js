/**
 * Utilidades de validación y constantes de entorno para el BACKEND
 * 
 * IMPORTANTE: Estas constantes son SOLO para Node.js (backend)
 * - Backend usa: process.env.NODE_ENV
 * - Frontend usa: import.meta.env.DEV / import.meta.env.PROD (Vite)
 * 
 * NO importar estas constantes en el frontend
 */

const MIN_PASSWORD_RESET_INTERVAL_MINUTES = 5;
const MIN_IDLE_TIMEOUT_MS = 1000;
const MIN_CONNECTION_TIMEOUT_MS = 100;
const ALLOWED_NODE_ENVS = ['development', 'production', 'test'];

/**
 * Constantes de entorno derivadas de process.env.NODE_ENV
 * Solo para uso en backend (Node.js)
 */
export const NODE_ENV = (process.env.NODE_ENV || 'development').trim();
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test';

function ensureBooleanString(value, key) {
  if (value === undefined) return;
  const normalized = value.toLowerCase();
  if (!['true', 'false'].includes(normalized)) {
    throw new Error(`${key} debe ser "true" o "false" (valor actual: "${value}")`);
  }
}

function ensureNumber(value, key, { min, max } = {}) {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${key} debe ser numérico (valor actual: "${value}")`);
  }
  if (min !== undefined && parsed < min) {
    throw new Error(`${key} debe ser un número ≥ ${min}`);
  }
  if (max !== undefined && parsed > max) {
    throw new Error(`${key} debe ser un número ≤ ${max}`);
  }
  return parsed;
}

function ensureHttpUrl(value, key) {
  if (!value) return;
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`${key} debe usar protocolo http o https (valor actual: "${value}")`);
    }
  } catch {
    throw new Error(`${key} debe ser una URL válida (valor actual: "${value}")`);
  }
}

function parseCorsOrigins(env) {
  const single = env.CORS_ORIGIN ? [env.CORS_ORIGIN] : [];
  const multiple = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const merged = [...single, ...multiple];
  const invalid = merged.filter((origin) => {
    try {
      const parsed = new URL(origin);
      return !['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return true;
    }
  });

  if (invalid.length) {
    throw new Error(`CORS_ORIGIN/CORS_ORIGINS contiene valores inválidos: ${invalid.join(', ')}`);
  }

  return merged;
}

export function validateEnv() {
  const env = process.env;

  if (!ALLOWED_NODE_ENVS.includes(NODE_ENV)) {
    throw new Error(`NODE_ENV debe ser uno de: ${ALLOWED_NODE_ENVS.join(', ')}`);
  }

  const required = [
    ['DB_HOST', env.DB_HOST],
    ['DB_USER', env.DB_USER],
    ['DB_PASSWORD', env.DB_PASSWORD],
    ['DB_NAME', env.DB_NAME],
    ['JWT_SECRET', env.JWT_SECRET],
  ];

  const missing = required.filter(([, val]) => !val).map(([key]) => key);
  if (missing.length) {
    throw new Error(`Faltan variables de entorno obligatorias: ${missing.join(', ')}`);
  }

  if (env.DB_PORT && Number.isNaN(Number(env.DB_PORT))) {
    throw new Error('DB_PORT debe ser numérico');
  }

  if (IS_PRODUCTION && env.JWT_SECRET && env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres en producción');
  }

  const corsOrigins = parseCorsOrigins(env);
  if (IS_PRODUCTION && corsOrigins.length === 0) {
    throw new Error('En producción debes definir al menos un origen permitido en CORS_ORIGIN o CORS_ORIGINS');
  }
  ensureHttpUrl(env.FRONTEND_URL, 'FRONTEND_URL');

  ensureNumber(env.PORT, 'PORT', { min: 1, max: 65535 });
  ensureNumber(env.DB_PORT, 'DB_PORT', { min: 1, max: 65535 });
  ensureNumber(env.DB_POOL_MAX, 'DB_POOL_MAX', { min: 1 });
  ensureNumber(env.DB_POOL_IDLE_TIMEOUT_MS, 'DB_POOL_IDLE_TIMEOUT_MS', { min: MIN_IDLE_TIMEOUT_MS });
  ensureNumber(env.DB_POOL_CONNECTION_TIMEOUT_MS, 'DB_POOL_CONNECTION_TIMEOUT_MS', { min: MIN_CONNECTION_TIMEOUT_MS });

  ensureBooleanString(env.PASSWORD_RESET_CLEANUP_ENABLED, 'PASSWORD_RESET_CLEANUP_ENABLED');
  ensureBooleanString(env.PASSWORD_RESET_CLEANUP_LOGS, 'PASSWORD_RESET_CLEANUP_LOGS');
  ensureBooleanString(env.DB_SSL, 'DB_SSL');
  ensureBooleanString(env.DB_SSL_REJECT_UNAUTHORIZED, 'DB_SSL_REJECT_UNAUTHORIZED');

  if (env.PASSWORD_RESET_CLEANUP_INTERVAL_MINUTES !== undefined) {
    const interval = Number(env.PASSWORD_RESET_CLEANUP_INTERVAL_MINUTES);
    if (!Number.isFinite(interval) || interval < MIN_PASSWORD_RESET_INTERVAL_MINUTES) {
      throw new Error(`PASSWORD_RESET_CLEANUP_INTERVAL_MINUTES debe ser un número ≥ ${MIN_PASSWORD_RESET_INTERVAL_MINUTES}`);
    }
  }
  const cleanupEnabled = env.PASSWORD_RESET_CLEANUP_ENABLED?.toLowerCase() === 'true';
  if (cleanupEnabled && env.PASSWORD_RESET_CLEANUP_INTERVAL_MINUTES === undefined) {
    throw new Error('PASSWORD_RESET_CLEANUP_INTERVAL_MINUTES es obligatorio cuando PASSWORD_RESET_CLEANUP_ENABLED=true');
  }

  return true;
}
