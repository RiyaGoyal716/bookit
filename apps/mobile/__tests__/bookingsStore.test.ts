import {
  computeFees,
  generateBookingId,
  useBookingsStore,
  type Booking,
} from '../src/stores/bookingsStore';

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
});
