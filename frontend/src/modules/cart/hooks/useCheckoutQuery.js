import { useMutation, useQueryClient } from '@/config/query.client.config.js';
import { createOrder as createOrderService } from '@/services/checkout.api.js';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkoutData) => createOrderService(checkoutData),
    onSuccess: (response) => { // eslint-disable-line no-unused-vars
      // Invalidate cart and orders caches so UI reflects the new order
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export default useCreateOrder;
