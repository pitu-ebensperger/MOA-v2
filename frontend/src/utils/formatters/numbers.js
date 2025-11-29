// FORMATEO BÁSICO

export function formatNumber(value, options = {}) {
  if (value === null || value === undefined) return "0";
  
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  
  return num.toLocaleString("es-CL", options);
}

export function formatInteger(value) {
  return formatNumber(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatDecimal(value, decimals = 2) {
  return formatNumber(value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined) return "0%";
  
  const num = Number(value);
  if (!Number.isFinite(num)) return "0%";
  
  return `${formatDecimal(num * 100, decimals)}%`;
}

// PARSING

export function parseNumber(str) {
  if (typeof str !== "string") return Number(str);
  
  // Remove thousands separator (dots) and replace decimal comma with dot
  const normalized = str.trim()
    .replace(/\./g, "")
    .replace(/,/g, ".");
  
  return Number(normalized);
}

// HELPERS

export function ensureNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function toNum(value, fallback = null) {
  if (value === null || value === undefined) {
    return fallback;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}
