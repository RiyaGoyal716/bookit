import { useEffect } from 'react';
import { type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useChatStore } from '../../src/stores/chatStore';
import { useReducedMotion } from '../../src/components/motion';
import { useColors, typography } from '../../src/theme';

/** Tab icon with a spring lift + pop when it becomes active. */
function TabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: ColorValue;
  size: number;
  focused: boolean;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(focused ? 1 : 0.88);
  const lift = useSharedValue(focused ? -2 : 0);

  useEffect(() => {
    if (reduced) {
      scale.value = focused ? 1 : 0.88;
      lift.value = focused ? -2 : 0;
      return;
    }
    lift.value = withSpring(focused ? -3 : 0, { damping: 12, stiffness: 240 });
    if (focused) {
      // Pop up past 1 then settle for a tactile switch.
      scale.value = withSequence(
        withTiming(1.18, { duration: 130 }),
        withSpring(1, { damping: 10, stiffness: 240 }),
      );
    } else {
      scale.value = withSpring(0.88, { damping: 14, stiffness: 240 });
    }
  }, [focused, reduced, scale, lift]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: lift.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  const c = useColors();
  const unread = useChatStore((s) => s.conversations.reduce((n, conv) => n + conv.unread, 0));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: c.background.base },
        tabBarActiveTintColor: c.brand.tint,
        tabBarInactiveTintColor: c.text.muted,
        tabBarStyle: {
          borderTopColor: c.border,
          backgroundColor: c.background.surface,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: typography.font.semibold,
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'calendar' : 'calendar-outline'}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: {
            backgroundColor: c.status.danger,
            color: c.text.inverse,
            fontSize: 10,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
