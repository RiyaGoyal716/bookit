import {
  computeFees,
  generateBookingId,
  nextStatus,
  useBookingsStore,
  type Booking,
} from '../src/stores/bookingsStore';

function makeBooking(id: string, overrides: Partial<Booking> = {}): Booking {
  return {
    id,
    providerId: 'p1',
    providerName: 'Test Provider',
    serviceName: 'Test service',
    date: 'Mon 6 Oct',
    time: '09:00',
    price: 45,
    fee: 5,
    total: 50,
    status: 'Requested',
    ...overrides,
  };
}

describe('computeFees', () => {
  it('computes a 12% platform fee and total', () => {
    expect(computeFees(45)).toEqual({ fee: 5, total: 50 });
    expect(computeFees(25)).toEqual({ fee: 3, total: 28 });
  });
});

describe('generateBookingId', () => {
  it('produces a BK-prefixed reference', () => {
    expect(generateBookingId()).toMatch(/^BK-[A-Z0-9]{6}$/);
  });
});

describe('bookings store', () => {
  it('adds a booking to the front with Requested status', () => {
    const before = useBookingsStore.getState().bookings.length;
    const booking: Booking = {
      id: 'BK-TEST01',
      providerId: 'p1',
      providerName: 'Test Provider',
      serviceName: 'Test service',
      date: 'Mon 6 Oct',
      time: '09:00',
      price: 45,
      fee: 5,
      total: 50,
      status: 'Requested',
    };

    useBookingsStore.getState().addBooking(booking);

    const { bookings } = useBookingsStore.getState();
    expect(bookings.length).toBe(before + 1);
    expect(bookings[0]).toEqual(booking);
    expect(bookings[0]?.status).toBe('Requested');
  });

  it('cancels a booking by id, leaving others untouched', () => {
    useBookingsStore.getState().addBooking(makeBooking('BK-CANCEL'));
    useBookingsStore.getState().addBooking(makeBooking('BK-KEEP'));

    useBookingsStore.getState().cancelBooking('BK-CANCEL');

    const state = useBookingsStore.getState();
    expect(state.getById('BK-CANCEL')?.status).toBe('Cancelled');
    expect(state.getById('BK-KEEP')?.status).toBe('Requested');
  });

  it('reschedules a booking date and time without changing status', () => {
    useBookingsStore.getState().addBooking(makeBooking('BK-RESCH', { status: 'Accepted' }));

    useBookingsStore.getState().rescheduleBooking('BK-RESCH', 'Fri 10 Oct', '17:00');

    const b = useBookingsStore.getState().getById('BK-RESCH');
    expect(b?.date).toBe('Fri 10 Oct');
    expect(b?.time).toBe('17:00');
    expect(b?.status).toBe('Accepted');
  });

  it('advances status through the lifecycle and stops at Completed', () => {
    useBookingsStore.getState().addBooking(makeBooking('BK-ADV'));
    const advance = () => useBookingsStore.getState().advanceStatus('BK-ADV');
    const status = () => useBookingsStore.getState().getById('BK-ADV')?.status;

    advance();
    expect(status()).toBe('Accepted');
    advance();
    expect(status()).toBe('On the way');
    advance();
    expect(status()).toBe('Completed');
    advance();
    expect(status()).toBe('Completed');
  });
});

describe('nextStatus', () => {
  it('returns the next lifecycle step, or null at the end', () => {
    expect(nextStatus('Requested')).toBe('Accepted');
    expect(nextStatus('Accepted')).toBe('On the way');
    expect(nextStatus('On the way')).toBe('Completed');
    expect(nextStatus('Completed')).toBeNull();
    expect(nextStatus('Cancelled')).toBeNull();
  });
});
