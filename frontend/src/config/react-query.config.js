/**Query Keys centralizadas para React Query
 */

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

/**
 * Configuraciones de stale time por tipo de dato
 * (tiempo que los datos se consideran frescos)
 */
export const STALE_TIMES = {
  // Datos casi estáticos
  categories: Infinity, // Rara vez cambian
  storeConfig: 30 * 60 * 1000, // 30 minutos
  
  // Datos semi-estáticos
  products: 5 * 60 * 1000, // 5 minutos
  productDetail: 5 * 60 * 1000, // 5 minutos
  
  // Datos dinámicos
  cart: 1 * 60 * 1000, // 1 minuto
  wishlist: 5 * 60 * 1000, // 5 minutos
  orders: 2 * 60 * 1000, // 2 minutos
  orderDetail: 1 * 60 * 1000, // 1 minuto (tracking)
  
  // Datos del usuario
  userProfile: 10 * 60 * 1000, // 10 minutos
  addresses: 5 * 60 * 1000, // 5 minutos
  
  // Admin
  adminDashboard: 2 * 60 * 1000, // 2 minutos
  adminOrders: 1 * 60 * 1000, // 1 minuto
  adminStats: 5 * 60 * 1000, // 5 minutos
};

/**
 * Configuraciones de cache time por tipo de dato
 * (tiempo que los datos permanecen en cache después de no usarse)
 */
export const CACHE_TIMES = {
  short: 5 * 60 * 1000, // 5 minutos
  medium: 10 * 60 * 1000, // 10 minutos
  long: 30 * 60 * 1000, // 30 minutos
};

/**
 * Configuración de prefetch inteligente
 */
export const PREFETCH_CONFIG = {
  // Prefetch siguiente página de productos
  productsNextPage: true,
  
  // Prefetch detalles de producto al hover
  productDetailsOnHover: true,
  
  // Prefetch relacionados
  relatedProducts: true,
};
