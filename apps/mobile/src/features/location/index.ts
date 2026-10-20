export {
  gateReducer,
  initialGateState,
  distanceKm,
  isInServiceArea,
  isResolved,
  LEEDS,
  SERVICE_RADIUS_KM,
} from './gateMachine';
export type { GateState, GateEvent, GateStatus, ResolvedLocation } from './gateMachine';
export { isValidUKPostcode, normalisePostcode, searchPostcode } from './postcode';
