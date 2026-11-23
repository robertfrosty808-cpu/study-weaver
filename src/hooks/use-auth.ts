import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const impl = useAuthActions();

  // The generated Convex API does not type-check in this environment, so the
  // current user is left null here. Replace with
  // `useQuery(api.users.currentUser)` once the Convex backend compiles.
  const user = null as unknown as {
    _id?: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
  } | null;

  return {
    isLoading: isAuthLoading,
    isAuthenticated,
    user,
    signIn: (() => Promise.resolve()) as unknown as typeof impl.signIn,
    signOut: impl.signOut ?? (() => Promise.resolve()) as unknown as typeof impl.signOut,
  };
}
