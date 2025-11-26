import { API_PATHS } from "@/config/api-paths.js"
import { apiClient } from "@/services/api-client.js"
import { normalizeCategoryList, normalizeProduct } from "@/utils/normalizers.js"

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

const normalizeListResponse = (payload = {}) => {
  const src = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.products)
    ? payload.products
    : Array.isArray(payload.data)
    ? payload.data
    : [];
  const items = src.map(normalizeProduct);
  const total = Number.isFinite(payload.total) 
    ? payload.total 
    : Number.isFinite(payload.pagination?.total)
    ? payload.pagination.total
    : items.length;

  const page = payload.page && typeof payload.page === "object"
    ? {
        offset: Number.isFinite(Number(payload.page.offset)) ? Number(payload.page.offset) : 0,
        limit: Number.isFinite(Number(payload.page.limit)) ? Number(payload.page.limit) : items.length,
      }
    : payload.pagination && typeof payload.pagination === "object"
    ? {
        offset: ((payload.pagination.page || 1) - 1) * (payload.pagination.limit || items.length),
        limit: payload.pagination.limit || items.length,
      }
    : { offset: 0, limit: items.length };

  return { items, total, page };
};

const remoteProductsApi = {
  async list(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.public.get(`${API_PATHS.products.products}${query}`);
    return normalizeListResponse(data);
  },
  async getById(id) {
    if (id == null) throw new Error("product id is required");
    const response = await apiClient.public.get(`/productos/${id}`);
    const data = response?.data ?? response;
    return normalizeProduct(data);
  },
  async getBySlug(slug) {
    if (!slug) throw new Error("product slug is required");
    const response = await apiClient.public.get(`/producto/${slug}`);
    const data = response?.data ?? response;
    return normalizeProduct(data);
  },
  async listCategories(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.public.get(`${API_PATHS.products.categories}${query}`);
    return normalizeCategoryList(data);
  },
  async create(payload = {}) {
    const data = await apiClient.private.post(API_PATHS.products.products, payload);
    return normalizeProduct(data);
  },
  async update(id, patch = {}) {
    if (id == null) throw new Error("product id is required");
    const data = await apiClient.private.put(API_PATHS.products.productDetail(id), patch);
    return normalizeProduct(data);
  },
  async remove(id) {
    if (id == null) throw new Error("product id is required");
    const data = await apiClient.private.delete(API_PATHS.products.productDetail(id));
    return { ok: true, removedId: id, ...(data || {}) };
  },
};

export const productsApi = remoteProductsApi;
