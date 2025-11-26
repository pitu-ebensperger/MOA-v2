export const QUERY_KEYS = {
  // Productos
  products: ['products'],
  productsList: (filters) => ['products', filters],
  product: (id) => ['products', 'detail', id],

  // Categorías
  categories: ['categories'],
  category: (id) => ['categories', 'detail', id],

  // Órdenes
  orders: ['orders'],
  ordersList: (filters) => ['orders', filters],
  order: (id) => ['orders', 'detail', id],

  // Usuario
  user: ['user'],
  userProfile: ['user', 'profile'],

  // Carrito
  cart: ['cart'],

  // Wishlist
  wishlist: ['wishlist'],

  // Direcciones
  addresses: ['addresses'],
  address: (id) => ['addresses', 'detail', id],

  // Admin
  admin: {
    dashboard: ['admin', 'dashboard'],
    orders: (filters) => ['admin', 'orders', filters],
    products: (filters) => ['admin', 'products', filters],
    customers: (filters) => ['admin', 'customers', filters],
    categories: ['admin', 'categories'],
    stats: ['admin', 'stats'],
  },

  // Configuración
  config: ['config'],
  storeConfig: ['config', 'store'],
};

export const STALE_TIMES = {
  categories: Infinity,
  storeConfig: 30 * 60 * 1000,
  products: 5 * 60 * 1000,
  productDetail: 5 * 60 * 1000,
  cart: 1 * 60 * 1000,
  wishlist: 5 * 60 * 1000,
  orders: 2 * 60 * 1000,
  orderDetail: 1 * 60 * 1000,
  userProfile: 10 * 60 * 1000,
  addresses: 5 * 60 * 1000,
  adminDashboard: 2 * 60 * 1000,
  adminOrders: 1 * 60 * 1000,
  adminStats: 5 * 60 * 1000,
};

export const CACHE_TIMES = {
  short: 5 * 60 * 1000,
  medium: 10 * 60 * 1000,
  long: 30 * 60 * 1000,
};

export const PREFETCH_CONFIG = {
  productsNextPage: true,
  productDetailsOnHover: true,
  relatedProducts: true,
};
