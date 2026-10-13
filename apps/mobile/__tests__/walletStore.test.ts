import {
  transactionsBalance,
  useWalletStore,
  type WalletTransaction,
} from '../src/stores/walletStore';

function txn(overrides: Partial<WalletTransaction> = {}): WalletTransaction {
  return {
    id: 't',
    type: 'credit',
    label: 'Test',
    amount: 10,
    date: '1 Oct 2026',
    ...overrides,
  };
}

describe('walletStore', () => {
  it('nets credits and debits in transactionsBalance', () => {
    const txns = [
      txn({ id: 'a', type: 'credit', amount: 10 }),
      txn({ id: 'b', type: 'credit', amount: 5 }),
      txn({ id: 'c', type: 'debit', amount: 8 }),
    ];
    expect(transactionsBalance(txns)).toBe(7);
  });

  it('returns 0 for an empty wallet', () => {
    expect(transactionsBalance([])).toBe(0);
  });

  it('seeded balance equals the net of seeded transactions', () => {
    const { transactions, balance } = useWalletStore.getState();
    expect(balance()).toBe(transactionsBalance(transactions));
  });

  it('credit increases the balance', () => {
    const before = useWalletStore.getState().balance();
    useWalletStore.getState().credit('Bonus', 20);
    expect(useWalletStore.getState().balance()).toBe(before + 20);
  });

  it('debit succeeds when funds are available and fails otherwise', () => {
    const balance = useWalletStore.getState().balance();
    const ok = useWalletStore.getState().debit('Booking', balance);
    expect(ok).toBe(true);
    expect(useWalletStore.getState().balance()).toBe(0);
    const fail = useWalletStore.getState().debit('Overdraw', 5);
    expect(fail).toBe(false);
    expect(useWalletStore.getState().balance()).toBe(0);
  });
});
