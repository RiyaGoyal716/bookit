import { create } from 'zustand';

export interface AuthUser {
  name: string;
  phone: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Mock login — stores the E.164 phone plus a demo name. */
  login: (phone: string) => void;
  logout: () => void;
}

/**
 * In-memory auth store (no persistence). Session-only for the demo.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (phone: string) =>
    set({
      user: { name: 'Alex', phone },
      isAuthenticated: true,
    }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
