import { create } from 'zustand';

export type BookingStatus = 'Requested' | 'Accepted' | 'Completed';

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
}

/**
 * In-memory bookings store, seeded with three demo bookings. Persists for the
 * session only.
 */
export const useBookingsStore = create<BookingsState>((set) => ({
  bookings: seededBookings,
  addBooking: (booking: Booking) => set((state) => ({ bookings: [booking, ...state.bookings] })),
}));
