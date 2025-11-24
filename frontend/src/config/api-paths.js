export const API_PATHS = {
  home: {
    landing: "/home",
  },
  auth: {
    login: "/login",
    register: "/registro",
    profile: "/auth/perfil",
    forgot: "/auth/olvidaste-contrasena",
    reset: "/auth/restablecer-contrasena",
    requestPasswordReset: "/api/auth/request-password-reset",
    resetPassword: "/api/auth/reset-password",
  },
  products: {
    products: "/productos",
    productDetail: (id) => `/producto/${id}`,
    categories: "/categorias",
  },
  cart: {
    root: (userId) => `/${userId}/cart`,
    checkout: (userId) => `/${userId}/checkout`,
  },
  profile: {
    root: (userId) => `/${userId}/perfil`,
  },
  orders: {
    root: (userId) => `/${userId}/mis-pedidos`,
    detail: (userId, orderId) => `/${userId}/mis-pedidos/${orderId}`,
  },
  wishlist: {
    root: (userId) => `/${userId}/wishlist`,
  },
  support: {
    contact: "/contacto",
    faq: "/preguntas-frecuentes",
    privacy: "/politica-de-privacidad",
    terms: "/terminos-y-condiciones",
    returns: "/cambios-y-devoluciones",
    legalNotice: "/aviso-legal-gdpr",
  },
  admin: {
    dashboard: "/admin",
    products: "/admin/productos",
    categories: "/admin/categorias",
    categoryDetail: (id) => `/admin/categorias/${id}`,
    categoryProductsCount: (id) => `/admin/categorias/${id}/productos/count`,
    orders: "/admin/pedidos",
    customers: "/admin/usuarios",
    createCustomer: "/admin/clientes",
    updateCustomer: (id) => `/admin/clientes/${id}`,
    settings: "/admin/configuraciones",
  },
};
