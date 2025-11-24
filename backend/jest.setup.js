import { jest } from '@jest/globals';

// Prevent real SMTP attempts during tests; override the email service globally.
// Use ESM-aware API when available (jest.unstable_mockModule) and fall back to
// the classic jest.mock for older runtimes.
const mockFactory = () => ({
  sendOrderConfirmationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  verifyEmailConfig: jest.fn().mockResolvedValue(true),
});

if (typeof jest.unstable_mockModule === 'function') {
  // ESM-aware mock (works with --experimental-vm-modules)
  jest.unstable_mockModule('./src/services/emailService.js', () => mockFactory());
} else {
  // Fallback for environments where jest.mock is sufficient
  jest.mock('./src/services/emailService.js', () => mockFactory());
}
