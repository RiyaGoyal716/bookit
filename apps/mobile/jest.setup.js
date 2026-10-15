// Jest setup for the Bookit mobile app.

// Mock native-only modules so unit tests don't require a device/runtime.
jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
}));

// lucide ships ESM-only (.mjs) icons that Jest won't transform; every icon the
// <Icon> wrapper references becomes a no-op component for unit tests.
jest.mock('lucide-react-native', () => new Proxy({}, { get: () => () => null }));
