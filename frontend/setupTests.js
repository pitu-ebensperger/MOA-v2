import '@testing-library/jest-dom';
// Polyfills for jsdom environment used by React Router v7
import { TextEncoder, TextDecoder } from 'util';
if (!globalThis.TextEncoder) globalThis.TextEncoder = TextEncoder;
if (!globalThis.TextDecoder) globalThis.TextDecoder = TextDecoder;