import { create } from 'zustand';

export interface Address {
  id: string;
  /** Short label, e.g. "Home" or "Work". */
  label: string;
  /** Full address line. */
  line: string;
  /** True for an address captured from the device's current location. */
  fromLocation?: boolean;
}

const seeded: Address[] = [
  { id: 'a1', label: 'Home', line: '12 Cardigan Road, Headingley, LS6 1LJ' },
  { id: 'a2', label: 'Work', line: '1 City Square, Leeds, LS1 2ES' },
];

interface AddressState {
  addresses: Address[];
  add: (input: Omit<Address, 'id'>) => Address;
  remove: (id: string) => void;
}

/** Saved-addresses store (session-only), seeded with Home and Work. */
export const useAddressStore = create<AddressState>((set) => ({
  addresses: seeded,
  add: (input) => {
    const address: Address = { ...input, id: `a${Date.now()}` };
    set((state) => ({ addresses: [...state.addresses, address] }));
    return address;
  },
  remove: (id: string) =>
    set((state) => ({ addresses: state.addresses.filter((a) => a.id !== id) })),
}));
