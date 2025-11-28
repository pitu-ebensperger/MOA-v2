import { createContext, useContext } from "react";
import { useUserProfile, useUpdateProfile } from "@/modules/profile/hooks/useUserProfile.js"

// Contexto estricto inline
const CONTEXT_NOT_SET = Symbol("STRICT_CONTEXT_NOT_SET");

const createStrictContext = (
  label = "Context",
  { displayName = `${label}Context`, errorMessage } = {},
) => {
  const Context = createContext(CONTEXT_NOT_SET);
  Context.displayName = displayName;

  const useStrictContext = () => {
    const ctx = useContext(Context);
    if (ctx === CONTEXT_NOT_SET) {
      throw new Error(errorMessage ?? `use${label} debe usarse dentro de ${label}Provider`);
    }
    return ctx;
  };

  return [Context, useStrictContext];
};

// Contexto y Hook
export const [UserContext, useUserContext] = createStrictContext("User", {
  displayName: "UserContext",
  errorMessage: "useUserContext debe usarse dentro de UserProvider",
});

// Provider
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
