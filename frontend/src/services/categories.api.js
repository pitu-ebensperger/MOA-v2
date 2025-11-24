import { API_PATHS } from "@/config/api-paths.js";
import { apiClient } from "@/services/api-client.js";
import { normalizeCategory, normalizeCategoryList } from "@/utils/normalizers.js";

const _slugPattern = /^[a-z0-9-]+$/;

const _sanitizeSlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

const remoteCategoriesApi = {
  async list() {
    const data = await apiClient.get(API_PATHS.products.categories);
    return normalizeCategoryList(data);
  },
  async create(payload = {}) {
    const response = await apiClient.post(API_PATHS.admin.categories, payload);
    const payloadData = response?.data ?? response;
    return normalizeCategory(payloadData);
  },
  async update(id, patch = {}) {
    if (id == null) throw new Error("Se requiere el ID de la categoría");
    const response = await apiClient.put(API_PATHS.admin.categoryDetail(id), patch);
    const payloadData = response?.data ?? response;
    return normalizeCategory(payloadData);
  },
  async remove(id) {
    if (id == null) throw new Error("Se requiere el ID de la categoría");
    return apiClient.delete(API_PATHS.admin.categoryDetail(id));
  },
  async countProducts(id) {
    if (id == null) throw new Error("Se requiere el ID de la categoría");
    const response = await apiClient.get(API_PATHS.admin.categoryProductsCount(id));
    return response?.data?.producto_count ?? response?.data?.productCount ?? null;
  },
};

export const categoriesApi = remoteCategoriesApi;
