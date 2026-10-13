import { create } from 'zustand';

export interface AuthUser {
  name: string;
  phone: string;
  email?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Mock login — stores the E.164 phone plus a demo name. */
  login: (phone: string) => void;
  /** Patch the signed-in user's profile fields. */
  updateProfile: (patch: Partial<AuthUser>) => void;
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
      user: { name: 'Alex', phone, email: 'alex@example.com' },
      isAuthenticated: true,
    }),
  updateProfile: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : {})),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
