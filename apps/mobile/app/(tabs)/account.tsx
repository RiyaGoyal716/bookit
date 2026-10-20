import { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

import {
  Button,
  Icon,
  Icon3D,
  PressableScale,
  Text,
  Avatar,
  CollapsingHeader,
  LargeTitle,
  useScreenScroll,
  useTabBarInset,
} from '../../src/components/ui';
import { route } from '../../src/lib/nav';
import { haptics } from '../../src/lib/haptics';
import { useAuthStore } from '../../src/stores/authStore';
import { useBookingsStore } from '../../src/stores/bookingsStore';
import { useFavouritesStore } from '../../src/stores/favouritesStore';
import { usePlusStore } from '../../src/stores/plusStore';
import { useWalletStore } from '../../src/stores/walletStore';
import { useTokens, radius, spacing, type NovaTokens } from '../../src/theme';
import { useMoney, useT } from '../../src/i18n';
import type { Fluent3DKey } from '../../src/assets/3d';

type TintKey = 'coral' | 'sky' | 'success' | 'sunshine' | 'primary';

function tintColor(t: NovaTokens, key: TintKey): string {
  switch (key) {
    case 'coral':
      return t.coral;
    case 'sky':
      return t.sky;
    case 'success':
      return t.success;
    case 'sunshine':
      return t.sunshine;
    default:
      return t.primary;
  }
}

interface MoreRow {
  icon: Fluent3DKey;
  tint: TintKey;
  label: string;
  sub: string;
  href: string;
}

const AnimatedScrollView = Animated.ScrollView;

export default function AccountScreen() {
  const router = useRouter();
  const t = useTokens();
  const money = useMoney();
  const tr = useT();
  const tabInset = useTabBarInset();
  const { scrollY, onScroll } = useScreenScroll();
  const styles = useMemo(() => makeStyles(t), [t]);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const favCount = useFavouritesStore((s) => s.ids.length);
  const bookingCount = useBookingsStore((s) => s.bookings.length);
  const walletBalance = useWalletStore((s) => s.balance());
  const isPlus = usePlusStore((s) => s.subscribed);

  const version = Constants.expoConfig?.version ?? '1.0.0';

  const quickTiles: {
    icon: Fluent3DKey;
    tint: TintKey;
    label: string;
    href: string;
    badge?: number;
  }[] = [
    { icon: 'credit_card', tint: 'sky', label: tr('account.payments'), href: '/payments' },
    { icon: 'round_pushpin', tint: 'coral', label: tr('account.addresses'), href: '/addresses' },
    {
      icon: 'red_heart',
      tint: 'coral',
      label: tr('account.favourites'),
      href: '/favourites',
      badge: favCount,
    },
    { icon: 'shield', tint: 'success', label: tr('account.safety'), href: '/safety' },
  ];

  const moreRows: MoreRow[] = [
    {
      icon: 'briefcase',
      tint: 'sunshine',
      label: tr('account.becomePro'),
      sub: tr('account.becomeProSub'),
      href: '/pro',
    },
    {
      icon: 'bell',
      tint: 'coral',
      label: tr('account.notifications'),
      sub: tr('account.notificationsSub'),
      href: '/notifications',
    },
    {
      icon: 'page_facing_up',
      tint: 'sky',
      label: tr('account.policy'),
      sub: tr('account.policySub'),
      href: '/policies',
    },
    {
      icon: 'gear',
      tint: 'primary',
      label: tr('account.settings'),
      sub: tr('account.settingsSub'),
      href: '/settings',
    },
    {
      icon: 'speech_balloon',
      tint: 'success',
      label: tr('account.help'),
      sub: tr('account.helpSub'),
      href: '/help',
    },
    {
      icon: 'balance_scale',
      tint: 'sky',
      label: tr('account.legal'),
      sub: tr('account.legalSub'),
      href: '/legal',
    },
  ];

  const confirmLogout = () => {
    haptics.warning();
    Alert.alert(tr('account.logoutConfirmTitle'), tr('account.logoutConfirmBody'), [
      { text: tr('common.cancel'), style: 'cancel' },
      {
        text: tr('account.logout'),
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <CollapsingHeader title={tr('account.title')} scrollY={scrollY} />
      <AnimatedScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabInset }}
      >
        <View style={styles.topSpace}>
          <LargeTitle title={tr('account.title')} />
        </View>

        <View style={styles.body}>
          {/* 2. Profile hero */}
          <PressableScale
            style={styles.hero}
            onPress={() => router.push(route('/profile'))}
            accessibilityRole="button"
            accessibilityLabel={tr('account.editProfile')}
          >
            <View style={styles.heroTop}>
              <View>
                <Avatar name={user?.name ?? tr('account.guest')} uri={user?.avatar} size={64} />
                <View
                  style={[styles.editBadge, { backgroundColor: t.primary, borderColor: t.surface }]}
                >
                  <Icon name="edit" size={16} color={t.onPrimary} weight="fill" />
                </View>
              </View>
              <View style={styles.heroInfo}>
                <Text variant="title2">{user?.name ?? tr('account.guest')}</Text>
                <Text variant="footnote" tone="muted" tabular>
                  {user?.phone ?? '—'}
                </Text>
                <View
                  style={[
                    styles.plusChip,
                    { backgroundColor: isPlus ? t.sunshineSoft : t.primarySoft },
                  ]}
                >
                  <Icon
                    name="crown"
                    size={16}
                    color={isPlus ? t.star : t.textMuted}
                    weight="fill"
                  />
                  <Text variant="micro" style={styles.chipText}>
                    {isPlus ? tr('account.plusMember') : tr('account.joinPlus')}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color={t.textMuted} />
            </View>
            <View style={[styles.statsRow, { borderTopColor: t.border }]}>
              <Stat value={`${bookingCount}`} label={tr('account.bookings')} />
              <View style={[styles.statDivider, { backgroundColor: t.border }]} />
              <Stat value={`${favCount}`} label={tr('account.saved')} />
              <View style={[styles.statDivider, { backgroundColor: t.border }]} />
              <Stat value={tr('account.memberSinceValue')} label={tr('account.memberSince')} />
            </View>
          </PressableScale>

          {/* 3. Wallet strip */}
          <View style={[styles.wallet, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Icon3D name="coin" size={40} tint={t.sunshine} />
            <View style={styles.flex1}>
              <Text variant="footnote" tone="muted">
                {tr('account.walletBalance')}
              </Text>
              <AnimatedMoney value={walletBalance} format={money} />
            </View>
            <Button
              label={tr('account.topUp')}
              size="sm"
              fullWidth={false}
              onPress={() => router.push(route('/wallet'))}
            />
          </View>

          {/* 4. Quick tiles */}
          <View style={styles.tiles}>
            {quickTiles.map((q) => (
              <PressableScale
                key={q.label}
                style={styles.tile}
                onPress={() => router.push(route(q.href))}
                accessibilityRole="button"
                accessibilityLabel={q.label}
              >
                <View>
                  <Icon3D name={q.icon} size={40} tint={tintColor(t, q.tint)} />
                  {q.badge != null && q.badge > 0 ? (
                    <View
                      style={[styles.tileBadge, { backgroundColor: t.coral, borderColor: t.bg }]}
                    >
                      <Text variant="micro" style={styles.badgeText}>
                        {q.badge}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text variant="caption" numberOfLines={1}>
                  {q.label}
                </Text>
              </PressableScale>
            ))}
          </View>

          {/* 5. Promo cards */}
          <View style={styles.promos}>
            <PressableScale
              style={[styles.promo, { backgroundColor: t.sunshineSoft }]}
              onPress={() => router.push(route('/plus'))}
              accessibilityRole="button"
              accessibilityLabel={tr('account.plusTitle')}
            >
              <Icon3D name="crown" size={40} tint={t.sunshine} />
              <Text variant="headline">{tr('account.plusTitle')}</Text>
              <Text variant="caption" tone="muted">
                {tr('account.plusBody')}
              </Text>
            </PressableScale>
            <PressableScale
              style={[styles.promo, { backgroundColor: t.coralSoft }]}
              onPress={() => router.push(route('/referrals'))}
              accessibilityRole="button"
              accessibilityLabel={tr('account.referTitle')}
            >
              <Icon3D name="wrapped_gift" size={40} tint={t.coral} />
              <Text variant="headline">{tr('account.referTitle')}</Text>
              <Text variant="caption" tone="muted">
                {tr('account.referBody')}
              </Text>
            </PressableScale>
          </View>

          {/* 6. Grouped "More" */}
          <Text variant="footnote" tone="muted" style={styles.groupLabel}>
            {tr('account.more')}
          </Text>
          <View style={[styles.group, { backgroundColor: t.surface, borderColor: t.border }]}>
            {moreRows.map((row, i) => (
              <MoreRowItem
                key={row.href}
                row={row}
                last={i === moreRows.length - 1}
                tint={tintColor(t, row.tint)}
                onPress={() => router.push(route(row.href))}
              />
            ))}
          </View>

          {/* 7. Log out */}
          <PressableScale
            style={[styles.logoutRow, { backgroundColor: t.surface, borderColor: t.border }]}
            onPress={confirmLogout}
            haptic={null}
            accessibilityRole="button"
            accessibilityLabel={tr('account.logout')}
          >
            <Icon3D name="door" size={32} tint={t.coral} />
            <Text variant="headline" style={[styles.flex1, { color: t.danger }]}>
              {tr('account.logout')}
            </Text>
          </PressableScale>

          {/* 8. Version footer */}
          <PressableScale
            onLongPress={() => {
              haptics.medium();
              router.push(route('/dev/design-system'));
            }}
            haptic={null}
            style={styles.footer}
            accessibilityRole="button"
            accessibilityLabel={tr('account.version', { version })}
          >
            <Text variant="caption" tone="subtle">
              {tr('account.version', { version })}
            </Text>
          </PressableScale>
        </View>
      </AnimatedScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={statStyles.stat}>
      <Text variant="headline" tabular>
        {value}
      </Text>
      <Text variant="caption" tone="subtle">
        {label}
      </Text>
    </View>
  );
}

function MoreRowItem({
  row,
  last,
  tint,
  onPress,
}: {
  row: MoreRow;
  last: boolean;
  tint: string;
  onPress: () => void;
}) {
  const t = useTokens();
  return (
    <PressableScale
      style={[
        rowStyles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.border },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={row.label}
    >
      <Icon3D name={row.icon} size={32} tint={tint} />
      <View style={rowStyles.rowText}>
        <Text variant="callout">{row.label}</Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {row.sub}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color={t.textMuted} />
    </PressableScale>
  );
}

/** Lightweight count-up for the wallet balance (respects formatting). */
function AnimatedMoney({ value, format }: { value: number; format: (n: number) => string }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const duration = 600;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value]);
  return (
    <Text variant="title2" tabular>
      {format(display)}
    </Text>
  );
}

const makeStyles = (t: NovaTokens) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    topSpace: { paddingTop: spacing.xxl + spacing.lg },
    body: { paddingHorizontal: spacing.lg, gap: spacing.lg },
    flex1: { flex: 1 },
    badgeText: { color: '#FFFFFF', fontWeight: '700' },
    hero: {
      borderRadius: radius.lg,
      backgroundColor: t.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      padding: spacing.lg,
      gap: spacing.md,
    },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    heroInfo: { flex: 1, gap: 3 },
    editBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    plusChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.pill,
      marginTop: 2,
    },
    chipText: { fontWeight: '700' },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingTop: spacing.md,
    },
    statDivider: { width: StyleSheet.hairlineWidth, height: 28 },
    wallet: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
    },
    tiles: { flexDirection: 'row', gap: spacing.sm },
    tile: { flex: 1, alignItems: 'center', gap: spacing.xs },
    tileBadge: {
      position: 'absolute',
      top: -4,
      right: -6,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    promos: { flexDirection: 'row', gap: spacing.sm },
    promo: {
      flex: 1,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.xs,
    },
    groupLabel: { marginBottom: -spacing.sm, marginTop: spacing.xs, paddingHorizontal: spacing.xs },
    group: {
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: 'hidden',
    },
    logoutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
    },
    footer: { alignItems: 'center', paddingVertical: spacing.lg },
  });

const statStyles = StyleSheet.create({
  stat: { flex: 1, alignItems: 'center', gap: 2 },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 60,
    paddingHorizontal: spacing.md,
  },
  rowText: { flex: 1, gap: 1 },
});
