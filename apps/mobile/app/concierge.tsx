import { useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, Text, Icon, IconButton, PressableScale, Chip } from '../src/components/ui';
import { useT, useMoney, useDirectionalStyles } from '../src/i18n';
import { providers as allProviders } from '../src/mocks';
import type { Provider } from '../src/mocks/types';
import { route } from '../src/lib/nav';
import { parseSmartQuery } from '../src/features/search/parser';
import { useColors, radius, spacing, shadow, type Palette } from '../src/theme';

const SUGGESTIONS: { label: string; query: string }[] = [
  { label: 'Cheapest…', query: 'cheapest cleaning' },
  { label: 'Soonest…', query: 'soonest available' },
  { label: 'Top rated', query: 'top rated pros' },
];

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  providers?: Provider[];
}

let counter = 0;
const nextId = () => `m${counter++}`;

/** Pick mock matches by keyword, applying the smart-parser sort when present. */
function matchProviders(query: string): Provider[] {
  const parsed = parseSmartQuery(query);
  const q = query.toLowerCase();
  const byCat = allProviders.filter((p) => q.includes(p.category));
  const pool = byCat.length > 0 ? [...byCat] : [...allProviders];
  if (parsed.sort === 'cheapest') {
    pool.sort((a, b) => a.priceFrom - b.priceFrom);
  } else if (parsed.sort === 'soonest') {
    pool.sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
  } else {
    pool.sort((a, b) => b.rating - a.rating);
  }
  return pool.slice(0, 3);
}

export default function ConciergeScreen() {
  const router = useRouter();
  const c = useColors();
  const t = useT();
  const money = useMoney();
  const dir = useDirectionalStyles();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const listRef = useRef<FlatList<Message>>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: nextId(), role: 'bot', text: t('concierge.greeting') },
  ]);
  const [draft, setDraft] = useState('');

  const send = (preset?: string) => {
    const text = (preset ?? draft).trim();
    if (!text) return;
    const userMsg: Message = { id: nextId(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'bot',
          text: t('concierge.foundIntro'),
          providers: matchProviders(text),
        },
      ]);
      listRef.current?.scrollToEnd({ animated: true });
    }, 600);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={{ gap: spacing.sm }}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.user : styles.bot,
            { alignSelf: isUser ? 'flex-end' : 'flex-start' },
          ]}
        >
          <Text variant="body" tone={isUser ? 'onPrimary' : 'default'}>
            {item.text}
          </Text>
        </View>
        {item.providers?.map((p) => (
          <PressableScale
            key={p.id}
            style={[styles.card, dir.row]}
            onPress={() => router.push(`/provider/${p.id}`)}
            accessibilityRole="button"
            accessibilityLabel={p.name}
          >
            <Image
              source={{ uri: p.photo }}
              style={styles.cardPhoto}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View style={styles.flex}>
              <Text variant="footnote" numberOfLines={1}>
                {p.name}
              </Text>
              <View style={styles.cardMeta}>
                <Icon name="star" size={16} color={c.brand.star} />
                <Text variant="caption">{p.rating.toFixed(1)}</Text>
                <Text variant="caption" tone="muted">
                  ·
                </Text>
                <Text variant="caption" tone="accent">
                  {money(p.priceFrom)}
                </Text>
              </View>
            </View>
            <PressableScale
              style={styles.bookBtn}
              onPress={() => router.push(route(`/booking/${p.id}`))}
              accessibilityRole="button"
              accessibilityLabel={t('common.bookThis')}
            >
              <Text variant="caption" tone="onPrimary" style={styles.bookText}>
                {t('common.bookThis')}
              </Text>
            </PressableScale>
          </PressableScale>
        ))}
      </View>
    );
  };

  return (
    <Screen padded={false} keyboardAvoiding>
      <View style={[styles.header, dir.row]}>
        <IconButton
          name="chevron-left"
          onPress={() => router.back()}
          accessibilityLabel={t('common.back')}
          variant="subtle"
          size={24}
        />
        <View style={styles.headerTitleWrap}>
          <View style={[styles.headerTitleRow, dir.row]}>
            <Icon name="sparkles" size={16} color={c.brand.primary} />
            <Text variant="title2">{t('concierge.title')}</Text>
          </View>
          <Text variant="caption" tone="muted">
            {t('concierge.subtitle')}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.suggestRow}>
        {SUGGESTIONS.map((s) => (
          <Chip key={s.label} label={s.label} onPress={() => send(s.query)} />
        ))}
      </View>

      <View style={[styles.inputBar, dir.row, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={t('concierge.placeholder')}
          placeholderTextColor={c.text.muted}
          style={[styles.input, dir.textAlign]}
          onSubmitEditing={() => send()}
          returnKeyType="send"
        />
        <PressableScale
          style={styles.sendBtn}
          onPress={() => send()}
          accessibilityRole="button"
          accessibilityLabel={t('common.continue')}
        >
          <Icon name="send" size={20} color={c.text.onBrand} />
        </PressableScale>
      </View>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    header: {
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerTitleWrap: { flex: 1 },
    headerTitleRow: { alignItems: 'center', gap: spacing.xs },
    headerSpacer: { width: 44 },
    list: { padding: spacing.lg },
    suggestRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    bubble: {
      maxWidth: '82%',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.xl,
    },
    bot: {
      backgroundColor: c.background.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderBottomLeftRadius: radius.sm,
    },
    user: { backgroundColor: c.brand.primary, borderBottomRightRadius: radius.sm },
    card: {
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.background.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.sm,
      ...shadow.soft,
    },
    cardPhoto: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: c.skeleton },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    bookBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
    },
    bookText: {
      fontWeight: '700',
    },
    inputBar: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.base,
    },
    input: {
      flex: 1,
      minHeight: 48,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: c.background.muted,
      color: c.text.primary,
    },
    sendBtn: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
