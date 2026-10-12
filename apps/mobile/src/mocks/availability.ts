/**
 * Deterministic mock availability derived from a provider id.
 *
 * No backend — we hash the id so each provider has a stable "available today"
 * flag, a next free slot, and a per-day set of open/booked time slots that
 * don't change between renders.
 */
export interface Availability {
  availableToday: boolean;
  /** Next free slot label, e.g. "Today 15:00" or "Tomorrow 09:00". */
  nextSlot: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export const TIME_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];

function hash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getAvailability(providerId: string): Availability {
  const h = hash(providerId);
  const availableToday = h % 3 !== 0; // ~2/3 of providers are free today
  const slot = TIME_SLOTS[h % 5];
  return {
    availableToday,
    nextSlot: availableToday ? `Today ${slot}` : `Tomorrow ${slot}`,
  };
}

/**
 * Stable open/booked slots for a given provider on a given day offset.
 * `dayOffset` 0 = today, 1 = tomorrow, etc. Earlier days have more booked
 * slots; some slots in the past (today) are greyed as unavailable.
 */
export function getSlotsForDay(providerId: string, dayOffset: number): TimeSlot[] {
  const h = hash(`${providerId}:${dayOffset}`);
  return TIME_SLOTS.map((time, i) => {
    // Deterministic pseudo-random availability per slot.
    const bit = (h >> i) & 1;
    const busyBit = (h >> (i + 3)) & 1;
    const available = dayOffset === 0 ? bit === 1 && busyBit === 1 : bit === 1 || busyBit === 1;
    return { time, available };
  });
}

/** Whether the provider has any open slot on the given day offset. */
export function hasOpenSlot(providerId: string, dayOffset: number): boolean {
  return getSlotsForDay(providerId, dayOffset).some((s) => s.available);
}
