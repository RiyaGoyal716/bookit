import { create } from 'zustand';

/** Notification kinds — each maps to a 3D icon + tint on the row. */
export type NotificationType =
  | 'accepted'
  | 'reminder'
  | 'offer'
  | 'review'
  | 'security'
  | 'onTheWay'
  | 'cancelled'
  | 'refund'
  | 'reschedule';

/** Top-level filter buckets shown as chips. */
export type NotificationCategory = 'bookings' | 'offers' | 'account';

/** Inline action a notification can require. */
export type NotificationAction = 'review' | 'reschedule' | 'payment';

/** Day bucket used to group the notification centre. */
export type NotificationDay = 'Today' | 'Yesterday' | 'Earlier';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Human-readable relative time, e.g. "2h ago". */
  time: string;
  day: NotificationDay;
  read: boolean;
  /** Inline action this item needs (renders in the "Needs action" section). */
  action?: NotificationAction;
  /** Offer code for promo notifications (shows a copy chip). */
  code?: string;
  /** ISO timestamp an offer counts down to. */
  endsAt?: string;
  /** Provider name/avatar for pro-related notifications. */
  proName?: string;
  proAvatar?: string;
  /** True once a review request has been answered inline. */
  resolved?: boolean;
}

/** Map a type to its filter category. */
export function categoryOf(type: NotificationType): NotificationCategory {
  switch (type) {
    case 'offer':
      return 'offers';
    case 'review':
    case 'security':
    case 'refund':
      return 'account';
    default:
      return 'bookings';
  }
}

/** A collapsed run of 3+ same-type notifications in one day group. */
export interface NotificationStack {
  kind: 'stack';
  type: NotificationType;
  items: AppNotification[];
}

/**
 * Collapse a day's notifications so any type with 3+ items becomes a single
 * stacked card ("3 new offers"), preserving first-seen order. Types with fewer
 * than 3 items stay as individual rows. Pure — used by the screen and tested.
 */
export function buildStacks(items: AppNotification[]): (AppNotification | NotificationStack)[] {
  const counts = new Map<NotificationType, number>();
  for (const n of items) counts.set(n.type, (counts.get(n.type) ?? 0) + 1);
  const out: (AppNotification | NotificationStack)[] = [];
  const stacked = new Set<NotificationType>();
  for (const n of items) {
    if ((counts.get(n.type) ?? 0) >= 3) {
      if (!stacked.has(n.type)) {
        stacked.add(n.type);
        out.push({ kind: 'stack', type: n.type, items: items.filter((x) => x.type === n.type) });
      }
    } else {
      out.push(n);
    }
  }
  return out;
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
    proName: 'Amira',
  },
  {
    id: 'n2',
    type: 'reminder',
    title: 'Upcoming appointment',
    body: 'Your GCSE maths session with LS6 Maths Tutor is tomorrow at 15:00.',
    time: '5h ago',
    day: 'Today',
    read: false,
  },
  {
    id: 'n3',
    type: 'review',
    title: 'How was it?',
    body: 'Leave a review for Headingley Barber Co and help your neighbours.',
    time: '6h ago',
    day: 'Today',
    read: false,
    action: 'review',
    proName: 'Headingley Barber Co',
  },
  {
    id: 'n4',
    type: 'offer',
    title: '20% off your next clean',
    body: 'Use code SHINE20 before Sunday on any cleaning booking.',
    time: '8h ago',
    day: 'Today',
    read: false,
    code: 'SHINE20',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 52).toISOString(),
  },
  {
    id: 'n5',
    type: 'offer',
    title: 'Weekend treat: 15% off beauty',
    body: 'Book any beauty service this weekend with code GLOW15.',
    time: '9h ago',
    day: 'Today',
    read: false,
    code: 'GLOW15',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 40).toISOString(),
  },
  {
    id: 'n6',
    type: 'offer',
    title: '£5 off handyman jobs',
    body: 'A little something for your next repair — code FIX5.',
    time: '10h ago',
    day: 'Today',
    read: true,
    code: 'FIX5',
  },
  {
    id: 'n7',
    type: 'cancelled',
    title: 'Booking cancelled',
    body: 'Your window clean on Tue was cancelled. No charge was taken.',
    time: '1d ago',
    day: 'Yesterday',
    read: true,
  },
  {
    id: 'n8',
    type: 'refund',
    title: 'Refund processed',
    body: 'We refunded £12.00 to your wallet for the cancelled clean.',
    time: '1d ago',
    day: 'Yesterday',
    read: true,
  },
  {
    id: 'n9',
    type: 'security',
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
  unreadByCategory: (cat: NotificationCategory | 'all') => number;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  toggleRead: (id: string) => void;
  markAllRead: () => void;
  /** Remove and return { item, index } so the UI can offer Undo. */
  remove: (id: string) => { item: AppNotification; index: number } | null;
  /** Re-insert a previously removed item at its original index. */
  restore: (item: AppNotification, index: number) => void;
  /** Resolve a review request inline (keeps the row, marks it handled + read). */
  resolveReview: (id: string) => void;
  add: (n: Omit<AppNotification, 'id' | 'read' | 'day'> & { day?: NotificationDay }) => void;
}

/** Mock notifications store (session-only). */
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: seeded,
  unreadCount: () => get().items.filter((n) => !n.read).length,
  unreadByCategory: (cat) =>
    get().items.filter((n) => !n.read && (cat === 'all' || categoryOf(n.type) === cat)).length,
  markRead: (id) =>
    set((state) => ({ items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markUnread: (id) =>
    set((state) => ({ items: state.items.map((n) => (n.id === id ? { ...n, read: false } : n)) })),
  toggleRead: (id) =>
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    })),
  markAllRead: () => set((state) => ({ items: state.items.map((n) => ({ ...n, read: true })) })),
  remove: (id) => {
    const index = get().items.findIndex((n) => n.id === id);
    if (index < 0) return null;
    const item = get().items[index];
    set((state) => ({ items: state.items.filter((n) => n.id !== id) }));
    return { item, index };
  },
  restore: (item, index) =>
    set((state) => {
      const next = state.items.slice();
      next.splice(Math.min(index, next.length), 0, item);
      return { items: next };
    }),
  resolveReview: (id) =>
    set((state) => ({
      items: state.items.map((n) =>
        n.id === id ? { ...n, read: true, resolved: true, action: undefined } : n,
      ),
    })),
  add: (n) =>
    set((state) => ({
      items: [{ day: 'Today', ...n, id: `n${Date.now()}`, read: false }, ...state.items],
    })),
}));
