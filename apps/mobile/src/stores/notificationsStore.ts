import { create } from 'zustand';

export type NotificationType = 'accepted' | 'reminder' | 'review' | 'promo' | 'safety';

/** Day bucket used to group the notification centre. */
export type NotificationDay = 'Today' | 'Yesterday' | 'Earlier';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Human-readable relative time, e.g. "2h ago". */
  time: string;
  /** Day bucket for grouping. */
  day: NotificationDay;
  read: boolean;
}

const seeded: AppNotification[] = [
  {
    id: 'n1',
    type: 'accepted',
    title: 'Booking accepted',
    body: 'Hyde Park Home Cleaning accepted your deep clean for Wed 8 Oct.',
    time: '2h ago',
    day: 'Today',
    read: false,
  },
  {
    id: 'n2',
    type: 'reminder',
    title: 'Upcoming appointment',
    body: 'Reminder: your GCSE maths session with LS6 Maths Tutor is tomorrow at 15:00.',
    time: '5h ago',
    day: 'Today',
    read: false,
  },
  {
    id: 'n5',
    type: 'promo',
    title: '20% off your next clean',
    body: 'Use code SHINE20 before Sunday on any cleaning booking.',
    time: '8h ago',
    day: 'Today',
    read: false,
  },
  {
    id: 'n3',
    type: 'review',
    title: 'How was it?',
    body: 'Leave a review for Headingley Barber Co and help your neighbours.',
    time: '1d ago',
    day: 'Yesterday',
    read: true,
  },
  {
    id: 'n4',
    type: 'safety',
    title: 'Keep your account secure',
    body: 'Set up a PIN in Security settings for faster, safer sign-in.',
    time: '3d ago',
    day: 'Earlier',
    read: true,
  },
];

interface NotificationsState {
  items: AppNotification[];
  unreadCount: () => number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  add: (n: Omit<AppNotification, 'id' | 'read' | 'day'> & { day?: NotificationDay }) => void;
}

/** Mock notifications store (session-only), seeded with three items. */
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: seeded,
  unreadCount: () => get().items.filter((n) => !n.read).length,
  markRead: (id: string) =>
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () => set((state) => ({ items: state.items.map((n) => ({ ...n, read: true })) })),
  add: (n) =>
    set((state) => ({
      items: [{ day: 'Today', ...n, id: `n${Date.now()}`, read: false }, ...state.items],
    })),
}));
