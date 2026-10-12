import {
  ADD_ONS,
  CART_PROMO_CODE,
  addOnsSubtotal,
  computeCart,
  itemsSubtotal,
  useCartStore,
  type CartItem,
} from '../src/stores/cartStore';

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    key: 'svc',
    providerId: 'p1',
    providerName: 'Test Provider',
    name: 'Deep clean',
    price: 45,
    durationMin: 150,
    quantity: 1,
    ...overrides,
  };
}

beforeEach(() => {
  useCartStore.getState().clear();
});

describe('cart math helpers', () => {
  it('sums service units by price × quantity', () => {
    expect(
      itemsSubtotal([item({ price: 45, quantity: 2 }), item({ key: 'b', price: 18, quantity: 1 })]),
    ).toBe(108);
  });

  it('sums selected add-on prices', () => {
    const ids = ADD_ONS.slice(0, 2).map((a) => a.id);
    const expected = ADD_ONS.slice(0, 2).reduce((n, a) => n + a.price, 0);
    expect(addOnsSubtotal(ids)).toBe(expected);
  });
});

describe('computeCart', () => {
  it('applies a 12% platform fee on the subtotal', () => {
    const b = computeCart({
      items: [item({ price: 45, quantity: 1 })],
      addOnIds: [],
      tip: 0,
      promoApplied: false,
    });
    expect(b.subtotal).toBe(45);
    expect(b.fee).toBe(5); // round(45 * 0.12) = 5
    expect(b.total).toBe(50);
    expect(b.itemCount).toBe(1);
  });

  it('includes add-ons in the subtotal and fee', () => {
    const addOnId = ADD_ONS[0].id; // 10
    const b = computeCart({
      items: [item({ price: 45, quantity: 1 })],
      addOnIds: [addOnId],
      tip: 0,
      promoApplied: false,
    });
    expect(b.subtotal).toBe(55);
    expect(b.fee).toBe(7); // round(55 * 0.12) = 6.6 -> 7
    expect(b.total).toBe(62);
  });

  it('applies a 10% promo discount and adds the tip on top', () => {
    const b = computeCart({
      items: [item({ price: 50, quantity: 2 })],
      addOnIds: [],
      tip: 5,
      promoApplied: true,
    });
    // subtotal 100, fee 12, discount 10, tip 5 => 100 + 12 + 5 - 10 = 107
    expect(b.subtotal).toBe(100);
    expect(b.fee).toBe(12);
    expect(b.discount).toBe(10);
    expect(b.tip).toBe(5);
    expect(b.total).toBe(107);
    expect(b.itemCount).toBe(2);
  });
});

describe('cart store actions', () => {
  it('adds an item then increments its quantity', () => {
    const add = useCartStore.getState().addItem;
    add({
      key: 'deep',
      providerId: 'p1',
      providerName: 'P1',
      name: 'Deep clean',
      price: 45,
      durationMin: 150,
    });
    add({
      key: 'deep',
      providerId: 'p1',
      providerName: 'P1',
      name: 'Deep clean',
      price: 45,
      durationMin: 150,
    });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
    expect(useCartStore.getState().breakdown().total).toBe(90 + 11); // 90 + round(90*0.12)=11 => 101
  });

  it('resets the cart when adding a different provider', () => {
    const add = useCartStore.getState().addItem;
    add({ key: 'a', providerId: 'p1', providerName: 'P1', name: 'A', price: 20, durationMin: 60 });
    add({ key: 'b', providerId: 'p2', providerName: 'P2', name: 'B', price: 30, durationMin: 60 });
    const state = useCartStore.getState();
    expect(state.providerId).toBe('p2');
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe('B');
  });

  it('decrementing to zero removes the item and empties the cart', () => {
    const { addItem } = useCartStore.getState();
    addItem({
      key: 'a',
      providerId: 'p1',
      providerName: 'P1',
      name: 'A',
      price: 20,
      durationMin: 60,
    });
    useCartStore.getState().decrement('a');
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.providerId).toBeNull();
  });

  it('applies a valid promo and rejects an invalid one', () => {
    const { addItem } = useCartStore.getState();
    addItem({
      key: 'a',
      providerId: 'p1',
      providerName: 'P1',
      name: 'A',
      price: 100,
      durationMin: 60,
    });
    expect(useCartStore.getState().applyPromo('nope')).toBe(false);
    expect(useCartStore.getState().promoApplied).toBe(false);
    expect(useCartStore.getState().applyPromo(CART_PROMO_CODE.toLowerCase())).toBe(true);
    const b = useCartStore.getState().breakdown();
    expect(b.discount).toBe(10); // 10% of 100
    expect(b.total).toBe(100 + 12 - 10);
  });
});
