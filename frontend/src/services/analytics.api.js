import { apiClient } from "@/services/api-client.js";

// Helper para extraer la data interna { success, data }
function unwrap(response) {
  if (!response) return null;
  // Algunos endpoints retornan { success: true, data: X }
  if (response.success !== undefined && 'data' in response) {
    return response.data;
  }
  return response; // Si ya viene plano
}

export const analyticsApi = {
  // Dashboard overview metrics
  getDashboardMetrics: async () => {
    const response = await apiClient.get("/admin/analytics/dashboard");
    return unwrap(response.data);
  },

  // Sales analytics
  getSalesAnalytics: async ({ period = "month" } = {}) => {
    const response = await apiClient.get(`/admin/analytics/sales`, {
      params: { period }
    });
    return unwrap(response.data);
  },

  // Conversion metrics
  getConversionMetrics: async ({ period = "month" } = {}) => {
    const response = await apiClient.get("/admin/analytics/conversion", {
      params: { period }
    });
    return unwrap(response.data);
  },

  // Top products analytics
  getTopProducts: async ({ limit = 10, period = "month" } = {}) => {
    const response = await apiClient.get("/admin/analytics/products/top", {
      params: { limit, period }
    });
    return unwrap(response.data);
  },

  // Category analytics
  getCategoryAnalytics: async ({ period = "month" } = {}) => {
    const response = await apiClient.get("/admin/analytics/categories", {
      params: { period }
    });
    return unwrap(response.data);
  },

  // Stock analytics
  getStockAnalytics: async () => {
    const response = await apiClient.get("/admin/analytics/stock");
    return unwrap(response.data);
  },

  // Order distribution analytics
  getOrderDistribution: async ({ period = "week" } = {}) => {
    const response = await apiClient.get("/admin/analytics/orders/distribution", {
      params: { period }
    });
    return unwrap(response.data);
  },
  
  // Customer registrations (new clients)
  getCustomerRegistrations: async ({ days = 30 } = {}) => {
    const response = await apiClient.get("/admin/analytics/customers/registrations", {
      params: { days }
    });
    return unwrap(response.data);
  }
};