import { useState, useEffect, useCallback } from 'react';
import { getUserOrders, getOrderById } from '@/services/checkout.api.js';
import { useAuth } from '@/context/AuthContext.jsx';


export const useUserOrders = (options = {}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    limit = 10,
    autoFetch = true,
    estado_pago,
    estado_envio
  } = options;

  const fetchOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = {
        limit,
        offset: 0,
        ...(estado_pago && { estado_pago }),
        ...(estado_envio && { estado_envio })
      };

      const response = await getUserOrders(params);
      
      // Normalizar la estructura de datos
      const ordersList = response?.data || response || [];
      setOrders(Array.isArray(ordersList) ? ordersList : []);

    } catch (err) {
      console.error('Error fetching user orders:', err);
      
      // Si es error 401 (token expirado), retornar empty sin mostrar error
      // El logout ya es manejado por api-client
      if (err?.status === 401 || err?.response?.status === 401) {
        setError(null);
        setOrders([]);
      } else {
        setError('Error al cargar tus órdenes');
        setOrders([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, limit, estado_pago, estado_envio]);

  const getOrderDetails = async (orderId) => {
    try {
      const response = await getOrderById(orderId);
      return response?.data || response;
    } catch (err) {
      console.error('Error fetching order details:', err);
      throw new Error('Error al obtener detalles de la orden');
    }
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  // Auto-fetch cuando el usuario cambia
  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [autoFetch, fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    getOrderDetails,
    refreshOrders,
    hasOrders: orders.length > 0
  };
};

export default useUserOrders;