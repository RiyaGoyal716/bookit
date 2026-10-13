import { create } from 'zustand';

import { track } from '../lib/analytics';

export type TransactionType = 'credit' | 'debit';

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  /** Human label, e.g. "Referral bonus" or "Deep clean booking". */
  label: string;
  /** Positive amount in whole GBP (sign comes from `type`). */
  amount: number;
  /** Human-readable date, e.g. "6 Oct 2026". */
  date: string;
}

const seeded: WalletTransaction[] = [
  { id: 't1', type: 'credit', label: 'Welcome credit', amount: 10, date: '1 Oct 2026' },
  { id: 't2', type: 'credit', label: 'Referral bonus — Priya', amount: 5, date: '4 Oct 2026' },
  { id: 't3', type: 'debit', label: 'Cut & beard trim', amount: 8, date: '6 Oct 2026' },
  { id: 't4', type: 'credit', label: 'Refund — cancelled clean', amount: 12, date: '9 Oct 2026' },
];

/**
 * Pure net balance for a list of transactions: credits add, debits subtract.
 * Exported for unit testing and for deriving the displayed balance.
 */
export function transactionsBalance(txns: WalletTransaction[]): number {
  return txns.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);
}

interface WalletState {
  transactions: WalletTransaction[];
  /** Current spendable balance (derived from transactions). */
  balance: () => number;
  credit: (label: string, amount: number) => void;
  debit: (label: string, amount: number) => boolean;
}

function today(): string {
  const d = new Date();
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

/** Mock Bookit wallet (session-only), seeded with a few transactions. */
export const useWalletStore = create<WalletState>((set, get) => ({
  transactions: seeded,
  balance: () => transactionsBalance(get().transactions),
  credit: (label, amount) => {
    track('wallet_credit', { amount });
    set((s) => ({
      transactions: [
        { id: `t${Date.now()}`, type: 'credit', label, amount: Math.round(amount), date: today() },
        ...s.transactions,
      ],
    }));
  },
  debit: (label, amount) => {
    const amt = Math.round(amount);
    if (get().balance() < amt) return false;
    track('wallet_debit', { amount: amt });
    set((s) => ({
      transactions: [
        { id: `t${Date.now()}`, type: 'debit', label, amount: amt, date: today() },
        ...s.transactions,
      ],
    }));
    return true;
  },
}));
