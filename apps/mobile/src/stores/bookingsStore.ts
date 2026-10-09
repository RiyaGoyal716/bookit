import { create } from 'zustand';

import { track } from '../lib/analytics';

export type BookingStatus = 'Requested' | 'Accepted' | 'On the way' | 'Completed' | 'Cancelled';

/** Ordered lifecycle used for the status timeline and "advance" action. */
export const BOOKING_TIMELINE: readonly BookingStatus[] = [
  'Requested',
  'Accepted',
  'On the way',
  'Completed',
];

/** The next status in the lifecycle, or null if already complete/cancelled. */
export function nextStatus(status: BookingStatus): BookingStatus | null {
  const i = BOOKING_TIMELINE.indexOf(status);
  if (i === -1 || i >= BOOKING_TIMELINE.length - 1) return null;
  return BOOKING_TIMELINE[i + 1];
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  /** Human-readable date, e.g. "Thu 9 Oct". */
  date: string;
  /** Time slot, e.g. "11:00". */
  time: string;
  /** Service price in whole GBP. */
  price: number;
  /** Platform fee (12% of price), in GBP. */
  fee: number;
  /** price + fee, in GBP. */
  total: number;
  status: BookingStatus;
}

/** Platform fee rate applied to every booking. */
export const PLATFORM_FEE_RATE = 0.12;

/** Compute the 12% platform fee and total for a given service price. */
export function computeFees(price: number): { fee: number; total: number } {
  const fee = Math.round(price * PLATFORM_FEE_RATE);
  return { fee, total: price + fee };
}

/** Generate a short, human-friendly booking id, e.g. "BK-4F9K2A". */
export function generateBookingId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `BK-${code}`;
}

const seededBookings: Booking[] = [
  {
    id: 'BK-7HG2QW',
    providerId: 'p5',
    providerName: 'Headingley Barber Co',
    serviceName: 'Cut & beard trim',
    date: 'Mon 6 Oct',
    time: '11:00',
    price: 25,
    fee: 3,
    total: 28,
    status: 'Completed',
  },
  {
    id: 'BK-3KD8PL',
    providerId: 'p1',
    providerName: 'Hyde Park Home Cleaning',
    serviceName: 'Deep clean',
    date: 'Wed 8 Oct',
    time: '09:00',
    price: 45,
    fee: 5,
    total: 50,
    status: 'Accepted',
  },
  {
    id: 'BK-9MF4RT',
    providerId: 'p9',
    providerName: 'LS6 Maths Tutor',
    serviceName: 'GCSE maths (1 hr)',
    date: 'Fri 10 Oct',
    time: '15:00',
    price: 28,
    fee: 3,
    total: 31,
    status: 'Requested',
  },
];

interface BookingsState {
  bookings: Booking[];
  /** Prepend a new booking (newest first). */
  addBooking: (booking: Booking) => void;
  /** Look up a booking by id. */
  getById: (id: string) => Booking | undefined;
  /** Mark a booking as Cancelled. */
  cancelBooking: (id: string) => void;
  /** Change the date/time of a booking (reschedule). */
  rescheduleBooking: (id: string, date: string, time: string) => void;
  /** Advance a booking to the next status in the lifecycle. */
  advanceStatus: (id: string) => void;
}

/**
 * In-memory bookings store, seeded with three demo bookings. Persists for the
 * session only.
 */
export const useBookingsStore = create<BookingsState>((set, get) => ({
  bookings: seededBookings,
  addBooking: (booking: Booking) => set((state) => ({ bookings: [booking, ...state.bookings] })),
  getById: (id: string) => get().bookings.find((b) => b.id === id),
  cancelBooking: (id: string) => {
    track('cancel_booking', { bookingId: id });
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b)),
    }));
  },
  rescheduleBooking: (id: string, date: string, time: string) => {
    track('reschedule_booking', { bookingId: id, date, time });
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? { ...b, date, time } : b)),
    }));
  },
  advanceStatus: (id: string) =>
    set((state) => ({
      bookings: state.bookings.map((b) => {
        if (b.id !== id) return b;
        const next = nextStatus(b.status);
        return next ? { ...b, status: next } : b;
      }),
    })),
}));
