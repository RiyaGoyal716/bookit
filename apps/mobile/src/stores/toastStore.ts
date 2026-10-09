import { create } from 'zustand';

export interface ToastState {
  message: string | null;
  /** Monotonic id so repeated identical messages still re-trigger the host. */
  token: number;
  show: (message: string) => void;
  clear: () => void;
}

/**
 * Tiny global toast channel. Call `useToastStore.getState().show('…')` from
 * anywhere; the `<ToastHost />` mounted in the root layout renders it.
 */
export const useToastStore = create<ToastState>((set) => ({
  message: null,
  token: 0,
  show: (message: string) => set((s) => ({ message, token: s.token + 1 })),
  clear: () => set({ message: null }),
}));

/** Imperative helper for non-hook call sites. */
export function showToast(message: string): void {
  useToastStore.getState().show(message);
}
