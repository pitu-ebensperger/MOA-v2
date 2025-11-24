/**
 * Centralized logger for MOA
 * Only logs in development, silences in production
 */

const isDev = import.meta.env?.DEV || import.meta.env?.MODE === 'development';

export const logger = {
  /**
   * Log general information (dev only)
   */
  log: (...args) => {
    if (isDev) console.log(...args);
  },

  /**
   * Log warnings (dev only)
   */
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },

  /**
   * Log errors (always shown, even in production)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Debug logs (dev only, verbose)
   */
  debug: (...args) => {
    if (isDev) console.debug(...args);
  },

  /**
   * Group logs (dev only)
   */
  group: (label, fn) => {
    if (!isDev) return;
    console.group(label);
    fn();
    console.groupEnd();
  },

  /**
   * Time measurements (dev only)
   */
  time: (label) => {
    if (isDev) console.time(label);
  },

  timeEnd: (label) => {
    if (isDev) console.timeEnd(label);
  },
};

export default logger;
