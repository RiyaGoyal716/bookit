import {
  gateReducer,
  initialGateState,
  distanceKm,
  isInServiceArea,
  isResolved,
  LEEDS,
  SERVICE_RADIUS_KM,
  type GateState,
  type ResolvedLocation,
} from '../src/features/location/gateMachine';
import {
  isValidUKPostcode,
  normalisePostcode,
  searchPostcode,
} from '../src/features/location/postcode';

const leedsAddr: ResolvedLocation = {
  label: 'Headingley, Leeds',
  city: 'Leeds',
  latitude: LEEDS.latitude,
  longitude: LEEDS.longitude,
  distanceKm: 0,
  source: 'gps',
};

const farAddr: ResolvedLocation = {
  label: 'City Centre, London',
  city: 'London',
  latitude: 51.5074,
  longitude: -0.1278,
  distanceKm: 280,
  source: 'gps',
};

describe('gateReducer', () => {
  it('starts idle and moves to requesting', () => {
    expect(initialGateState.status).toBe('idle');
    const s = gateReducer(initialGateState, { type: 'REQUEST' });
    expect(s.status).toBe('requesting');
  });

  it('granted → locating → resolving → success', () => {
    let s = gateReducer(initialGateState, { type: 'REQUEST' });
    s = gateReducer(s, { type: 'PERMISSION_RESULT', granted: true, canAskAgain: true });
    expect(s.status).toBe('locating');
    s = gateReducer(s, { type: 'POSITION_OK' });
    expect(s.status).toBe('resolving');
    s = gateReducer(s, { type: 'RESOLVED', address: leedsAddr });
    expect(s.status).toBe('success');
    expect(s.address?.label).toBe('Headingley, Leeds');
    expect(isResolved(s)).toBe(true);
  });

  it('denied but can ask again stays on the gate and counts denials', () => {
    let s = gateReducer(initialGateState, { type: 'REQUEST' });
    s = gateReducer(s, { type: 'PERMISSION_RESULT', granted: false, canAskAgain: true });
    expect(s.status).toBe('denied');
    expect(s.denials).toBe(1);
    s = gateReducer(s, { type: 'REQUEST' });
    s = gateReducer(s, { type: 'PERMISSION_RESULT', granted: false, canAskAgain: true });
    expect(s.denials).toBe(2);
    expect(isResolved(s)).toBe(false);
  });

  it('denied and cannot ask again → blocked', () => {
    let s = gateReducer(initialGateState, { type: 'REQUEST' });
    s = gateReducer(s, { type: 'PERMISSION_RESULT', granted: false, canAskAgain: false });
    expect(s.status).toBe('blocked');
    expect(s.canAskAgain).toBe(false);
  });

  it('services off → servicesOff', () => {
    const s = gateReducer(initialGateState, { type: 'SERVICES_OFF' });
    expect(s.status).toBe('servicesOff');
  });

  it('timeout and resolve error both land on timeout', () => {
    let s = gateReducer(initialGateState, {
      type: 'PERMISSION_RESULT',
      granted: true,
      canAskAgain: true,
    });
    expect(gateReducer(s, { type: 'POSITION_TIMEOUT' }).status).toBe('timeout');
    expect(gateReducer(s, { type: 'RESOLVE_ERROR' }).status).toBe('timeout');
    s = gateReducer({ ...s, status: 'timeout' }, { type: 'RETRY' });
    expect(s.status).toBe('requesting');
  });

  it('manual confirmation resolves without GPS', () => {
    const manual: ResolvedLocation = { ...leedsAddr, source: 'manual' };
    const s = gateReducer(initialGateState, { type: 'MANUAL_CONFIRMED', address: manual });
    expect(s.status).toBe('manual');
    expect(isResolved(s)).toBe(true);
  });

  it('out of area routes to outOfArea with the city name (GPS and manual)', () => {
    const gps = gateReducer(initialGateState, { type: 'RESOLVED', address: farAddr });
    expect(gps.status).toBe('outOfArea');
    expect(gps.outOfAreaCity).toBe('London');
    const manual = gateReducer(initialGateState, {
      type: 'MANUAL_CONFIRMED',
      address: { ...farAddr, source: 'manual' },
    });
    expect(manual.status).toBe('outOfArea');
  });

  it('APP_ACTIVE keeps a resolved location but resumes when newly granted', () => {
    const resolved: GateState = {
      ...initialGateState,
      status: 'success',
      address: leedsAddr,
    };
    expect(
      gateReducer(resolved, { type: 'APP_ACTIVE', granted: false, canAskAgain: false }),
    ).toEqual(resolved);
    const blocked: GateState = { ...initialGateState, status: 'blocked', canAskAgain: false };
    const resumed = gateReducer(blocked, { type: 'APP_ACTIVE', granted: true, canAskAgain: true });
    expect(resumed.status).toBe('locating');
    const still = gateReducer(blocked, { type: 'APP_ACTIVE', granted: false, canAskAgain: true });
    expect(still.status).toBe('denied');
  });
});

describe('distance helpers', () => {
  it('distance from Leeds to Leeds is ~0 and inside the service area', () => {
    expect(distanceKm(LEEDS, LEEDS)).toBeCloseTo(0, 5);
    expect(isInServiceArea(LEEDS)).toBe(true);
  });

  it('London is far outside the service radius', () => {
    const london = { latitude: 51.5074, longitude: -0.1278 };
    expect(distanceKm(london, LEEDS)).toBeGreaterThan(SERVICE_RADIUS_KM);
    expect(isInServiceArea(london)).toBe(false);
  });
});

describe('postcode', () => {
  it('validates UK postcodes', () => {
    expect(isValidUKPostcode('LS6 1AB')).toBe(true);
    expect(isValidUKPostcode('ls61ab')).toBe(true);
    expect(isValidUKPostcode('EC1A 1BB')).toBe(true);
    expect(isValidUKPostcode('nonsense')).toBe(false);
    expect(isValidUKPostcode('123')).toBe(false);
  });

  it('normalises spacing and case', () => {
    expect(normalisePostcode('ls6 1ab')).toBe('LS6 1AB');
    expect(normalisePostcode('ec1a1bb')).toBe('EC1A 1BB');
  });

  it('resolves a Leeds postcode inside the service area', () => {
    const res = searchPostcode('LS6 1AB');
    expect(res).not.toBeNull();
    expect(res?.city).toBe('Leeds');
    expect(res?.source).toBe('manual');
    expect(res!.distanceKm).toBeLessThan(SERVICE_RADIUS_KM);
  });

  it('resolves an out-of-area postcode with distance beyond the radius', () => {
    const res = searchPostcode('M1 1AE');
    expect(res?.city).toBe('Manchester');
    expect(res!.distanceKm).toBeGreaterThan(SERVICE_RADIUS_KM);
  });

  it('rejects invalid postcodes', () => {
    expect(searchPostcode('nope')).toBeNull();
  });
});
