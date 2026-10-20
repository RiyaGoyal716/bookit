import { distanceKm, LEEDS, type ResolvedLocation } from './gateMachine';

/**
 * UK postcode validation + a mock Leeds address search for the manual-entry
 * fallback (Apple guideline 5.1.1 — never force GPS). No network: a small
 * fixture of Leeds (LS) postcodes maps to neighbourhoods near the service
 * centre, with a couple of out-of-area examples to exercise that branch.
 */

/** Official-ish UK postcode regex (outward + inward), case/space tolerant. */
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export function isValidUKPostcode(raw: string): boolean {
  return UK_POSTCODE.test(raw.trim());
}

/** Normalise to upper-case with a single space before the inward code. */
export function normalisePostcode(raw: string): string {
  const compact = raw.replace(/\s+/g, '').toUpperCase();
  if (compact.length < 5) return compact;
  return `${compact.slice(0, compact.length - 3)} ${compact.slice(-3)}`;
}

interface PostcodeFixture {
  prefix: string;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
}

const FIXTURES: PostcodeFixture[] = [
  { prefix: 'LS6', area: 'Headingley', city: 'Leeds', latitude: 53.8176, longitude: -1.5806 },
  { prefix: 'LS1', area: 'City Centre', city: 'Leeds', latitude: 53.7965, longitude: -1.5478 },
  { prefix: 'LS2', area: 'Woodhouse', city: 'Leeds', latitude: 53.8056, longitude: -1.5522 },
  { prefix: 'LS4', area: 'Burley', city: 'Leeds', latitude: 53.8085, longitude: -1.586 },
  { prefix: 'LS7', area: 'Chapeltown', city: 'Leeds', latitude: 53.8232, longitude: -1.5361 },
  { prefix: 'LS11', area: 'Beeston', city: 'Leeds', latitude: 53.7756, longitude: -1.5614 },
  // Out of area examples (> 25 km) to exercise the gate's outOfArea branch.
  { prefix: 'M1', area: 'City Centre', city: 'Manchester', latitude: 53.4794, longitude: -2.2453 },
  { prefix: 'EC1', area: 'Clerkenwell', city: 'London', latitude: 51.5225, longitude: -0.1037 },
];

/**
 * Mock lookup: match the postcode's outward prefix to a fixture. Returns a
 * fully resolved location (with distance from Leeds) or null if unknown.
 */
export function searchPostcode(raw: string): ResolvedLocation | null {
  if (!isValidUKPostcode(raw)) return null;
  const normalised = normalisePostcode(raw);
  const outward = normalised.split(' ')[0];
  // Longest-prefix match so LS11 beats LS1.
  const match = [...FIXTURES]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((f) => outward.startsWith(f.prefix));
  if (!match) {
    // Unknown LS postcode -> treat as central Leeds.
    if (outward.startsWith('LS')) {
      return {
        label: `Leeds (${normalised})`,
        city: 'Leeds',
        postcode: normalised,
        latitude: LEEDS.latitude,
        longitude: LEEDS.longitude,
        distanceKm: 0,
        source: 'manual',
      };
    }
    return null;
  }
  const point = { latitude: match.latitude, longitude: match.longitude };
  return {
    label: `${match.area}, ${match.city}`,
    city: match.city,
    postcode: normalised,
    latitude: match.latitude,
    longitude: match.longitude,
    distanceKm: distanceKm(point, LEEDS),
    source: 'manual',
  };
}
