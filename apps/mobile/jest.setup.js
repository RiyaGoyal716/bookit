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

// moti ships ESM + reanimated worklets, which aren't available under jest.
// Stub MotiView/AnimatePresence as plain Views so components that animate still
// render their content in the test renderer.
jest.mock('moti', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MotiView = React.forwardRef(function MotiView(props, ref) {
    const { children, style, pointerEvents, testID } = props;
    return React.createElement(View, { ref, style, pointerEvents, testID }, children);
  });
  const AnimatePresence = ({ children }) => React.createElement(React.Fragment, null, children);
  return { MotiView, AnimatePresence, View: MotiView };
});

// moti/interactions ships ESM and pulls in the worklets native initializer,
// which isn't available under jest. Stub MotiPressable with a plain Pressable
// (the animated `animate`/`transition` props are inert in the test renderer).
jest.mock('moti/interactions', () => {
  const React = require('react');
  const { Pressable } = require('react-native');
  const MotiPressable = React.forwardRef(function MotiPressable(props, ref) {
    const {
      children,
      onPress,
      onLongPress,
      disabled,
      hitSlop,
      style,
      accessibilityRole,
      accessibilityLabel,
      accessibilityHint,
      accessibilityState,
      testID,
    } = props;
    return React.createElement(
      Pressable,
      {
        ref,
        onPress,
        onLongPress,
        disabled,
        hitSlop,
        style,
        accessibilityRole,
        accessibilityLabel,
        accessibilityHint,
        accessibilityState,
        testID,
      },
      children,
    );
  });
  return { MotiPressable };
});
