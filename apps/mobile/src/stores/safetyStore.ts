import { create } from 'zustand';

import { track } from '../lib/analytics';

export type AccountStatus = 'active' | 'under_review' | 'restricted';

export type ViolationSeverity = 'notice' | 'warning' | 'strike';

export interface Violation {
  id: string;
  severity: ViolationSeverity;
  title: string;
  reason: string;
  detail: string;
  date: string;
  acknowledged: boolean;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
}

const seededViolations: Violation[] = [
  {
    id: 'V-301',
    severity: 'warning',
    title: 'Late cancellation',
    reason: 'A booking was cancelled under 24 hours before the appointment.',
    detail:
      'Repeated late cancellations affect pros and may limit your account. Please cancel earlier where possible. If this was a mistake, you can appeal.',
    date: '7 Oct 2026',
    acknowledged: false,
  },
];

interface SafetyState {
  accountStatus: AccountStatus;
  violations: Violation[];
  trustedContacts: TrustedContact[];
  appealSubmitted: boolean;
  acknowledge: (id: string) => void;
  addContact: (name: string, phone: string) => void;
  removeContact: (id: string) => void;
  submitAppeal: () => void;
  setAccountStatus: (status: AccountStatus) => void;
}

export const useSafetyStore = create<SafetyState>((set) => ({
  accountStatus: 'active',
  violations: seededViolations,
  trustedContacts: [{ id: 'tc1', name: 'Mum', phone: '+44 7700 900111' }],
  appealSubmitted: false,
  acknowledge: (id) =>
    set((s) => ({
      violations: s.violations.map((v) => (v.id === id ? { ...v, acknowledged: true } : v)),
    })),
  addContact: (name, phone) =>
    set((s) => ({
      trustedContacts: [...s.trustedContacts, { id: `tc${Date.now()}`, name, phone }],
    })),
  removeContact: (id) =>
    set((s) => ({ trustedContacts: s.trustedContacts.filter((c) => c.id !== id) })),
  submitAppeal: () => {
    track('submit_appeal');
    set({ appealSubmitted: true });
  },
  setAccountStatus: (accountStatus) => set({ accountStatus }),
}));
