import { API_PATHS } from "@/config/api-paths.js";
import { apiClient } from "@/services/api-client.js";

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const buildQuery = (params = {}) => {
  const query = buildQueryString(params);
  return query ? `${query}` : "";
};

export const customersAdminApi = {
  list: async ({ page = 1, limit = 20, search = "" } = {}) => {
    const query = buildQuery({
      page,
      limit,
      search,
    });
    const response = await apiClient.get(`${API_PATHS.admin.customers}${query}`);
    return response;
  },

  create: async (payload = {}) => {
    const response = await apiClient.post(API_PATHS.admin.createCustomer, payload);
    return response;
  },

  update: async (id, payload = {}) => {
    const response = await apiClient.patch(API_PATHS.admin.updateCustomer(id), payload);
    return response;
  },
};
