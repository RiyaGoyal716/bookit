/**
 * Deterministic mock availability derived from a provider id.
 *
 * No backend — we hash the id so each provider has a stable "available today"
 * flag and a next free slot that doesn't change between renders.
 */
export interface Availability {
  availableToday: boolean;
  /** Next free slot label, e.g. "Today 15:00" or "Tomorrow 09:00". */
  nextSlot: string;
}

const SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00'];

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
  const slot = SLOTS[h % SLOTS.length];
  return {
    availableToday,
    nextSlot: availableToday ? `Today ${slot}` : `Tomorrow ${slot}`,
  };
}
