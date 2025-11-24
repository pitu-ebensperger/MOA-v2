import {
  startPasswordResetCleanupJob,
  stopPasswordResetCleanupJob,
} from "../services/passwordResetCleanup.js";

// Thin wrapper kept for compatibility with older import path used in server.js
export { startPasswordResetCleanupJob, stopPasswordResetCleanupJob };
