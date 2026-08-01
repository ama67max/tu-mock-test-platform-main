import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // ── State ────────────────────────────────────────────────────────────
  activeModal: null,
  modalProps: {},
  isGlobalLoading: false,
  isSidebarCollapsed: false,

  // ── Modal Actions ────────────────────────────────────────────────────
  openModal: (modalId, props = {}) =>
    set({
      activeModal: modalId,
      modalProps: props,
    }),

  closeModal: () =>
    set({
      activeModal: null,
      modalProps: {},
    }),

  // ── Loading Overlay ──────────────────────────────────────────────────
  setGlobalLoading: (isLoading) => set({ isGlobalLoading: isLoading }),

  // ── Sidebar ──────────────────────────────────────────────────────────
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
}));