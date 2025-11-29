/**
 * Tests para utilidades de validación
 */

import {
  EMAIL_REGEX,
  isValidEmail,
  normalizeEmail,
  validateAndNormalizeEmail,
  isValidUrl,
  isValidHttpUrl
} from '../src/utils/validacion.utils.js';

describe('Validation Utils', () => {
  describe('EMAIL_REGEX', () => {
    it('debe estar exportado', () => {
      expect(EMAIL_REGEX).toBeDefined();
      expect(EMAIL_REGEX instanceof RegExp).toBe(true);
    });
  });

  describe('isValidEmail', () => {
    it('debe validar emails correctos', () => {
      expect(isValidEmail('usuario@dominio.com')).toBe(true);
      expect(isValidEmail('test@test.cl')).toBe(true);
      expect(isValidEmail('admin@moa.store')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('debe rechazar emails inválidos', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user domain@test.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('debe manejar valores no string', () => {
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail(123)).toBe(false);
      expect(isValidEmail({})).toBe(false);
    });

    it('debe validar emails con espacios (trimmed)', () => {
      expect(isValidEmail('  test@test.com  ')).toBe(true);
    });
  });

  describe('normalizeEmail', () => {
    it('debe normalizar emails correctamente', () => {
      expect(normalizeEmail('Test@Example.COM')).toBe('test@example.com');
      expect(normalizeEmail('  admin@moa.cl  ')).toBe('admin@moa.cl');
      expect(normalizeEmail('USER@DOMAIN.CL')).toBe('user@domain.cl');
    });

    it('debe manejar valores inválidos', () => {
      expect(normalizeEmail(null)).toBe('');
      expect(normalizeEmail(undefined)).toBe('');
      expect(normalizeEmail('')).toBe('');
    });
  });

  describe('validateAndNormalizeEmail', () => {
    it('debe validar y normalizar emails válidos', () => {
      expect(validateAndNormalizeEmail('Test@Example.com')).toBe('test@example.com');
      expect(validateAndNormalizeEmail('  ADMIN@MOA.CL  ')).toBe('admin@moa.cl');
    });

    it('debe retornar null para emails inválidos', () => {
      expect(validateAndNormalizeEmail('invalid')).toBe(null);
      expect(validateAndNormalizeEmail('@domain.com')).toBe(null);
      expect(validateAndNormalizeEmail('')).toBe(null);
      expect(validateAndNormalizeEmail(null)).toBe(null);
    });
  });

  describe('isValidUrl', () => {
    it('debe validar URLs correctas', () => {
      expect(isValidUrl('https://www.example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://ftp.example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
    });

    it('debe rechazar URLs inválidas', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('://invalid')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
    });
  });

  describe('isValidHttpUrl', () => {
    it('debe validar URLs HTTP/HTTPS', () => {
      expect(isValidHttpUrl('https://www.example.com')).toBe(true);
      expect(isValidHttpUrl('http://localhost:3000')).toBe(true);
      expect(isValidHttpUrl('https://moa.cl')).toBe(true);
    });

    it('debe rechazar URLs sin HTTP/HTTPS', () => {
      expect(isValidHttpUrl('ftp://ftp.example.com')).toBe(false);
      expect(isValidHttpUrl('file:///path/to/file')).toBe(false);
    });

    it('debe rechazar URLs inválidas', () => {
      expect(isValidHttpUrl('not-a-url')).toBe(false);
      expect(isValidHttpUrl('')).toBe(false);
      expect(isValidHttpUrl(null)).toBe(false);
    });
  });
});
