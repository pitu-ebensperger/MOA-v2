import pool from "../../database/config.js";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

let cachedReferenceIso = null;
let cacheExpiresAt = 0;

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const envReferenceDate = parseDate(process.env.ANALYTICS_REFERENCE_DATE);

const resolveOverrideDate = (value) => {
  const parsed = parseDate(value);
  return parsed;
};

export const getReferenceDate = async (options = {}) => {
  const manualOverride = resolveOverrideDate(options.overrideDate);
  if (manualOverride) return manualOverride;

  if (envReferenceDate) {
    return new Date(envReferenceDate);
  }

  const now = Date.now();
  if (cachedReferenceIso && cacheExpiresAt > now) {
    return new Date(cachedReferenceIso);
  }

  const { rows } = await pool.query(
    `
      SELECT MAX(creado_en) AS last_order_date
      FROM ordenes
    `
  );

  const lastOrderDate = parseDate(rows[0]?.last_order_date);
  const referenceDate = lastOrderDate ?? new Date();

  cachedReferenceIso = referenceDate.toISOString();
  cacheExpiresAt = now + CACHE_TTL_MS;

  return new Date(referenceDate);
};

export const getLastNDaysWindow = async (days = 30, options = {}) => {
  const referenceDate = await getReferenceDate(options);
  const endDate = new Date(referenceDate);
  endDate.setHours(0, 0, 0, 0);
  endDate.setDate(endDate.getDate() + 1); // usar límite exclusivo

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - Number(days));

  return { referenceDate, startDate, endDate };
};
