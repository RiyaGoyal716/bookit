import { useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import {
  Button,
  Icon,
  Icon3D,
  IconButton,
  PressableScale,
  Text,
  Avatar,
  Toggle,
  CollapsingHeader,
  LargeTitle,
  useScreenScroll,
  useTabBarInset,
} from '../src/components/ui';
import { BottomSheet } from '../src/components';
import { route } from '../src/lib/nav';
import { haptics } from '../src/lib/haptics';
import { showToast } from '../src/stores/toastStore';
import {
  useNotificationsStore,
  categoryOf,
  buildStacks,
  type AppNotification,
  type NotificationType,
  type NotificationCategory,
  type NotificationDay,
  type NotificationStack,
} from '../src/stores/notificationsStore';
import {
  useNotificationPrefsStore,
  type NotificationPrefs,
} from '../src/stores/notificationPrefsStore';
import { useTokens, spacing, radius, spring, type NovaTokens } from '../src/theme';
import { useT } from '../src/i18n';
import type { Fluent3DKey } from '../src/assets/3d';

type PrefKey = keyof NotificationPrefs;
type TintKey = 'coral' | 'sky' | 'success' | 'sunshine';

const TYPE_ICON: Record<NotificationType, { icon: Fluent3DKey; tint: TintKey }> = {
  accepted: { icon: 'check_mark_button', tint: 'success' },
  reminder: { icon: 'alarm_clock', tint: 'sky' },
  offer: { icon: 'admission_tickets', tint: 'coral' },
  review: { icon: 'glowing_star', tint: 'sunshine' },
  security: { icon: 'locked_with_key', tint: 'sky' },
  onTheWay: { icon: 'motor_scooter', tint: 'success' },
  cancelled: { icon: 'cross_mark', tint: 'coral' },
  refund: { icon: 'coin', tint: 'sunshine' },
  reschedule: { icon: 'spiral_calendar', tint: 'sky' },
};

function tintOf(t: NovaTokens, key: TintKey): string {
  return key === 'coral'
    ? t.coral
    : key === 'sky'
      ? t.sky
      : key === 'success'
        ? t.success
        : t.sunshine;
}

const DAY_ORDER: NotificationDay[] = ['Today', 'Yesterday', 'Earlier'];

/** "2d 4h" style countdown from an ISO timestamp. */
function countdown(iso?: string): string | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  const rem = h % 24;
  return d > 0 ? `${d}d ${rem}h` : `${h}h`;
}

