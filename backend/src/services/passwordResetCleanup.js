import { cleanExpiredTokens } from '../models/passwordResetModel.js';
import { IS_TEST } from '../utils/env.js';

const MIN_INTERVAL_MINUTES = 5;
let cleanupTimer = null;

const shouldLogCleanup = () => process.env.PASSWORD_RESET_CLEANUP_LOGS === 'true';

const runCleanup = async () => {
  try {
    await cleanExpiredTokens();
  } catch (error) {
    if (shouldLogCleanup()) {
      console.error('[PasswordResetCleanup] Error limpiando tokens:', error);
    }
  }
};

export const startPasswordResetCleanupJob = () => {
  const enabled = (process.env.PASSWORD_RESET_CLEANUP_ENABLED ?? 'true') !== 'false';
  if (!enabled) {
    return;
  }

  // No iniciar job en modo test para evitar timers que impiden el cierre de procesos
  if (IS_TEST) {
    return;
  }

  const intervalMinutes = Number(process.env.PASSWORD_RESET_CLEANUP_INTERVAL_MINUTES || 60);
  const safeIntervalMinutes = Number.isFinite(intervalMinutes)
    ? Math.max(intervalMinutes, MIN_INTERVAL_MINUTES)
    : 60;
  const intervalMs = safeIntervalMinutes * 60 * 1000;

  // Ejecutar al iniciar
  runCleanup();

  cleanupTimer = setInterval(runCleanup, intervalMs);
  // Evitar que el timer mantenga el proceso vivo
  if (cleanupTimer.unref) cleanupTimer.unref();
};

export const stopPasswordResetCleanupJob = () => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
};
