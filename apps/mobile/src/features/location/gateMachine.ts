/**
 * Location gate state machine — a PURE REDUCER (no side effects, no imports of
 * expo-location). The gate screen owns the async side effects (permission
 * request, getCurrentPositionAsync, reverseGeocodeAsync, Linking) and feeds
 * their results back as events; this module decides the next UI state.
 *
 * Keeping it pure makes every branch unit-testable:
 *   granted -> locating -> resolving -> success
 *   denied (can ask again)         -> asks again
 *   denied (cannot ask again)      -> blocked (Open Settings)
 *   services off                   -> servicesOff (Turn on location)
 *   position timeout / error       -> timeout (Try again)
 *   manual postcode confirmed      -> manual
 *   resolved but out of service    -> outOfArea
 *   permission revoked on resume   -> re-check, gate shown again
 */

/** Service-area centre (mock): Leeds city centre. */
export const LEEDS = { latitude: 53.7997, longitude: -1.5492 } as const;

/** Max distance from Leeds we treat as "in service" (km). */
export const SERVICE_RADIUS_KM = 25;

export type GateStatus =
  | 'idle'
  | 'requesting'
  | 'locating'
  | 'resolving'
  | 'success'
  | 'denied'
  | 'blocked'
  | 'servicesOff'
  | 'timeout'
  | 'manual'
  | 'outOfArea';

export interface ResolvedLocation {
  /** Short display label, e.g. "Headingley, Leeds". */
  label: string;
  city: string;
  postcode?: string;
  latitude: number;
  longitude: number;
  /** Straight-line distance from the Leeds service centre, km. */
  distanceKm: number;
  source: 'gps' | 'manual';
}

export interface GateState {
  status: GateStatus;
  /** Whether the OS will still show a permission prompt (false => blocked). */
  canAskAgain: boolean;
  /** Resolved address once we have one (success / manual / outOfArea). */
  address: ResolvedLocation | null;
  /** City name when out of area, for the "We're not in {city} yet" copy. */
  outOfAreaCity: string | null;
  /** How many times the user has pressed Allow and been denied (for the shake). */
  denials: number;
}

export type GateEvent =
  | { type: 'REQUEST' }
  | { type: 'PERMISSION_RESULT'; granted: boolean; canAskAgain: boolean }
  | { type: 'SERVICES_OFF' }
  | { type: 'POSITION_OK' }
  | { type: 'POSITION_TIMEOUT' }
  | { type: 'RESOLVED'; address: ResolvedLocation }
  | { type: 'RESOLVE_ERROR' }
  | { type: 'MANUAL_CONFIRMED'; address: ResolvedLocation }
  | { type: 'RETRY' }
  /** Fired on AppState -> active / cold start with the freshest permission read. */
  | { type: 'APP_ACTIVE'; granted: boolean; canAskAgain: boolean };

export const initialGateState: GateState = {
  status: 'idle',
  canAskAgain: true,
  address: null,
  outOfAreaCity: null,
  denials: 0,
};

/** Haversine distance in kilometres between two lat/lon points. */
export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** True when a point is inside the Leeds service radius. */
export function isInServiceArea(point: { latitude: number; longitude: number }): boolean {
  return distanceKm(point, LEEDS) <= SERVICE_RADIUS_KM;
}

/** True once the app has a usable location this session (GPS success or manual). */
export function isResolved(state: GateState): boolean {
  return (state.status === 'success' || state.status === 'manual') && state.address != null;
}

/** Pure transition. Never performs I/O. */
export function gateReducer(state: GateState, event: GateEvent): GateState {
  switch (event.type) {
    case 'REQUEST':
      return { ...state, status: 'requesting' };

    case 'PERMISSION_RESULT':
      if (event.granted) {
        return { ...state, status: 'locating', canAskAgain: event.canAskAgain };
      }
      // Denied: distinguish "ask again" from "blocked" (Open Settings).
      return {
        ...state,
        status: event.canAskAgain ? 'denied' : 'blocked',
        canAskAgain: event.canAskAgain,
        denials: state.denials + 1,
      };

    case 'SERVICES_OFF':
      return { ...state, status: 'servicesOff' };

    case 'POSITION_OK':
      return { ...state, status: 'resolving' };

    case 'POSITION_TIMEOUT':
      return { ...state, status: 'timeout' };

    case 'RESOLVED': {
      const outOfArea = event.address.distanceKm > SERVICE_RADIUS_KM;
      return {
        ...state,
        status: outOfArea ? 'outOfArea' : 'success',
        address: event.address,
        outOfAreaCity: outOfArea ? event.address.city : null,
      };
    }

    case 'RESOLVE_ERROR':
      return { ...state, status: 'timeout' };

    case 'MANUAL_CONFIRMED': {
      const outOfArea = event.address.distanceKm > SERVICE_RADIUS_KM;
      return {
        ...state,
        status: outOfArea ? 'outOfArea' : 'manual',
        address: event.address,
        outOfAreaCity: outOfArea ? event.address.city : null,
      };
    }

    case 'RETRY':
      return { ...state, status: 'requesting' };

    case 'APP_ACTIVE':
      // On resume: if we already have a confirmed location, keep it.
      if (isResolved(state)) return state;
      // Permission now granted (e.g. returning from Settings) -> resume locating.
      if (event.granted) {
        return { ...state, status: 'locating', canAskAgain: event.canAskAgain };
      }
      // Still blocked vs can ask again.
      return {
        ...state,
        status: event.canAskAgain ? 'denied' : 'blocked',
        canAskAgain: event.canAskAgain,
      };

    default:
      return state;
  }
}
