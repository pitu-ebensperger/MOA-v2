import { API_PATHS } from "@/config/app.routes.js"
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

const extractSourceArray = (payload) => {
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.products)) return payload.products;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const extractTotal = (payload, itemsLength) => {
  if (Number.isFinite(payload.total)) return payload.total;
  if (Number.isFinite(payload.pagination?.total)) return payload.pagination.total;
  return itemsLength;
};

const extractPageInfo = (payload, itemsLength) => {
  if (payload.page && typeof payload.page === "object") {
    return {
      offset: Number.isFinite(Number(payload.page.offset)) ? Number(payload.page.offset) : 0,
      limit: Number.isFinite(Number(payload.page.limit)) ? Number(payload.page.limit) : itemsLength,
    };
  }
  
  if (payload.pagination && typeof payload.pagination === "object") {
    const { page = 1, limit = itemsLength } = payload.pagination;
    return {
      offset: (page - 1) * limit,
      limit,
    };
  }
  
  return { offset: 0, limit: itemsLength };
};

const normalizeListResponse = (payload = {}) => {
  const src = extractSourceArray(payload);
  const items = src.map(normalizeProduct);
  const total = extractTotal(payload, items.length);
  const page = extractPageInfo(payload, items.length);

  return { items, total, page };
};

const remoteProductsApi = {
  async list(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.public.get(`${API_PATHS.products.apiProducts}${query}`);
    return normalizeListResponse(data);
  },
  async getById(id) {
    if (id == null) throw new Error("product id is required");
    const response = await apiClient.public.get(API_PATHS.products.apiProductById(id));
    const data = response?.data ?? response;
    return normalizeProduct(data);
  },
  async getBySlug(slug) {
    if (!slug) throw new Error("product slug is required");
    const response = await apiClient.public.get(API_PATHS.products.apiProductBySlug(slug));
    const data = response?.data ?? response;
    return normalizeProduct(data);
  },
  async listCategories(params = {}) {
    const query = buildQueryString(params);
    const data = await apiClient.public.get(`${API_PATHS.products.apiCategories}${query}`);
    return normalizeCategoryList(data);
  },
  async create(payload = {}) {
    const data = await apiClient.private.post(API_PATHS.admin.products, payload);
    return normalizeProduct(data);
  },
  async update(id, patch = {}) {
    if (id == null) throw new Error("product id is required");
    const data = await apiClient.private.put(API_PATHS.admin.productDetail(id), patch);
    return normalizeProduct(data);
  },
  async remove(id) {
    if (id == null) throw new Error("product id is required");
    const data = await apiClient.private.delete(API_PATHS.admin.productDetail(id));
    return { ok: true, removedId: id, ...(data || {}) };
  },
};

export const productsApi = remoteProductsApi;