const FILTERS: { key: NotificationCategory | 'all'; labelKey: string }[] = [
  { key: 'all', labelKey: 'notifs.filterAll' },
  { key: 'bookings', labelKey: 'notifs.filterBookings' },
  { key: 'offers', labelKey: 'notifs.filterOffers' },
  { key: 'account', labelKey: 'notifs.filterAccount' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const t = useTokens();
  const tr = useT();
  const tabInset = useTabBarInset();
  const { scrollY, onScroll } = useScreenScroll();
  const styles = useMemo(() => makeStyles(t), [t]);

  const items = useNotificationsStore((s) => s.items);
  const markRead = useNotificationsStore((s) => s.markRead);
  const toggleRead = useNotificationsStore((s) => s.toggleRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const remove = useNotificationsStore((s) => s.remove);
  const restore = useNotificationsStore((s) => s.restore);
  const unreadByCategory = useNotificationsStore((s) => s.unreadByCategory);

  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all');
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ item: AppNotification; index: number } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasUnread = items.some((n) => !n.read);

  const filtered = useMemo(
    () => items.filter((n) => filter === 'all' || categoryOf(n.type) === filter),
    [items, filter],
  );

  const needsAction = filtered.filter((n) => n.action && !n.resolved);

  const onMarkAll = () => {
    if (!hasUnread) return;
    markAllRead();
    haptics.success();
    showToast(tr('notifs.markedAllToast'));
  };

  const onDelete = (id: string) => {
    const removed = remove(id);
    haptics.medium();
    if (removed) {
      setUndo(removed);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setUndo(null), 4000);
    }
  };

  const onUndo = () => {
    if (!undo) return;
    restore(undo.item, undo.index);
    haptics.selection();
    setUndo(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  const openItem = (n: AppNotification) => {
    markRead(n.id);
    const cat = categoryOf(n.type);
    if (cat === 'offers') router.push(route('/offers'));
    else if (n.type === 'review') router.push(route('/review'));
    else router.push(route('/(tabs)/bookings'));
  };

  // Build sticky-sectioned content.
  const blocks: React.ReactNode[] = [];
  const stickyIndices: number[] = [];

  blocks.push(<LargeTitle key="title" title={tr('notifs.title')} />);

  // Filter chips
  blocks.push(
    <FilterChips
      key="chips"
      filter={filter}
      onChange={(f) => {
        haptics.selection();
        setFilter(f);
      }}
      counts={{
        all: unreadByCategory('all'),
        bookings: unreadByCategory('bookings'),
        offers: unreadByCategory('offers'),
        account: unreadByCategory('account'),
      }}
      tr={tr}
    />,
  );

  // Needs action
  if (needsAction.length > 0) {
    blocks.push(
      <Text key="na-h" variant="footnote" tone="muted" style={styles.sectionLabel}>
        {tr('notifs.needsAction')}
      </Text>,
    );
    for (const n of needsAction) {
      blocks.push(<NeedsActionCard key={`na-${n.id}`} item={n} tr={tr} router={router} />);
    }
  }

  // Grouped feed with sticky day headers + stacking
  for (const day of DAY_ORDER) {
    const group = filtered.filter((n) => n.day === day && !(n.action && !n.resolved));
    if (group.length === 0) continue;
    stickyIndices.push(blocks.length);
    blocks.push(
      <View key={`d-${day}`} style={[styles.dayHeader, { backgroundColor: t.bg }]}>
        <Text variant="footnote" tone="muted" style={styles.dayHeaderText}>
          {tr(`notifs.${day.toLowerCase()}`)}
        </Text>
      </View>,
    );
    for (const entry of buildStacks(group)) {
      if ('kind' in entry) {
        blocks.push(
          <StackCard key={`st-${day}-${entry.type}`} stack={entry} tr={tr} onOpen={openItem} />,
        );
      } else {
        blocks.push(
          <NotifRow
            key={entry.id}
            item={entry}
            tr={tr}
            onOpen={() => openItem(entry)}
            onDelete={() => onDelete(entry.id)}
            onToggleRead={() => {
              toggleRead(entry.id);
              haptics.selection();
            }}
          />,
        );
      }
    }
  }

  const empty = filtered.length === 0;

  return (
    <View style={styles.container}>
      <CollapsingHeader
        title={tr('notifs.title')}
        scrollY={scrollY}
        left={
          <IconButton
            name="chevron-left"
            accessibilityLabel={tr('common.back')}
            variant="subtle"
            onPress={() => router.back()}
          />
        }
        right={
          <View style={styles.headerActions}>
            <HeaderButton
              name="check-all"
              label={tr('notifs.markAllRead')}
              disabled={!hasUnread}
              showTooltip={tooltip === 'markall'}
              onLongPress={() => {
                haptics.light();
                setTooltip('markall');
                setTimeout(() => setTooltip((c) => (c === 'markall' ? null : c)), 1400);
              }}
              onPress={onMarkAll}
            />
            <HeaderButton
              name="sliders"
              label={tr('notifs.preferences')}
              showTooltip={tooltip === 'prefs'}
              onLongPress={() => {
                haptics.light();
                setTooltip('prefs');
                setTimeout(() => setTooltip((c) => (c === 'prefs' ? null : c)), 1400);
              }}
              onPress={() => {
                haptics.light();
                setPrefsOpen(true);
              }}
            />
          </View>
        }
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={empty ? [] : stickyIndices}
        contentContainerStyle={{ paddingTop: spacing.xxl + spacing.lg, paddingBottom: tabInset }}
      >
        {empty ? (
          <View style={styles.empty}>
            <Icon3D name="bell" size={72} tint={t.sunshine} animate="attention" />
            <Text variant="title2" center style={styles.emptyTitle}>
              {tr('notifs.allCaughtUp')}
            </Text>
            <Text variant="body" tone="muted" center>
              {tr('notifs.allCaughtUpBody')}
            </Text>
          </View>
        ) : (
          blocks
        )}
      </Animated.ScrollView>

      {undo ? (
        <View style={[styles.undoBar, { backgroundColor: t.inverse }]}>
          <Text variant="footnote" style={{ color: t.onInverse }}>
            {tr('notifs.deleted')}
          </Text>
          <PressableScale
            haptic={null}
            onPress={onUndo}
            accessibilityRole="button"
            accessibilityLabel={tr('notifs.undo')}
          >
            <Text variant="footnote" style={{ color: t.onInverse, fontWeight: '700' }}>
              {tr('notifs.undo')}
            </Text>
          </PressableScale>
        </View>
      ) : null}

      <NotificationPrefsSheet open={prefsOpen} onClose={() => setPrefsOpen(false)} tr={tr} />
    </View>
  );
}

/** Header icon button with a long-press tooltip. */
function HeaderButton({
  name,
  label,
  disabled,
  showTooltip,
  onPress,
  onLongPress,
}: {
  name: 'check-all' | 'sliders';
  label: string;
  disabled?: boolean;
  showTooltip: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const t = useTokens();
  return (
    <View>
      {showTooltip && (
        <View style={[tipStyles.tip, { backgroundColor: t.inverse }]} pointerEvents="none">
          <Text variant="micro" style={{ color: t.onInverse, fontWeight: '700' }}>
            {label}
          </Text>
        </View>
      )}
      <IconButton
        name={name}
        accessibilityLabel={label}
        variant="subtle"
        disabled={disabled}
        color={disabled ? t.textSubtle : t.text}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    </View>
  );
}

/** Sliding filter chips with unread counts. */
function FilterChips({
  filter,
  onChange,
  counts,
  tr,
}: {
  filter: NotificationCategory | 'all';
  onChange: (f: NotificationCategory | 'all') => void;
  counts: Record<'all' | NotificationCategory, number>;
  tr: (k: string, o?: Record<string, unknown>) => string;
}) {
  const t = useTokens();
  return (
    <View style={chipStyles.row}>
      {FILTERS.map((f) => {
        const active = filter === f.key;
        const count = counts[f.key];
        return (
          <PressableScale
            key={f.key}
            haptic={null}
            onPress={() => onChange(f.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tr(f.labelKey)}
            style={[
              chipStyles.chip,
              {
                borderColor: active ? t.primary : t.border,
                backgroundColor: active ? t.primary : 'transparent',
              },
            ]}
          >
            <Text
              variant="footnote"
              style={{ color: active ? t.onPrimary : t.text, fontWeight: '600' }}
            >
              {tr(f.labelKey)}
            </Text>
            {count > 0 && (
              <View style={[chipStyles.count, { backgroundColor: active ? t.onPrimary : t.coral }]}>
                <Text
                  variant="micro"
                  style={{ color: active ? t.primary : '#FFFFFF', fontWeight: '700' }}
                >
                  {count}
                </Text>
              </View>
            )}
          </PressableScale>
        );
      })}
    </View>
  );
}

/** A compact swipeable notification row. */
function NotifRow({
  item,
  tr,
  onOpen,
  onDelete,
  onToggleRead,
}: {
  item: AppNotification;
  tr: (k: string, o?: Record<string, unknown>) => string;
  onOpen: () => void;
  onDelete: () => void;
  onToggleRead: () => void;
}) {
  const t = useTokens();
  const styles = useMemo(() => makeStyles(t), [t]);
  const tx = useSharedValue(0);
  const crossed = useSharedValue(0);
  const meta = TYPE_ICON[item.type];
  const ends = countdown(item.endsAt);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      tx.value = Math.max(-140, Math.min(140, e.translationX));
      const over = Math.abs(tx.value) > 96;
      if (over && crossed.value === 0) {
        crossed.value = 1;
        runOnJS(haptics.medium)();
      } else if (!over) {
        crossed.value = 0;
      }
    })
    .onEnd(() => {
      if (tx.value < -96) {
        tx.value = withTiming(-400, { duration: 160 }, () => runOnJS(onDelete)());
      } else if (tx.value > 96) {
        tx.value = withSpring(0, spring.snappy);
        runOnJS(onToggleRead)();
      } else {
        tx.value = withSpring(0, spring.snappy);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  return (
    <View style={styles.rowWrap}>
      {/* action backdrops */}
      <View style={styles.rowActions} pointerEvents="none">
        <View style={[styles.actionLeft, { backgroundColor: t.sky }]}>
          <Icon name="check-all" size={20} color="#FFFFFF" weight="bold" />
        </View>
        <View style={[styles.actionRight, { backgroundColor: t.coral }]}>
          <Icon name="trash" size={20} color="#FFFFFF" weight="bold" />
        </View>
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={rowStyle}>
          <PressableScale
            haptic="light"
            onPress={onOpen}
            onLongPress={onToggleRead}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.read ? '' : tr('notifs.markRead')}`}
            style={[styles.row, { backgroundColor: item.read ? t.bg : t.coralSoft }]}
          >
            <View>
              <Icon3D
                name={meta.icon}
                size={44}
                tint={tintOf(t, meta.tint)}
                animate={item.read ? 'none' : 'enter'}
              />
              {item.proName ? (
                <View style={styles.proAvatar}>
                  <Avatar name={item.proName} uri={item.proAvatar} size={22} />
                </View>
              ) : null}
            </View>
            <View style={styles.rowBody}>
              <View style={styles.rowTop}>
                <Text
                  variant="callout"
                  style={[styles.rowTitle, !item.read && styles.bold]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text variant="micro" tone="subtle">
                  {item.time}
                </Text>
              </View>
              <Text variant="caption" tone="muted" numberOfLines={2}>
                {item.body}
              </Text>
              {item.code ? <OfferExtras code={item.code} ends={ends} tr={tr} /> : null}
              {item.type === 'reminder' ? (
                <View style={styles.inlineActions}>
                  <MiniButton label={tr('notifs.addToCalendar')} icon="calendar" />
                  <MiniButton label={tr('notifs.directions')} icon="navigation" />
                </View>
              ) : null}
            </View>
            {!item.read ? <View style={[styles.unreadDot, { backgroundColor: t.coral }]} /> : null}
          </PressableScale>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

/** Offer code chip + copy + countdown. */
function OfferExtras({
  code,
  ends,
  tr,
}: {
  code: string;
  ends: string | null;
  tr: (k: string, o?: Record<string, unknown>) => string;
}) {
  const t = useTokens();
  const styles = useMemo(() => makeStyles(t), [t]);
  return (
    <View style={styles.inlineActions}>
      <PressableScale
        haptic={null}
        onPress={() => {
          void Clipboard.setStringAsync(code);
          haptics.success();
          showToast(tr('notifs.copied'));
        }}
        accessibilityRole="button"
        accessibilityLabel={`${tr('notifs.copy')} ${code}`}
        style={[styles.codeChip, { borderColor: t.border }]}
      >
        <Text variant="caption" style={styles.bold}>
          {code}
        </Text>
        <Icon name="copy" size={16} color={t.textMuted} weight="bold" />
      </PressableScale>
      {ends ? (
        <Text variant="micro" tone="subtle">
          {tr('notifs.endsIn', { time: ends })}
        </Text>
      ) : null}
    </View>
  );
}

function MiniButton({ label, icon }: { label: string; icon: 'calendar' | 'navigation' | 'edit' }) {
  const t = useTokens();
  const styles = useMemo(() => makeStyles(t), [t]);
  return (
    <PressableScale
      haptic="light"
      onPress={() => haptics.light()}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.miniBtn, { borderColor: t.border }]}
    >
      <Icon name={icon} size={16} color={t.text} weight="bold" />
      <Text variant="micro" style={styles.bold}>
        {label}
      </Text>
    </PressableScale>
  );
}

/** A collapsed stack of same-type notifications. */
function StackCard({
  stack,
  tr,
  onOpen,
}: {
  stack: NotificationStack;
  tr: (k: string, o?: Record<string, unknown>) => string;
  onOpen: (n: AppNotification) => void;
}) {
  const t = useTokens();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_ICON[stack.type];
  const typeWord =
    stack.type === 'offer'
      ? tr('notifs.filterOffers').toLowerCase()
      : tr('notifs.filterBookings').toLowerCase();
  const unread = stack.items.filter((n) => !n.read).length;

  if (expanded) {
    return (
      <View>
        {stack.items.map((n) => (
          <NotifRow
            key={n.id}
            item={n}
            tr={tr}
            onOpen={() => onOpen(n)}
            onDelete={() => useNotificationsStore.getState().remove(n.id)}
            onToggleRead={() => {
              useNotificationsStore.getState().toggleRead(n.id);
              haptics.selection();
            }}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.rowWrap}>
      <View style={[styles.stackBehind, { backgroundColor: t.surface, borderColor: t.border }]} />
      <PressableScale
        haptic="selection"
        onPress={() => setExpanded(true)}
        accessibilityRole="button"
        accessibilityLabel={tr('notifs.stackCount', { count: stack.items.length, type: typeWord })}
        style={[styles.row, { backgroundColor: unread > 0 ? t.coralSoft : t.bg }]}
      >
        <Icon3D name={meta.icon} size={44} tint={tintOf(t, meta.tint)} />
        <View style={styles.rowBody}>
          <Text variant="callout" style={styles.bold}>
            {tr('notifs.stackCount', { count: stack.items.length, type: typeWord })}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {stack.items[0].title}
          </Text>
        </View>
        <Icon name="chevron-down" size={20} color={t.textMuted} weight="bold" />
      </PressableScale>
    </View>
  );
}

/** "Needs action" card with inline controls. */
function NeedsActionCard({
  item,
  tr,
  router,
}: {
  item: AppNotification;
  tr: (k: string, o?: Record<string, unknown>) => string;
  router: ReturnType<typeof useRouter>;
}) {
  const t = useTokens();
  const styles = useMemo(() => makeStyles(t), [t]);
  const resolveReview = useNotificationsStore((s) => s.resolveReview);
  const remove = useNotificationsStore((s) => s.remove);
  const [stars, setStars] = useState(0);
  const [done, setDone] = useState(false);
  const meta = TYPE_ICON[item.type];

  return (
    <View style={[styles.actionCard, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={styles.rowTop}>
        <Icon3D name={meta.icon} size={40} tint={tintOf(t, meta.tint)} animate="enter" />
        <View style={styles.flex1}>
          <Text variant="callout" style={styles.bold}>
            {item.title}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={2}>
            {item.body}
          </Text>
        </View>
      </View>

      {item.action === 'review' &&
        (done ? (
          <View style={styles.inlineActions}>
            <Text variant="callout" style={[styles.bold, { color: t.success }]}>
              {tr('notifs.thanks')}
            </Text>
            <MiniButton label={tr('notifs.writeMore')} icon="edit" />
          </View>
        ) : (
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <PressableScale
                key={n}
                haptic={null}
                onPress={() => {
                  setStars(n);
                  haptics.selection();
                  setDone(true);
                  resolveReview(item.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${n}`}
              >
                <Icon name="star" size={24} color={n <= stars ? t.star : t.border} weight="fill" />
              </PressableScale>
            ))}
            <Text variant="caption" tone="subtle" style={styles.ratePrompt}>
              {tr('notifs.ratePrompt')}
            </Text>
          </View>
        ))}

      {item.action === 'reschedule' && (
        <View style={styles.inlineActions}>
          <Button
            label={tr('notifs.accept')}
            size="sm"
            fullWidth={false}
            onPress={() => remove(item.id)}
          />
          <Button
            label={tr('notifs.decline')}
            size="sm"
            variant="secondary"
            fullWidth={false}
            onPress={() => remove(item.id)}
          />
        </View>
      )}

      {item.action === 'payment' && (
        <Button
          label={tr('notifs.fixPayment')}
          size="sm"
          onPress={() => router.push(route('/payments'))}
        />
      )}
    </View>
  );
}

