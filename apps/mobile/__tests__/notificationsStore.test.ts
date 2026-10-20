import {
  useNotificationsStore,
  categoryOf,
  buildStacks,
  type AppNotification,
} from '../src/stores/notificationsStore';

const snapshot = useNotificationsStore.getState().items;

function reset() {
  useNotificationsStore.setState({ items: snapshot.map((n) => ({ ...n })) });
}

beforeEach(reset);

const mk = (over: Partial<AppNotification>): AppNotification => ({
  id: Math.random().toString(36).slice(2),
  type: 'offer',
  title: 't',
  body: 'b',
  time: 'now',
  day: 'Today',
  read: false,
  ...over,
});

describe('notifications store — read/unread', () => {
  it('marks a single item read and unread', () => {
    const s = useNotificationsStore.getState();
    const id = s.items[0].id;
    s.markRead(id);
    expect(useNotificationsStore.getState().items.find((n) => n.id === id)?.read).toBe(true);
    useNotificationsStore.getState().markUnread(id);
    expect(useNotificationsStore.getState().items.find((n) => n.id === id)?.read).toBe(false);
  });

  it('toggles read state', () => {
    const s = useNotificationsStore.getState();
    const id = s.items[0].id;
    const before = s.items[0].read;
    s.toggleRead(id);
    expect(useNotificationsStore.getState().items.find((n) => n.id === id)?.read).toBe(!before);
  });

  it('counts unread overall and by category', () => {
    const total = useNotificationsStore.getState().unreadCount();
    const byCat =
      useNotificationsStore.getState().unreadByCategory('bookings') +
      useNotificationsStore.getState().unreadByCategory('offers') +
      useNotificationsStore.getState().unreadByCategory('account');
    expect(byCat).toBe(total);
    expect(useNotificationsStore.getState().unreadByCategory('all')).toBe(total);
  });
});

describe('notifications store — mark all', () => {
  it('clears every unread dot', () => {
    useNotificationsStore.getState().markAllRead();
    expect(useNotificationsStore.getState().unreadCount()).toBe(0);
    expect(useNotificationsStore.getState().items.every((n) => n.read)).toBe(true);
  });
});

describe('notifications store — delete + undo', () => {
  it('removes an item and restores it at its original index', () => {
    const s = useNotificationsStore.getState();
    const target = s.items[2];
    const removed = s.remove(target.id);
    expect(removed).not.toBeNull();
    expect(useNotificationsStore.getState().items.find((n) => n.id === target.id)).toBeUndefined();
    const len = useNotificationsStore.getState().items.length;
    useNotificationsStore.getState().restore(removed!.item, removed!.index);
    const after = useNotificationsStore.getState().items;
    expect(after.length).toBe(len + 1);
    expect(after[removed!.index].id).toBe(target.id);
  });

  it('returns null when removing an unknown id', () => {
    expect(useNotificationsStore.getState().remove('does-not-exist')).toBeNull();
  });
});

describe('notifications store — resolveReview', () => {
  it('marks a review request handled + read', () => {
    const s = useNotificationsStore.getState();
    const review = s.items.find((n) => n.action === 'review')!;
    s.resolveReview(review.id);
    const after = useNotificationsStore.getState().items.find((n) => n.id === review.id)!;
    expect(after.read).toBe(true);
    expect(after.resolved).toBe(true);
    expect(after.action).toBeUndefined();
  });
});

describe('categoryOf', () => {
  it('maps types to filter buckets', () => {
    expect(categoryOf('offer')).toBe('offers');
    expect(categoryOf('review')).toBe('account');
    expect(categoryOf('security')).toBe('account');
    expect(categoryOf('refund')).toBe('account');
    expect(categoryOf('accepted')).toBe('bookings');
    expect(categoryOf('reminder')).toBe('bookings');
    expect(categoryOf('cancelled')).toBe('bookings');
  });
});

describe('buildStacks', () => {
  it('collapses 3+ same-type into a single stack, keeping others individual', () => {
    const items = [
      mk({ type: 'offer', id: 'o1' }),
      mk({ type: 'accepted', id: 'a1' }),
      mk({ type: 'offer', id: 'o2' }),
      mk({ type: 'offer', id: 'o3' }),
    ];
    const out = buildStacks(items);
    // one stack (3 offers) + one accepted row = 2 entries
    expect(out.length).toBe(2);
    const stack = out.find((e) => 'kind' in e && e.kind === 'stack');
    expect(stack).toBeDefined();
    expect((stack as { items: AppNotification[] }).items.length).toBe(3);
  });

  it('leaves everything individual when no type reaches 3', () => {
    const items = [mk({ type: 'offer' }), mk({ type: 'offer' }), mk({ type: 'accepted' })];
    const out = buildStacks(items);
    expect(out.length).toBe(3);
    expect(out.every((e) => !('kind' in e))).toBe(true);
  });
});
