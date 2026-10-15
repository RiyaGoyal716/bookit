import { Tabs } from 'expo-router';

import { useChatStore } from '../../src/stores/chatStore';
import { useColors } from '../../src/theme';
import { FloatingTabBar } from '../../src/components/ui';

/** NOVA tab shell: Home · Explore · Bookings · Inbox · Account with a blurred floating tab bar. */
export default function TabsLayout() {
  const c = useColors();
  const unread = useChatStore((s) => s.conversations.reduce((n, conv) => n + conv.unread, 0));

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: c.background.base },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen
        name="inbox"
        options={{ title: 'Inbox', tabBarBadge: unread > 0 ? unread : undefined }}
      />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
