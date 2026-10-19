import { useCartStore } from '../src/stores/cartStore';
import { formatMoney } from '../src/i18n/regions';

/**
 * NOVA v3 basket flow: the ServiceCard "+" / stepper and the BookingBar all read
 * and write this store. These cover add / increment / decrement, the count +
 * total surfaced to the BookingBar, the `add_to_basket` analytics event, and the
 * price formatting the ServiceCard renders via useMoney (GBP).
 */

const svc = {
  key: 'deep-clean',
  providerId: 'p1',
  providerName: 'Sparkle Co',
  name: 'Deep clean',
  price: 45,
  durationMin: 150,
};

beforeEach(() => {
  useCartStore.getState().clear();
});

describe('basket add / increment / decrement', () => {
  it('adds a service and increments on re-add', () => {
    const { addItem } = useCartStore.getState();
    addItem(svc);
    addItem(svc);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('surfaces count + total for the BookingBar', () => {
    const { addItem } = useCartStore.getState();
    addItem(svc); // 45
    addItem({ ...svc, key: 'oven', name: 'Oven clean', price: 48 }); // 93
    const count = useCartStore.getState().items.reduce((n, i) => n + i.quantity, 0);
    expect(count).toBe(2);
    // subtotal 93 + 12% fee (round(11.16)=11) = 104
    expect(useCartStore.getState().breakdown().total).toBe(104);
  });

  it('decrements and removes the service at zero', () => {
    const { addItem, decrement } = useCartStore.getState();
    addItem(svc);
    addItem(svc);
    decrement('deep-clean');
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    decrement('deep-clean');
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().providerId).toBeNull();
  });

  it('fires the add_to_basket analytics event', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    useCartStore.getState().addItem(svc);
    const fired = spy.mock.calls.some((c) => String(c[0]).includes('add_to_basket'));
    expect(fired).toBe(true);
    spy.mockRestore();
  });
});

describe('ServiceCard price formatting', () => {
  it('formats the price and struck-out old price in GBP', () => {
    expect(formatMoney(45, 'GBP')).toBe('£45');
    expect(formatMoney(60, 'GBP')).toBe('£60');
    expect(formatMoney(1200, 'GBP')).toBe('£1,200');
  });
});
