import { apiClient } from '@/services/api-client'

export const createOrder = async (checkoutData) => {
  const response = await apiClient.post('/api/checkout', checkoutData);
  return response;
};

export const getUserOrders = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `/api/orders?${queryParams}` : '/api/orders';
  const response = await apiClient.get(url);
  return response?.data ?? response;
};

export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/api/orders/${orderId}`);
  return response?.data ?? response;
};

export const cancelOrder = async (orderId) => {
  const response = await apiClient.delete(`/api/orders/${orderId}`);
  return response?.data ?? response;
};
