/**
 * Number formatters for MOA
 * Pure utility functions for formatting numbers in Chilean locale (es-CL)
 */

/**
 * Format a number with Chilean locale (thousands separator with dots)
 * @param {number|string} value - Value to format
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} Formatted number (e.g., "1.234.567")
 * 
 * @example
 * formatNumber(1234567) // "1.234.567"
 * formatNumber(1234.56, { minimumFractionDigits: 2 }) // "1.234,56"
 */
export function formatNumber(value, options = {}) {
  if (value === null || value === undefined) return "0";
  
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  
  return num.toLocaleString("es-CL", options);
}

/**
 * Format a number as integer (no decimals)
 * @param {number|string} value - Value to format
 * @returns {string} Formatted integer (e.g., "1.234")
 * 
 * @example
 * formatInteger(1234.56) // "1.235" (rounded)
 * formatInteger("1234567") // "1.234.567"
 */
export function formatInteger(value) {
  return formatNumber(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format a number with decimals
 * @param {number|string} value - Value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number with decimals (e.g., "1.234,56")
 * 
 * @example
 * formatDecimal(1234.5) // "1.234,50"
 * formatDecimal(1234.567, 3) // "1.234,567"
 */
export function formatDecimal(value, decimals = 2) {
  return formatNumber(value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a percentage
 * @param {number} value - Value as decimal (e.g., 0.1234 for 12.34%)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage (e.g., "12,34%")
 * 
 * @example
 * formatPercentage(0.1234) // "12,34%"
 * formatPercentage(0.5) // "50,00%"
 * formatPercentage(1.25, 0) // "125%"
 */
export function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined) return "0%";
  
  const num = Number(value);
  if (!Number.isFinite(num)) return "0%";
  
  return `${formatDecimal(num * 100, decimals)}%`;
}

/**
 * Parse a Chilean-formatted number string to JavaScript number
 * @param {string} str - Formatted number string (e.g., "1.234,56")
 * @returns {number} Parsed number
 * 
 * @example
 * parseNumber("1.234,56") // 1234.56
 * parseNumber("1.234") // 1234
 */
export function parseNumber(str) {
  if (typeof str !== "string") return Number(str);
  
  // Remove thousands separator (dots) and replace decimal comma with dot
  const normalized = str.trim()
    .replace(/\./g, "")
    .replace(/,/g, ".");
  
  return Number(normalized);
}

/**
 * Ensure a value is a valid number
 * @param {any} value - Value to check
 * @param {number} fallback - Fallback value if invalid (default: 0)
 * @returns {number} Valid number
 * 
 * @example
 * ensureNumber("123") // 123
 * ensureNumber("abc") // 0
 * ensureNumber(null, 100) // 100
 */
export function ensureNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * Clamp a number between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 * 
 * @example
 * clamp(150, 0, 100) // 100
 * clamp(-10, 0, 100) // 0
 * clamp(50, 0, 100) // 50
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
