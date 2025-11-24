export const testEnvironment = 'jsdom';
export const transform = {
  '^.+\\.jsx?$': 'babel-jest',
};
export const moduleFileExtensions = ['js', 'jsx'];
export const testPathIgnorePatterns = ['/node_modules/', '/dist/'];
export const setupFilesAfterEnv = ['<rootDir>/setupTests.js'];
export const moduleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1',
  '^@components/(.*)$': '<rootDir>/src/components/$1',
  '^@context/(.*)$': '<rootDir>/src/context/$1',
  '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
  '^@services/(.*)$': '<rootDir>/src/services/$1',
  '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  '^@config/(.*)$': '<rootDir>/src/config/$1',
};