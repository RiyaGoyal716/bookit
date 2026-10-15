import * as Haptics from 'expo-haptics';

import { haptics } from '../src/lib/haptics';
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
});

describe('haptics map', () => {
  it('maps selection / light / medium to the right primitives', () => {
    haptics.selection();
    expect(mockSelection).toHaveBeenCalledTimes(1);

    haptics.light();
    expect(mockImpact).toHaveBeenLastCalledWith('light');

    haptics.medium();
    expect(mockImpact).toHaveBeenLastCalledWith('medium');

    haptics.heavy();
    expect(mockImpact).toHaveBeenLastCalledWith('heavy');
  });

  it('maps success / warning / error notifications', () => {
    haptics.success();
    expect(mockNotify).toHaveBeenLastCalledWith('success');
    haptics.warning();
    expect(mockNotify).toHaveBeenLastCalledWith('warning');
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
