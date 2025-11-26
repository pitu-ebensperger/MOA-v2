import { useQuery, useMutation, useQueryClient } from '@/lib/react-query-lite';
import { useAuth } from '@/context/AuthContext.jsx';
import { apiClient } from '@/services/api-client.js';

/**
 * Hook para manejar perfil de usuario con TanStack Query
 * ✅ Reemplaza useUser.js (useState + useEffect)
 * ✅ Caché automático del perfil
 * ✅ Invalidación automática al actualizar
 */

const PROFILE_QUERY_KEY = ['user', 'profile'];

// Fetch perfil del usuario
const fetchUserProfile = async (userId) => {
  const { data } = await apiClient.get(`/api/users/${userId}`);
  return data;
};

// Actualizar perfil del usuario
const updateUserProfile = async ({ userId, updatedData }) => {
  const { data } = await apiClient.put(`/api/users/${userId}`, updatedData);
  return data;
};

/**
 * Hook principal para obtener perfil
 */
export const useUserProfile = () => {
  const { user: authUser } = useAuth();
  const userId = authUser?.id || authUser?.usuario_id;

  const query = useQuery({
    queryKey: [...PROFILE_QUERY_KEY, userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: Boolean(userId), // Solo fetch si hay usuario autenticado
    staleTime: 5 * 60 * 1000, // 5 minutos - datos del perfil
    cacheTime: 15 * 60 * 1000, // 15 minutos en memoria
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
  };
};

/**
 * Hook para actualizar perfil (mutation)
 */
export const useUpdateProfile = () => {
  const { user: authUser } = useAuth();
  const userId = authUser?.id || authUser?.usuario_id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updatedData) => updateUserProfile({ userId, updatedData }),
    onSuccess: (updatedProfile) => {
      // Actualizar caché inmediatamente (optimistic update)
      queryClient.setQueryData([...PROFILE_QUERY_KEY, userId], updatedProfile);
      
      // También invalidar para refetch en background
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
};

/**
 * Hook para invalidar caché de perfil (útil después de login/logout)
 */
export const useInvalidateProfile = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidate: () => queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY }),
    clear: () => queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY }),
  };
};
