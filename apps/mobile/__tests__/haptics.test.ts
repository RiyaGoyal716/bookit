import * as Haptics from 'expo-haptics';

import {
  haptics,
  __resetHapticThrottle,
  __setHapticClock,
  canFireHaptic,
} from '../src/lib/haptics';
import { useSettingsStore } from '../src/stores/settingsStore';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

const mockSelection = Haptics.selectionAsync as jest.Mock;
const mockImpact = Haptics.impactAsync as jest.Mock;
const mockNotify = Haptics.notificationAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  useSettingsStore.getState().setHapticsEnabled(true);
  __resetHapticThrottle();
});

describe('haptics map', () => {
  it('maps selection / light / medium to the right primitives', () => {
    haptics.selection();
    expect(mockSelection).toHaveBeenCalledTimes(1);

    __resetHapticThrottle();
    haptics.light();
    expect(mockImpact).toHaveBeenLastCalledWith('light');

    __resetHapticThrottle();
    haptics.medium();
    expect(mockImpact).toHaveBeenLastCalledWith('medium');

    __resetHapticThrottle();
    haptics.heavy();
    expect(mockImpact).toHaveBeenLastCalledWith('heavy');
  });

  it('maps success / warning / error notifications', () => {
    haptics.success();
    expect(mockNotify).toHaveBeenLastCalledWith('success');
    __resetHapticThrottle();
    haptics.warning();
    expect(mockNotify).toHaveBeenLastCalledWith('warning');
    __resetHapticThrottle();
    haptics.error();
    expect(mockNotify).toHaveBeenLastCalledWith('error');
  });

  it('global off switch silences every haptic', () => {
    useSettingsStore.getState().setHapticsEnabled(false);
    haptics.selection();
    haptics.light();
    haptics.success();
    expect(mockSelection).not.toHaveBeenCalled();
    expect(mockImpact).not.toHaveBeenCalled();
    expect(mockNotify).not.toHaveBeenCalled();
  });
});

describe('haptics throttle', () => {
  it('fires at most once per 60ms window', () => {
    let clock = 1000;
    __setHapticClock(() => clock);
    __resetHapticThrottle();

    haptics.light(); // t=1000 fires
    haptics.light(); // t=1000 throttled
    clock = 1030;
    haptics.light(); // +30ms throttled
    clock = 1061;
    haptics.light(); // +61ms fires
    expect(mockImpact).toHaveBeenCalledTimes(2);

    __setHapticClock(() => Date.now());
  });

  it('canFireHaptic respects the minimum gap', () => {
    expect(canFireHaptic(1000, 1000)).toBe(false);
    expect(canFireHaptic(1059, 1000)).toBe(false);
    expect(canFireHaptic(1060, 1000)).toBe(true);
    expect(canFireHaptic(2000, 1000)).toBe(true);
  });
});
