import { useQuery, useMutation, useQueryClient } from '@/lib/react-query-lite';
import { useAuth } from '@/context/auth-context.js';
import {
  getAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from '@/services/address.api.js';

// Query keys
export const addressKeys = {
  all: ['addresses'],
  lists: () => [...addressKeys.all, 'list'],
  list: (userId) => [...addressKeys.lists(), userId],
  details: () => [...addressKeys.all, 'detail'],
  detail: (id) => [...addressKeys.details(), id],
};

/**
 * Hook para obtener todas las direcciones del usuario
 * @returns {Object} Query result con addresses, defaultAddress, isLoading, error
 */
export function useAddresses() {
  const { user, token } = useAuth();
  const userId = user?.usuario_id || user?.id;

  const query = useQuery({
    queryKey: addressKeys.list(userId),
    queryFn: getAddresses,
    enabled: !!token && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
    retry: 2,
  });

  // Encontrar dirección predeterminada
  const defaultAddress = query.data?.find(addr => addr.predeterminada) || null;

  return {
    addresses: query.data || [],
    defaultAddress,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    hasAddresses: (query.data?.length || 0) > 0,
  };
}

/**
 * Hook para crear nueva dirección
 * @returns {Object} Mutation object
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.usuario_id || user?.id;

  return useMutation({
    mutationFn: createAddress,
    onMutate: async (newAddress) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: addressKeys.list(userId) });

      // Snapshot del estado anterior
      const previousAddresses = queryClient.getQueryData(addressKeys.list(userId));

      // Optimistic update
      if (previousAddresses) {
        queryClient.setQueryData(addressKeys.list(userId), (old) => {
          const updatedAddresses = [...old];
          
          // Si es predeterminada, desmarcar las demás
          if (newAddress.predeterminada || old.length === 0) {
            updatedAddresses.forEach(addr => {
              addr.predeterminada = false;
            });
          }

          // Agregar nueva dirección con ID temporal
          updatedAddresses.push({
            ...newAddress,
            direccion_id: `temp_${Date.now()}`,
            predeterminada: newAddress.predeterminada || old.length === 0,
          });

          return updatedAddresses;
        });
      }

      return { previousAddresses };
    },
    onError: (err, newAddress, context) => {
      // Revertir optimistic update
      if (context?.previousAddresses) {
        queryClient.setQueryData(addressKeys.list(userId), context.previousAddresses);
      }
    },
    onSuccess: () => {
      // Invalidar queries para refetch
      queryClient.invalidateQueries({ queryKey: addressKeys.list(userId) });
    },
  });
}

/**
 * Hook para actualizar dirección existente
 * @returns {Object} Mutation object
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.usuario_id || user?.id;

  return useMutation({
    mutationFn: ({ direccionId, data }) => updateAddress(direccionId, data),
    onMutate: async ({ direccionId, data }) => {
      await queryClient.cancelQueries({ queryKey: addressKeys.list(userId) });

      const previousAddresses = queryClient.getQueryData(addressKeys.list(userId));

      // Optimistic update
      if (previousAddresses) {
        queryClient.setQueryData(addressKeys.list(userId), (old) =>
          old.map(addr =>
            addr.direccion_id === direccionId ? { ...addr, ...data } : addr
          )
        );
      }

      return { previousAddresses };
    },
    onError: (err, variables, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(addressKeys.list(userId), context.previousAddresses);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list(userId) });
    },
  });
}

/**
 * Hook para establecer dirección predeterminada
 * @returns {Object} Mutation object
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.usuario_id || user?.id;

  return useMutation({
    mutationFn: setDefaultAddress,
    onMutate: async (direccionId) => {
      await queryClient.cancelQueries({ queryKey: addressKeys.list(userId) });

      const previousAddresses = queryClient.getQueryData(addressKeys.list(userId));

      // Optimistic update
      if (previousAddresses) {
        queryClient.setQueryData(addressKeys.list(userId), (old) =>
          old.map(addr => ({
            ...addr,
            predeterminada: addr.direccion_id === direccionId,
          }))
        );
      }

      return { previousAddresses };
    },
    onError: (err, variables, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(addressKeys.list(userId), context.previousAddresses);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.list(userId) });
    },
  });
}

/**
 * Hook para eliminar dirección
 * @returns {Object} Mutation object
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.usuario_id || user?.id;

  return useMutation({
    mutationFn: deleteAddress,
    onMutate: async (direccionId) => {
      await queryClient.cancelQueries({ queryKey: addressKeys.list(userId) });

      const previousAddresses = queryClient.getQueryData(addressKeys.list(userId));

      // Optimistic update
      if (previousAddresses) {
        queryClient.setQueryData(addressKeys.list(userId), (old) =>
          old.filter(addr => addr.direccion_id !== direccionId)
        );
      }

      return { previousAddresses };
    },
    onError: (err, variables, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(addressKeys.list(userId), context.previousAddresses);
      }
    },
    onSuccess: () => {
      // Refetch completo porque el backend puede cambiar la dirección predeterminada
      queryClient.invalidateQueries({ queryKey: addressKeys.list(userId) });
    },
  });
}

/**
 * Helper para formatear dirección como string
 * @param {Object} address - Objeto dirección
 * @returns {string} Dirección formateada
 */
export function formatAddress(address) {
  if (!address) return '';
  
  const parts = [
    address.calle,
    address.departamento,
    address.comuna,
    address.ciudad,
    address.region
  ].filter(Boolean);

  return parts.join(', ');
}
