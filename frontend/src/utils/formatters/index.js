/**
 * Formatters Index
 * Barrel file for all formatting utilities
 */

// Currency formatters
export { formatCurrencyCLP } from './currency.js';

// Number formatters
export {
  formatNumber,
  formatInteger,
  formatDecimal,
  formatPercentage,
  parseNumber,
  ensureNumber,
  clamp,
} from './numbers.js';

// Note: Date formatters are in ../date.js (to be moved here in future refactor)
