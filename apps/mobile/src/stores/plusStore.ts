import { create } from 'zustand';

import { track } from '../lib/analytics';

export type PlusPlan = 'monthly' | 'yearly';

/** Monthly/yearly price in whole GBP. */
export const PLUS_PRICE: Record<PlusPlan, number> = { monthly: 7, yearly: 59 };

interface PlusState {
  subscribed: boolean;
  plan: PlusPlan;
  /** Renewal date label when subscribed. */
  renewsOn: string | null;
  subscribe: (plan: PlusPlan) => void;
  cancel: () => void;
}

function renewalLabel(plan: PlusPlan): string {
  const d = new Date();
  if (plan === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

/** Mock Bookit Plus membership (session-only). */
export const usePlusStore = create<PlusState>((set) => ({
  subscribed: false,
  plan: 'monthly',
  renewsOn: null,
  subscribe: (plan) => {
    track('plus_subscribe', { plan });
    set({ subscribed: true, plan, renewsOn: renewalLabel(plan) });
  },
  cancel: () => {
    track('plus_cancel');
    set({ subscribed: false, renewsOn: null });
  },
}));
