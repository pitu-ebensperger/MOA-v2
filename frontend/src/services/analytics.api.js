import { apiClient } from "@/services/api-client.js";
import { env } from "@/config/env.js";

// Helper para extraer la data interna { success, data }
function unwrap(response) {
  if (!response) return null;
  // Algunos endpoints retornan { success: true, data: X }
  if (response.success !== undefined && 'data' in response) {
    return response.data;
  }
  return response; // Si ya viene plano
}

const withReferenceDate = (params = {}) => {
  if (!env.DASHBOARD_REFERENCE_DATE) return params;
  return { ...params, referenceDate: env.DASHBOARD_REFERENCE_DATE };
};

export const analyticsApi = {
  // Dashboard overview metrics
  getDashboardMetrics: async () => {
    const response = await apiClient.get("/admin/analytics/dashboard", {
      params: withReferenceDate(),
    });
    return unwrap(response);
  },

  // Sales analytics
  getSalesAnalytics: async ({ period = "month" } = {}) => {
    const response = await apiClient.get(`/admin/analytics/sales`, {
      params: withReferenceDate({ period })
    });
    return unwrap(response);
  },

  // Conversion metrics
  getConversionMetrics: async ({ period = "month" } = {}) => {
    const response = await apiClient.get("/admin/analytics/conversion", {
      params: withReferenceDate({ period })
    });
    return unwrap(response);
  },

  // Top products analytics
  getTopProducts: async ({ limit = 10, period = "month" } = {}) => {
    const response = await apiClient.get("/admin/analytics/products/top", {
      params: withReferenceDate({ limit, period })
    });
    return unwrap(response);
  },

  // Category analytics
  getCategoryAnalytics: async ({ period = "month" } = {}) => {
    const response = await apiClient.get("/admin/analytics/categories", {
      params: withReferenceDate({ period })
    });
    return unwrap(response);
  },

  // Stock analytics
  getStockAnalytics: async () => {
    const response = await apiClient.get("/admin/analytics/stock", {
      params: withReferenceDate()
    });
    return unwrap(response);
  },

  // Order distribution analytics
  getOrderDistribution: async ({ period = "week" } = {}) => {
    const response = await apiClient.get("/admin/analytics/orders/distribution", {
      params: withReferenceDate({ period })
    });
    return unwrap(response);
  },
  
  // Customer registrations (new clients)
  getCustomerRegistrations: async ({ days = 30 } = {}) => {
    const response = await apiClient.get("/admin/analytics/customers/registrations", {
      params: withReferenceDate({ days })
    });
    return unwrap(response);
  }
};
