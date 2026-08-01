import { create } from 'zustand';
import axiosInstance from '../api/axiosConfig';

export const useAuthStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────────────────
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  // ── Actions ──────────────────────────────────────────────────────────
  login: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),

  setAccessToken: (accessToken) =>
    set({
      accessToken,
      isAuthenticated: Boolean(accessToken),
    }),

  setUser: (user) => set({ user }),

  initializeAuth: async () => {
    try {
      const { data } = await axiosInstance.post('/auth/refresh');
      const { accessToken, user } = data.data;

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isInitializing: false,
      });
    } catch {
      // No valid refresh cookie — user is simply not logged in.
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },

  // ── Selectors (convenience getters, not reactive on their own) ─────────
  hasRole: (role) => get().user?.role === role,
}));