import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import * as authApi from '../api/authApi';

// Module-level guard — ensures initializeAuth() fires once per app load,
// even though useAuth() may be called from several components at once.
let hasInitialized = false;

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const commitLogin = useAuthStore((state) => state.login);
  const commitLogout = useAuthStore((state) => state.logout);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    if (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) return;
    if (!hasInitialized) {
      hasInitialized = true;
      initializeAuth();
    }
  }, [initializeAuth]);

  const login = useCallback(
    async (email, password) => {
      const { data } = await authApi.login({ email, password });
      const { user: loggedInUser, accessToken } = data.data;
      commitLogin(loggedInUser, accessToken);
      return loggedInUser;
    },
    [commitLogin]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await authApi.register(payload);
      const { user: newUser, accessToken } = data.data;
      commitLogin(newUser, accessToken);
      return newUser;
    },
    [commitLogin]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Server call failed — still clear local session below.
    } finally {
      commitLogout();
    }
  }, [commitLogout]);

  return {
    user,
    isAuthenticated,
    isInitializing,
    login,
    register,
    logout,
  };
}