/** Preferences bottom sheet with per-type toggles + quiet hours. */
function NotificationPrefsSheet({
  open,
  onClose,
  tr,
}: {
  open: boolean;
  onClose: () => void;
  tr: (k: string, o?: Record<string, unknown>) => string;
}) {
  const t = useTokens();
  const styles = useMemo(() => makeStyles(t), [t]);
  const prefs = useNotificationPrefsStore();

  const rows: { key: PrefKey; label: string }[] = [
    { key: 'bookingUpdates', label: tr('notifs.prefBookings') },
    { key: 'chatMessages', label: tr('notifs.prefReminders') },
    { key: 'promotions', label: tr('notifs.prefOffers') },
    { key: 'email', label: tr('notifs.prefReviews') },
    { key: 'safetyAlerts', label: tr('notifs.prefSecurity') },
  ];

  return (
    <BottomSheet visible={open} onClose={onClose} title={tr('notifs.preferences')}>
      <View style={styles.prefsSheet}>
        {rows.map((r) => (
          <View key={r.key} style={[styles.prefRow, { borderBottomColor: t.border }]}>
            <Text variant="callout">{r.label}</Text>
            <Toggle
              value={prefs[r.key]}
              onChange={(v) => prefs.set(r.key, v)}
              accessibilityLabel={r.label}
            />
          </View>
        ))}
        <View style={styles.prefRow}>
          <Text variant="callout">{tr('notifs.quietHours')}</Text>
          <Toggle
            value={prefs.push}
            onChange={(v) => prefs.set('push', v)}
            accessibilityLabel={tr('notifs.quietHours')}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const tipStyles = StyleSheet.create({
  tip: {
    position: 'absolute',
    top: -30,
    right: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    zIndex: 20,
  },
});

const chipStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  count: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const makeStyles = (t: NovaTokens) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    sectionLabel: {
      paddingHorizontal: spacing.lg,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    dayHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xs },
    dayHeaderText: { fontWeight: '700' },
    rowWrap: {
      marginHorizontal: spacing.lg,
      borderRadius: radius.lg,
      overflow: 'hidden',
      marginBottom: spacing.xs,
    },
    rowActions: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
    },
    actionLeft: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingLeft: spacing.lg,
    },
    actionRight: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingRight: spacing.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      minHeight: 76,
    },
    proAvatar: {
      position: 'absolute',
      right: -4,
      bottom: -4,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: t.bg,
    },
    rowBody: { flex: 1, gap: 3 },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    rowTitle: { flex: 1 },
    bold: { fontWeight: '700' },
    unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
    inlineActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
      flexWrap: 'wrap',
    },
    codeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderStyle: 'dashed',
    },
    miniBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
    },
    stackBehind: {
      position: 'absolute',
      left: spacing.sm,
      right: spacing.sm,
      top: 6,
      bottom: -4,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
    },
    actionCard: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      gap: spacing.sm,
    },
    flex1: { flex: 1, gap: 2 },
    starRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    ratePrompt: { marginLeft: spacing.sm },
    empty: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing.xxl,
      paddingHorizontal: spacing.lg,
    },
    emptyTitle: { marginTop: spacing.md },
    undoBar: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      bottom: spacing.xxl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.lg,
    },
    prefsSheet: { gap: 0, paddingBottom: spacing.md },
    prefRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
  });
