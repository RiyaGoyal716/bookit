import { create } from 'zustand';

import { track } from '../lib/analytics';
import { PLATFORM_FEE_RATE } from './bookingsStore';

/** Promo code accepted by the cart (10% off the service subtotal). */
export const CART_PROMO_CODE = 'BOOKIT10';
export const CART_PROMO_RATE = 0.1;

export interface CartItem {
  /** Stable key, unique per service within a provider. */
  key: string;
  providerId: string;
  providerName: string;
  name: string;
  /** Unit price in whole GBP. */
  price: number;
  durationMin: number;
  quantity: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

/** Optional add-ons that can be attached to a cart. */
export const ADD_ONS: AddOn[] = [
  { id: 'inside-windows', name: 'Inside windows', price: 10 },
  { id: 'inside-oven', name: 'Inside oven', price: 15 },
  { id: 'ironing', name: 'Ironing (30 min)', price: 8 },
];

export interface CartBreakdown {
  /** Services + add-ons, before fee/discount. */
  subtotal: number;
  /** 12% platform fee on the subtotal. */
  fee: number;
  /** Promo discount (applied to subtotal). */
  discount: number;
  /** Optional tip. */
  tip: number;
  /** subtotal + fee + tip - discount. */
  total: number;
  /** Total number of service units in the cart. */
  itemCount: number;
}

export interface CartInput {
  items: CartItem[];
  addOnIds: string[];
  tip: number;
  promoApplied: boolean;
}

/** Sum of service units: price × quantity. */
export function itemsSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/** Sum of selected add-on prices. */
export function addOnsSubtotal(addOnIds: string[]): number {
  return ADD_ONS.filter((a) => addOnIds.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
}

/**
 * Pure price breakdown for a cart. Fee is 12% of the subtotal (services +
 * add-ons); discount is 10% of the subtotal when a promo is applied; tip is
 * added on top. Keeps the booking total consistent with bookingsStore fees.
 */
export function computeCart(input: CartInput): CartBreakdown {
  const subtotal = itemsSubtotal(input.items) + addOnsSubtotal(input.addOnIds);
  const fee = Math.round(subtotal * PLATFORM_FEE_RATE);
  const discount = input.promoApplied ? Math.round(subtotal * CART_PROMO_RATE) : 0;
  const tip = Math.max(0, Math.round(input.tip));
  const total = subtotal + fee + tip - discount;
  const itemCount = input.items.reduce((n, i) => n + i.quantity, 0);
  return { subtotal, fee, discount, tip, total, itemCount };
}

interface CartState {
  providerId: string | null;
  providerName: string | null;
  items: CartItem[];
  addOnIds: string[];
  tip: number;
  promoApplied: boolean;
  /** Add one unit of a service (clears the cart if a different provider). */
  addItem: (input: Omit<CartItem, 'quantity' | 'key'> & { key?: string }) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  toggleAddOn: (id: string) => void;
  setTip: (tip: number) => void;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
  clear: () => void;
  /** Current price breakdown. */
  breakdown: () => CartBreakdown;
}

/** Session-only cart. Holds items for a single provider at a time. */
export const useCartStore = create<CartState>((set, get) => ({
  providerId: null,
  providerName: null,
  items: [],
  addOnIds: [],
  tip: 0,
  promoApplied: false,

  addItem: (input) => {
    const key = input.key ?? input.name;
    set((state) => {
      // Switching provider resets the cart.
      const sameProvider = state.providerId === null || state.providerId === input.providerId;
      const baseItems = sameProvider ? state.items : [];
      const existing = baseItems.find((i) => i.key === key);
      track('cart_add', { providerId: input.providerId, service: input.name });
      if (existing) {
        return {
          providerId: input.providerId,
          providerName: input.providerName,
          items: baseItems.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i)),
          addOnIds: sameProvider ? state.addOnIds : [],
          tip: sameProvider ? state.tip : 0,
          promoApplied: sameProvider ? state.promoApplied : false,
        };
      }
      const item: CartItem = {
        key,
        providerId: input.providerId,
        providerName: input.providerName,
        name: input.name,
        price: input.price,
        durationMin: input.durationMin,
        quantity: 1,
      };
      return {
        providerId: input.providerId,
        providerName: input.providerName,
        items: [...baseItems, item],
        addOnIds: sameProvider ? state.addOnIds : [],
        tip: sameProvider ? state.tip : 0,
        promoApplied: sameProvider ? state.promoApplied : false,
      };
    });
  },

  removeItem: (key) =>
    set((state) => {
      const items = state.items.filter((i) => i.key !== key);
      return items.length === 0
        ? { items, providerId: null, providerName: null, addOnIds: [], promoApplied: false, tip: 0 }
        : { items };
    }),

  setQuantity: (key, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        const items = state.items.filter((i) => i.key !== key);
        return items.length === 0
          ? {
              items,
              providerId: null,
              providerName: null,
              addOnIds: [],
              promoApplied: false,
              tip: 0,
            }
          : { items };
      }
      return { items: state.items.map((i) => (i.key === key ? { ...i, quantity } : i)) };
    }),

  increment: (key) =>
    get().setQuantity(key, (get().items.find((i) => i.key === key)?.quantity ?? 0) + 1),
  decrement: (key) =>
    get().setQuantity(key, (get().items.find((i) => i.key === key)?.quantity ?? 0) - 1),

  toggleAddOn: (id) =>
    set((state) => ({
      addOnIds: state.addOnIds.includes(id)
        ? state.addOnIds.filter((x) => x !== id)
        : [...state.addOnIds, id],
    })),

  setTip: (tip) => set({ tip: Math.max(0, Math.round(tip)) }),

  applyPromo: (code) => {
    const ok = code.trim().toUpperCase() === CART_PROMO_CODE;
    if (ok) track('apply_promo', { code: CART_PROMO_CODE, from: 'cart' });
    set({ promoApplied: ok });
    return ok;
  },

  clearPromo: () => set({ promoApplied: false }),

  clear: () =>
    set({
      providerId: null,
      providerName: null,
      items: [],
      addOnIds: [],
      tip: 0,
      promoApplied: false,
    }),

  breakdown: () => {
    const s = get();
    return computeCart({
      items: s.items,
      addOnIds: s.addOnIds,
      tip: s.tip,
      promoApplied: s.promoApplied,
    });
  },
}));
