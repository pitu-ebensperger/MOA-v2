// Barrel file for context modules.
// Exports each context module as a namespace to avoid name collisions
// and provide a single import point: `import { Auth, Cart } from '@/context'`

export * as Auth from './auth-context.js';
export * as AuthOptimized from './AuthOptimized.jsx';
export * as Cart from './cart-context.js';
export * as User from './user-context.js';
export * as Wishlist from './wishlist-context.js';
export * as Address from './address-context-state.js';
export * as Order from './order-context.js';
export * as Categories from './categories-context.js';
