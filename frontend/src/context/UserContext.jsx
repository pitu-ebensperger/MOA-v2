import { UserContext } from "@/context/user-context.js"
import { useUserProfile, useUpdateProfile } from "@/modules/profile/hooks/useUserProfile.js"

export const UserProvider = ({ children }) => {
  const { profile, isLoading, error, refetch } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();

  const userState = {
    profile,
    loading: isLoading,
    error,
    fetchProfile: refetch,
    // Exponer una función conveniente que use la mutation (retorna promesa)
    updateProfile: (updatedData) => updateProfileMutation.mutateAsync(updatedData),
    // También exponer el estado de la mutation si es necesario
    updateProfileState: {
      isLoading: updateProfileMutation.isLoading,
      error: updateProfileMutation.error,
    },
  };

  return <UserContext.Provider value={userState}>{children}</UserContext.Provider>;
};
