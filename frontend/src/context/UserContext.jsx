import { createStrictContext } from "@/context/createStrictContext.js"
import { useUserProfile, useUpdateProfile } from "@/modules/profile/hooks/useUserProfile.js"

// ============================================
// CONTEXTO Y HOOK
// ============================================

export const [UserContext, useUserContext] = createStrictContext("User", {
  displayName: "UserContext",
  errorMessage: "useUserContext debe usarse dentro de UserProvider",
});

// ============================================
// PROVIDER
// ============================================

export const UserProvider = ({ children }) => {
  const { profile, isLoading, error, refetch } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();

  const userState = {
    profile,
    loading: isLoading,
    error,
    fetchProfile: refetch,
    updateProfile: (updatedData) => updateProfileMutation.mutateAsync(updatedData),
    updateProfileState: {
      isLoading: updateProfileMutation.isLoading,
      error: updateProfileMutation.error,
    },
  };

  return <UserContext.Provider value={userState}>{children}</UserContext.Provider>;
};
