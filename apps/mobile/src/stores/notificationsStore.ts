import { create } from 'zustand';

export type NotificationType = 'accepted' | 'reminder' | 'review' | 'promo';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Human-readable relative time, e.g. "2h ago". */
  time: string;
  read: boolean;
}

const seeded: AppNotification[] = [
  {
    id: 'n1',
    type: 'accepted',
    title: 'Booking accepted',
    body: 'Hyde Park Home Cleaning accepted your deep clean for Wed 8 Oct.',
    time: '2h ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'reminder',
    title: 'Upcoming appointment',
    body: 'Reminder: your GCSE maths session with LS6 Maths Tutor is tomorrow at 15:00.',
    time: '5h ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'review',
    title: 'How was it?',
    body: 'Leave a review for Headingley Barber Co and help your neighbours.',
    time: '1d ago',
    read: true,
  },
];

interface NotificationsState {
  items: AppNotification[];
  unreadCount: () => number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  add: (n: Omit<AppNotification, 'id' | 'read'>) => void;
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
      items: [{ ...n, id: `n${Date.now()}`, read: false }, ...state.items],
    })),
}));
