import { jest } from '@jest/globals';

// Prevenir intentos SMTP reales durante tests
// Usar API ESM cuando esté disponible (jest.unstable_mockModule)
const mockFactory = () => ({
  sendOrderConfirmationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  verifyEmailConfig: jest.fn().mockResolvedValue(true),
});

if (typeof jest.unstable_mockModule === 'function') {
  // Mock ESM (funciona con --experimental-vm-modules)
  jest.unstable_mockModule('./src/services/emailService.js', () => mockFactory());
} else {
  // Fallback para entornos donde jest.mock es suficiente
  jest.mock('./src/services/emailService.js', () => mockFactory());
}
