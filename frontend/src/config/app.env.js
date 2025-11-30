const importMetaEnv =
  typeof import.meta !== "undefined" && import.meta?.env
    ? import.meta.env
    : undefined;

const processEnv =
  typeof globalThis !== "undefined" && globalThis.process?.env
    ? globalThis.process.env
    : undefined;

const rawEnv = importMetaEnv || processEnv || {};
const mode = rawEnv.MODE ?? rawEnv.NODE_ENV ?? "development";

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
};

export const env = {
  API_BASE_URL: (
    rawEnv.VITE_API_URL ??
    processEnv?.VITE_API_URL ??
    "http://localhost:4000"
  ).trim(),
  API_TIMEOUT:
    Number(rawEnv.VITE_API_TIMEOUT ?? processEnv?.VITE_API_TIMEOUT) ||
    undefined,
  NODE_ENV: mode,
  IS_DEV: mode === "development",
  IS_PROD: mode === "production",
  DASHBOARD_REFERENCE_DATE: normalizeOptionalString(
    rawEnv.VITE_DASHBOARD_REFERENCE_DATE ?? processEnv?.VITE_DASHBOARD_REFERENCE_DATE
  ),
};
